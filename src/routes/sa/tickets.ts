import { Router } from 'express';
import { Ticket } from '../../models/Ticket';

const router = Router();

router.get('/', async (req, res) => {
  const filter: any = {};
  if (req.query.status) filter.status = req.query.status;
  const tickets = await Ticket.find(filter).sort({ createdAt: -1 });
  res.json(tickets);
});

router.post('/', async (req, res) => {
  const ticket = await Ticket.create(req.body);
  res.status(201).json(ticket);
});

router.patch('/:id', async (req, res) => {
  const t = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!t) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(t);
});

router.patch('/:id/resolve', async (req, res) => {
  const t = await Ticket.findByIdAndUpdate(req.params.id, { status: 'resolved', reply: req.body.reply }, { new: true });
  res.json(t);
});

export default router;
