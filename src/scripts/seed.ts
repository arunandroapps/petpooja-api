import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Plan } from '../models/Plan';
import { Distributor } from '../models/Distributor';
import { Owner } from '../models/Owner';
import { Restaurant } from '../models/Restaurant';
import { Category } from '../models/Category';
import { MenuItem } from '../models/MenuItem';
import { Table } from '../models/Table';
import { Customer } from '../models/Customer';
import { Ingredient } from '../models/Ingredient';
import { Staff } from '../models/Staff';
import { Order } from '../models/Order';
import { Ticket } from '../models/Ticket';

const URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/petpooja_platform';

async function seed() {
  await mongoose.connect(URI);
  console.log('✅ Connected to MongoDB');

  // Clear
  await Promise.all([
    User.deleteMany({}), Plan.deleteMany({}), Distributor.deleteMany({}),
    Owner.deleteMany({}), Restaurant.deleteMany({}), Category.deleteMany({}),
    MenuItem.deleteMany({}), Table.deleteMany({}), Customer.deleteMany({}),
    Ingredient.deleteMany({}), Staff.deleteMany({}), Order.deleteMany({}), Ticket.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // Plans
  const plans = await Plan.insertMany([
    { name:'Basic', tier:'basic', price:999, yearlyPrice:9990, maxRestaurants:1, maxStaff:5, color:'#6b7280', features:['POS & Billing','KOT','Menu Management','Basic Reports','Email Support'] },
    { name:'Pro', tier:'pro', price:2499, yearlyPrice:24990, maxRestaurants:5, maxStaff:25, color:'#f97316', features:['Everything in Basic','Multi-branch','Inventory','CRM & Loyalty','Advanced Analytics','Priority Support'] },
    { name:'Enterprise', tier:'enterprise', price:5999, yearlyPrice:59990, maxRestaurants:999, maxStaff:999, color:'#8b5cf6', features:['Everything in Pro','Unlimited branches','KDS','API Access','Dedicated Manager'] },
  ]);
  console.log(`✅ Plans: ${plans.length}`);

  // Superadmin
  await User.create({ name:'Super Admin', email:'admin@petpooja.com', password:'admin123', role:'superadmin', entityId:'superadmin' });

  // Distributor 1
  const dist1 = await Distributor.create({ name:'North India Partners', email:'north@petpooja.com', phone:'9100001111', region:'North India', state:'Delhi', commissionPct:10, status:'active', totalRevenue:4820000, commissionEarned:482000, userId:'pending' });
  const distUser1 = await User.create({ name:'North India Partners', email:'north@petpooja.com', password:'dist123', role:'distributor', entityId:dist1._id.toString() });
  dist1.userId = distUser1._id.toString(); await dist1.save();

  // Distributor 2
  const dist2 = await Distributor.create({ name:'West Zone Foods', email:'west@petpooja.com', phone:'9100002222', region:'West India', state:'Maharashtra', commissionPct:12, status:'active', totalRevenue:7340000, commissionEarned:880800, userId:'pending' });
  const distUser2 = await User.create({ name:'West Zone Foods', email:'west@petpooja.com', password:'dist123', role:'distributor', entityId:dist2._id.toString() });
  dist2.userId = distUser2._id.toString(); await dist2.save();

  const sub365End = new Date(); sub365End.setDate(sub365End.getDate() + 335);
  const sub30End = new Date(); sub30End.setDate(sub30End.getDate() + 30);

  // Owner 1 (Rajesh — Enterprise)
  const owner1 = await Owner.create({ name:'Rajesh Khanna', email:'rajesh@spiceroute.com', phone:'9200001111', businessName:'Spice Route Hospitality', gst:'27AAAAA0000A1Z5', city:'Mumbai', state:'Maharashtra', distributorId:dist2._id, planId:plans[2]._id, status:'active', subscriptionEnd:sub365End, userId:'pending' });
  const ownerUser1 = await User.create({ name:'Rajesh Khanna', email:'rajesh@spiceroute.com', password:'owner123', role:'owner', entityId:owner1._id.toString() });
  owner1.userId = ownerUser1._id.toString(); await owner1.save();

  // Owner 2 (Priya — Pro)
  const owner2 = await Owner.create({ name:'Priya Sharma', email:'priya@delhibites.com', phone:'9200002222', businessName:'Delhi Bites Pvt. Ltd.', city:'New Delhi', state:'Delhi', distributorId:dist1._id, planId:plans[1]._id, status:'active', subscriptionEnd:sub365End, userId:'pending' });
  const ownerUser2 = await User.create({ name:'Priya Sharma', email:'priya@delhibites.com', password:'owner123', role:'owner', entityId:owner2._id.toString() });
  owner2.userId = ownerUser2._id.toString(); await owner2.save();

  console.log('✅ Distributors & Owners created');

  // Restaurants
  const rst1 = await Restaurant.create({ ownerId:owner1._id, name:'Spice Route — Bandra', type:'Fine Dining', phone:'022-40001111', address:'SV Road, Bandra West', city:'Mumbai', gstin:'27AAAAA0000A1Z5', status:'active' });
  await User.create({ name:'Vikram Joshi', email:'manager@spiceroute.com', password:'rest123', role:'restaurant', entityId:rst1._id.toString() });

  const rst2 = await Restaurant.create({ ownerId:owner1._id, name:'Spice Route — Andheri', type:'Fine Dining', phone:'022-40002222', address:'Link Road, Andheri West', city:'Mumbai', status:'active' });
  await User.create({ name:'Andheri Manager', email:'andheri@spiceroute.com', password:'rest123', role:'restaurant', entityId:rst2._id.toString() });

  const rst3 = await Restaurant.create({ ownerId:owner2._id, name:'Delhi Bites — CP', type:'Casual Dining', phone:'011-40005555', address:'Connaught Place, Block B', city:'New Delhi', status:'active' });
  await User.create({ name:'Delhi CP Manager', email:'manager@delhibites.com', password:'rest123', role:'restaurant', entityId:rst3._id.toString() });

  console.log('✅ Restaurants created');

  // Categories + Menu for rst1
  const cats = await Category.insertMany([
    { restaurantId:rst1._id, name:'Starters', color:'#fb923c', sortOrder:1 },
    { restaurantId:rst1._id, name:'Main Course', color:'#f97316', sortOrder:2 },
    { restaurantId:rst1._id, name:'Breads', color:'#fbbf24', sortOrder:3 },
    { restaurantId:rst1._id, name:'Rice & Biryani', color:'#facc15', sortOrder:4 },
    { restaurantId:rst1._id, name:'Beverages', color:'#06b6d4', sortOrder:5 },
    { restaurantId:rst1._id, name:'Desserts', color:'#ec4899', sortOrder:6 },
  ]);

  const menuItems = await MenuItem.insertMany([
    { restaurantId:rst1._id, categoryId:cats[0]._id, name:'Paneer Tikka', price:280, tax:5, veg:true, available:true, description:'Marinated cottage cheese grilled in tandoor' },
    { restaurantId:rst1._id, categoryId:cats[0]._id, name:'Chicken Wings', price:320, tax:5, veg:false, available:true },
    { restaurantId:rst1._id, categoryId:cats[0]._id, name:'Veg Spring Roll', price:180, tax:5, veg:true, available:true },
    { restaurantId:rst1._id, categoryId:cats[1]._id, name:'Paneer Butter Masala', price:320, tax:5, veg:true, available:true },
    { restaurantId:rst1._id, categoryId:cats[1]._id, name:'Butter Chicken', price:380, tax:5, veg:false, available:true },
    { restaurantId:rst1._id, categoryId:cats[1]._id, name:'Dal Makhani', price:240, tax:5, veg:true, available:true },
    { restaurantId:rst1._id, categoryId:cats[1]._id, name:'Mutton Rogan Josh', price:460, tax:5, veg:false, available:true },
    { restaurantId:rst1._id, categoryId:cats[2]._id, name:'Butter Naan', price:50, tax:5, veg:true, available:true },
    { restaurantId:rst1._id, categoryId:cats[2]._id, name:'Garlic Naan', price:70, tax:5, veg:true, available:true },
    { restaurantId:rst1._id, categoryId:cats[3]._id, name:'Chicken Biryani', price:320, tax:5, veg:false, available:true },
    { restaurantId:rst1._id, categoryId:cats[3]._id, name:'Veg Biryani', price:260, tax:5, veg:true, available:true },
    { restaurantId:rst1._id, categoryId:cats[4]._id, name:'Masala Chai', price:40, tax:5, veg:true, available:true },
    { restaurantId:rst1._id, categoryId:cats[4]._id, name:'Cold Coffee', price:140, tax:5, veg:true, available:true },
    { restaurantId:rst1._id, categoryId:cats[5]._id, name:'Gulab Jamun', price:90, tax:5, veg:true, available:true },
    { restaurantId:rst1._id, categoryId:cats[5]._id, name:'Choco Lava Cake', price:180, tax:5, veg:true, available:true },
  ]);
  console.log(`✅ Menu: ${menuItems.length} items`);

  // Tables
  await Table.insertMany([
    { restaurantId:rst1._id, name:'T1', area:'Indoor', seats:2, status:'free' },
    { restaurantId:rst1._id, name:'T2', area:'Indoor', seats:2, status:'free' },
    { restaurantId:rst1._id, name:'T3', area:'Indoor', seats:4, status:'free' },
    { restaurantId:rst1._id, name:'T4', area:'Indoor', seats:4, status:'free' },
    { restaurantId:rst1._id, name:'T5', area:'Indoor', seats:6, status:'free' },
    { restaurantId:rst1._id, name:'T6', area:'Outdoor', seats:4, status:'free' },
    { restaurantId:rst1._id, name:'T7', area:'Outdoor', seats:4, status:'free' },
    { restaurantId:rst1._id, name:'P1', area:'Private', seats:10, status:'free' },
  ]);

  // Customers
  const customers = await Customer.insertMany([
    { restaurantId:rst1._id, name:'Arjun Mehta', phone:'9876500001', loyaltyPoints:240, visits:14, totalSpent:18400, lastVisit:new Date() },
    { restaurantId:rst1._id, name:'Kavitha Reddy', phone:'9876500002', loyaltyPoints:80, visits:5, totalSpent:6200 },
    { restaurantId:rst1._id, name:'Farhan Sheikh', phone:'9876500003', loyaltyPoints:540, visits:30, totalSpent:41000, lastVisit:new Date() },
  ]);

  // Inventory
  await Ingredient.insertMany([
    { restaurantId:rst1._id, name:'Paneer', unit:'kg', stock:8, minStock:5, costPerUnit:320 },
    { restaurantId:rst1._id, name:'Chicken', unit:'kg', stock:12, minStock:6, costPerUnit:240 },
    { restaurantId:rst1._id, name:'Basmati Rice', unit:'kg', stock:25, minStock:10, costPerUnit:110 },
    { restaurantId:rst1._id, name:'Tomato', unit:'kg', stock:4, minStock:8, costPerUnit:40 },
    { restaurantId:rst1._id, name:'Butter', unit:'kg', stock:3, minStock:4, costPerUnit:480 },
    { restaurantId:rst1._id, name:'Cooking Oil', unit:'L', stock:22, minStock:10, costPerUnit:140 },
  ]);

  // Staff
  await Staff.insertMany([
    { restaurantId:rst1._id, name:'Vikram Joshi', role:'manager', phone:'9300001111', pin:'1234', active:true },
    { restaurantId:rst1._id, name:'Sunita Patel', role:'cashier', phone:'9300002222', pin:'2345', active:true },
    { restaurantId:rst1._id, name:'Ravi Kumar', role:'waiter', phone:'9300003333', pin:'3456', active:true },
    { restaurantId:rst1._id, name:'Anita Singh', role:'chef', phone:'9300004444', pin:'4567', active:true },
  ]);

  // Seed 7-day orders
  const types = ['dine-in','takeaway','delivery','online'] as const;
  const pays = ['cash','card','upi','wallet'] as const;
  let orderNum = 1001;
  const now = new Date();

  for (let d = 6; d >= 0; d--) {
    const cnt = 5 + Math.floor(Math.random() * 8);
    for (let i = 0; i < cnt; i++) {
      const itemCount = 1 + Math.floor(Math.random() * 3);
      const selectedItems = [];
      let subtotal = 0;
      for (let j = 0; j < itemCount; j++) {
        const m = menuItems[Math.floor(Math.random() * menuItems.length)];
        const qty = 1 + Math.floor(Math.random() * 2);
        selectedItems.push({ menuItemId:m._id, name:m.name, price:m.price, qty, status:'served' as const });
        subtotal += m.price * qty;
      }
      const taxAmount = Math.round(subtotal * 0.05);
      const createdAt = new Date(now); createdAt.setDate(createdAt.getDate() - d); createdAt.setHours(Math.floor(Math.random()*14)+8, Math.floor(Math.random()*60));
      await Order.create({ restaurantId:rst1._id, number:orderNum++, type:types[Math.floor(Math.random()*types.length)], items:selectedItems, status:'completed', payment:pays[Math.floor(Math.random()*pays.length)], subtotal, discount:0, taxAmount, total:subtotal+taxAmount, createdAt, updatedAt:createdAt });
    }
  }
  console.log(`✅ Orders: ${orderNum - 1001}`);

  // Tickets
  await Ticket.insertMany([
    { from:'restaurant', fromName:'Spice Route Bandra', subject:'Printer not connecting', message:'KOT printer not working after update.', status:'open' },
    { from:'owner', fromName:'Rajesh Khanna', subject:'Need to upgrade plan', message:'Want to add 2 more branches under Enterprise.', status:'in-progress' },
    { from:'distributor', fromName:'West Zone Foods', subject:'Commission payout query', message:'March commission not received.', status:'open' },
  ]);

  console.log('\n🎉 Seed complete! Demo credentials:');
  console.log('   Superadmin → admin@petpooja.com / admin123');
  console.log('   Distributor → north@petpooja.com / dist123');
  console.log('   Distributor → west@petpooja.com / dist123');
  console.log('   Owner → rajesh@spiceroute.com / owner123');
  console.log('   Owner → priya@delhibites.com / owner123');
  console.log('   Restaurant → manager@spiceroute.com / rest123');
  console.log('   Restaurant → andheri@spiceroute.com / rest123');
  console.log('   Restaurant → manager@delhibites.com / rest123');

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
