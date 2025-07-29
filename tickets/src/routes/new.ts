import {
  currentUser,
  requireAuth,
  validateRequest,
} from '@ktickets2025/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
const router = express.Router();
//.isEmpty() makes sure the field is not empty && exists
router.post(
  '/api/tickets',
  [],
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body(''),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than 0'),
  ],
  validateRequest,
  (req: Request, res: Response) => {
    const { title, price } = req.body;

    const ticket = Ticket.build({
      title,
      price,
      userId: req.currentUser!.id, //requireAuth ensures currentUser is defined
    });
    ticket.save();

    res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };
