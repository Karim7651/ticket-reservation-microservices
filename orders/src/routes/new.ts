import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import { BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@ktickets2025/common';
import { body } from 'express-validator';

import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { natsWrapper } from '../nats-wrapper';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
export const EXPIRATION_WINDOW_SECONDS = 15 * 60; //15 minutes => environment variable is better for this
const router = express.Router();

router.post(
  '/api/orders',
  requireAuth,
  [
    body('ticketId')
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('Ticket ID is required'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    //Find the ticket the user is trying to order
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    //Make sure that this ticket is not already reserved
    //Run a query to look at all orders, Find an order where the ticket
    //is the ticket we just found AND the order status is not cancelled
    //if we did find an order from the query, then the ticket is reserved
    const isReserved = await ticket.isReserved();
    
    if (isReserved) {
      throw new BadRequestError('Ticket is already reserved');  
    }

    //Calculate an expiration date for this order now + 15 minutes
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);
    //Build the order and save it to the database
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket
    });
    await order.save();
    //Emit an event saying that an order was created (ticketsService locks the ticket (prevents editing price))
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id:order.id,
      version: order.version,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(), //UTC format
      ticket:{
        id: ticket.id,
        price: ticket.price
      }
    })
    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
