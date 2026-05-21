import { Router } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { Order } from '../../models/Order';
import { Table } from '../../models/Table';
import { Customer } from '../../models/Customer';
import { Restaurant } from '../../models/Restaurant';
import { nextOrderNumber } from '../../utils/orderNumber';
import { Types } from 'mongoose';

const router = Router();
const rstId = (req: AuthRequest) => new Types.ObjectId(req.user!.entityId);

// GET /api/rst/orders — list with filters
router.get('/', async (req: AuthRequest, res) => {
  const filter: any = { restaurantId: rstId(req) };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.type) filter.type = req.query.type;
  if (req.query.payment) filter.payment = req.query.payment;
  if (req.query.date) {
    const d = new Date(req.query.date as string);
    const next = new Date(d); next.setDate(next.getDate() + 1);
    filter.createdAt = { $gte: d, $lt: next };
  }
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('tableId', 'name area').populate('customerId', 'name phone'),
    Order.countDocuments(filter),
  ]);
  res.json({ orders, total, page, pages: Math.ceil(total / limit) });
});

// GET /api/rst/orders/active — for KOT/KDS
router.get('/active', async (req: AuthRequest, res) => {
  const orders = await Order.find({ restaurantId: rstId(req), status: { $in: ['pending', 'preparing', 'ready'] } })
    .sort({ createdAt: 1 }).populate('tableId', 'name');
  res.json(orders);
});

// GET /api/rst/orders/:id
router.get('/:id', async (req: AuthRequest, res) => {
  const order = await Order.findOne({ _id: req.params.id, restaurantId: rstId(req) }).populate('tableId customerId');
  if (!order) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(order);
});

// POST /api/rst/orders — place order (Pay Now)
router.post('/', async (req: AuthRequest, res) => {
  const { type, tableId, customerId, items, discount = 0, notes, payment = 'unpaid' } = req.body;
  if (!items?.length) { res.status(400).json({ error: 'No items' }); return; }

  const rst = await Restaurant.findById(rstId(req));
  const taxRate = rst?.settings?.defaultTax ?? 5;
  const subtotal = items.reduce((a: number, it: any) => a + it.price * it.qty, 0);
  const afterDiscount = Math.max(0, subtotal - discount);
  const taxAmount = Math.round(afterDiscount * taxRate / 100);
  const total = afterDiscount + taxAmount;
  const number = await nextOrderNumber(rstId(req));

  const order = await Order.create({
    restaurantId: rstId(req),
    number, type, tableId, customerId,
    items: items.map((it: any) => ({ ...it, status: payment !== 'unpaid' ? 'served' : 'new' })),
    status: payment !== 'unpaid' ? 'completed' : 'pending',
    payment, subtotal, discount, taxAmount, total, notes,
    servedBy: req.user!._id,
  });

  // Free table on checkout
  if (tableId && payment !== 'unpaid') {
    await Table.findByIdAndUpdate(tableId, { status: 'cleaning', currentOrderId: undefined });
  } else if (tableId) {
    await Table.findByIdAndUpdate(tableId, { status: 'occupied', currentOrderId: order._id });
  }

  // Update customer loyalty
  if (customerId && payment !== 'unpaid') {
    const loyaltyPct = rst?.settings?.loyaltyPercent ?? 2;
    await Customer.findByIdAndUpdate(customerId, {
      $inc: { visits: 1, totalSpent: total, loyaltyPoints: Math.floor(total * loyaltyPct / 100) },
      $set: { lastVisit: new Date() },
    });
  }

  res.status(201).json(order);
});

// PATCH /api/rst/orders/:id/status
router.patch('/:id/status', async (req: AuthRequest, res) => {
  const { status } = req.body;
  const order = await Order.findOneAndUpdate({ _id: req.params.id, restaurantId: rstId(req) }, { status }, { new: true });
  if (!order) { res.status(404).json({ error: 'Not found' }); return; }
  if (status === 'cancelled') {
    await Table.findOneAndUpdate({ currentOrderId: order._id }, { status: 'free', currentOrderId: undefined });
  }
  res.json(order);
});

// PATCH /api/rst/orders/:id/pay
router.patch('/:id/pay', async (req: AuthRequest, res) => {
  const { payment } = req.body;
  const order = await Order.findOne({ _id: req.params.id, restaurantId: rstId(req) });
  if (!order) { res.status(404).json({ error: 'Not found' }); return; }
  order.payment = payment;
  order.status = 'completed';
  await order.save();
  await Table.findOneAndUpdate({ currentOrderId: order._id }, { status: 'cleaning', currentOrderId: undefined });
  const rst = await Restaurant.findById(rstId(req));
  if (order.customerId) {
    const loyaltyPct = rst?.settings?.loyaltyPercent ?? 2;
    await Customer.findByIdAndUpdate(order.customerId, {
      $inc: { visits: 1, totalSpent: order.total, loyaltyPoints: Math.floor(order.total * loyaltyPct / 100) },
      $set: { lastVisit: new Date() },
    });
  }
  res.json(order);
});

// PATCH /api/rst/orders/:id/items/:itemId
router.patch('/:id/items/:itemId', async (req: AuthRequest, res) => {
  const order = await Order.findOne({ _id: req.params.id, restaurantId: rstId(req) });
  if (!order) { res.status(404).json({ error: 'Not found' }); return; }
  const item = order.items.find((it: any) => it._id.toString() === req.params.itemId);
  if (item) item.status = req.body.status;
  await order.save();
  res.json(order);
});

// POST /api/rst/orders/:id/items — add items to existing order
router.post('/:id/items', async (req: AuthRequest, res) => {
  const order = await Order.findOne({ _id: req.params.id, restaurantId: rstId(req) });
  if (!order) { res.status(404).json({ error: 'Not found' }); return; }
  const { items } = req.body;
  order.items.push(...items.map((it: any) => ({ ...it, status: 'new' })));
  const subtotal = order.items.reduce((a: number, it: any) => a + it.price * it.qty, 0);
  const afterDiscount = Math.max(0, subtotal - order.discount);
  order.subtotal = subtotal;
  order.taxAmount = Math.round(afterDiscount * 5 / 100);
  order.total = afterDiscount + order.taxAmount;
  await order.save();
  res.json(order);
});

export default router;
