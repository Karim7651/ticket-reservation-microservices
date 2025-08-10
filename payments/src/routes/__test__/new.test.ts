import {app} from '../../app';
import request from 'supertest';
import mongoose from 'mongoose';
import { Order } from '../../models/order';
import { OrderStatus } from '@ktickets2025/common';
import { stripe } from '../../stripe';
jest.mock('../../stripe');

it('return a 404 when paying for an order that doesn\'t exist', async () => {
  const response = await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'tok_visa',
      orderId: new mongoose.Types.ObjectId().toHexString(),
    });

  expect(response.status).toEqual(404);
});

it('return a 401 when paying for an order that doesn\'t belong to t his user', async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId : new mongoose.Types.ObjectId().toHexString(),
        version : 0,
        price:20,
        status: OrderStatus.Created,
    })
    await order.save();

    await request(app).post('/api/payments').set('Cookie', global.signin()).send({
        token: 'tok_visa',
        orderId: order.id
    }).expect(401);
})
it('return a 400 when paying for a cancelled order', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId : userId,
        version : 0,
        price:20,
        status: OrderStatus.Cancelled,
    })
    await order.save();

    await request(app).post('/api/payments').set('Cookie', global.signin(userId)).send({
        token: 'tok_visa',
        orderId: order.id
    }).expect(400);
})

