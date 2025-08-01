import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { OrderStatus } from '../../models/order';
it('return an error if the ticket does not exist', async () => {
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    await request(app).post('/api/orders').set('Cookie',global.signin()).send({ticketId}).expect(404)
})

it('return an error if the ticket is already reserved', async () => {
    const ticket = Ticket.build({
        title:"concert",
        price: 20,
    })
    await ticket.save();
    const order = Order.build({
        userId: 'dfgsdfghsdf',
        status: OrderStatus.Created,
        ticket,
        expiresAt: new Date()
    });
    await order.save();
    await request(app).post('/api/orders').set('Cookie',global.signin()).send({ticketId:ticket.id}).expect(400);
})
it('reserves a ticket', async () => {
    const ticket = Ticket.build({
        title:"concert",
        price: 20,
    })
    await ticket.save();
    await request(app).post('/api/orders').set('Cookie',global.signin()).send({ticketId:ticket.id}).expect(201);
    
})

it.todo("emits an order created event");