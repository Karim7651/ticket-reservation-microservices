// charge user VI
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
  NotAuthorizedError,
  OrderStatus,
} from '@ktickets2025/common';
import { Order } from '../models/order';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/payments',
  requireAuth,
  [
    body('token').not().isEmpty().withMessage('Token must be provided'),
    body('orderId').not().isEmpty().withMessage('orderId must be provided'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError();
    }

    // Make sure user owns this order
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    // Make sure order is not cancelled
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Cannot pay for a cancelled order');
    }

    // Convert token to PaymentMethod
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: { token },
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.price * 100,
      currency: 'usd',
      payment_method: paymentMethod.id,
      confirm: true,
      description: `Payment for order ${order.id}`,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    });
    const payment = Payment.build({
      orderId: order.id,
      stripeId: paymentIntent.id, 
    });
    await payment.save();
    new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId:order.id,
    })
    res.send({ success: true, paymentIntent });
  }
);

export { router as createChargeRouter };
