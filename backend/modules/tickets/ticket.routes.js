const express = require('express');
const router = express.Router();
const TicketController = require('./ticket.controller');
const { createTicketValidator, updateTicketValidator, createReplyValidator } = require('./ticket.validator');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

// Protected routes
router.use(authenticate);

router.get('/', TicketController.getTickets);
router.get('/:id', TicketController.getTicketById);
router.post('/', validate(createTicketValidator), TicketController.createTicket);
router.put('/:id', authorize(['admin', 'inspector', 'technician']), validate(updateTicketValidator), TicketController.updateTicket);
router.post('/:id/claim', authorize(['admin', 'technician']), TicketController.claimTicket);

// Ticket replies
router.get('/:id/replies', TicketController.getTicketReplies);
router.post('/:id/replies', validate(createReplyValidator), TicketController.createReply);

// Admin only
router.delete('/:id', authorize(['admin']), TicketController.deleteTicket);

module.exports = router;
