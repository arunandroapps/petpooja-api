"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Ticket_1 = require("../../models/Ticket");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    const filter = {};
    if (req.query.status)
        filter.status = req.query.status;
    const tickets = await Ticket_1.Ticket.find(filter).sort({ createdAt: -1 });
    res.json(tickets);
});
router.post('/', async (req, res) => {
    const ticket = await Ticket_1.Ticket.create(req.body);
    res.status(201).json(ticket);
});
router.patch('/:id', async (req, res) => {
    const t = await Ticket_1.Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!t) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    res.json(t);
});
router.patch('/:id/resolve', async (req, res) => {
    const t = await Ticket_1.Ticket.findByIdAndUpdate(req.params.id, { status: 'resolved', reply: req.body.reply }, { new: true });
    res.json(t);
});
exports.default = router;
