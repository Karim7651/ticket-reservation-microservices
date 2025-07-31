import { requireAuth, validateRequest } from '@ktickets2025/common';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';

import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { natsWrapper } from '../nats-wrapper';
const router = express.Router();
//.isEmpty() makes sure the field is not empty && exists
router.post(
  '/api/tickets',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body(''),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;

    const ticket = Ticket.build({
      title,
      price,
      userId: req.currentUser!.id, //requireAuth ensures currentUser is defined
    });
    await ticket.save();
    //publish an event, using natsWrapper getter
    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });
    res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };
