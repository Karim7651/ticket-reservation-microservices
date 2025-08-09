import {ExpirationCompleteListener} from '../expiration-complete-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/order';
import { Ticket } from '../../../models/ticket';
import mongoose from 'mongoose';
import { OrderStatus } from '../../../models/order';
import { Message } from 'node-nats-streaming';
import { ExpirationCompleteEvent } from '@ktickets2025/common';
import ts from 'typescript';

const setup = async()=>{
    const listener = new ExpirationCompleteListener(natsWrapper.client);
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title:'concert',
        price:30,

    })
    await ticket.save()

    const order = Order.build({
        status:OrderStatus.Created,
        expiresAt: new Date(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        ticket
    })
    await order.save();

    const data : ExpirationCompleteEvent['data'] = {
        orderId: order.id
    }
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    } 
    return {listener, order,ticket,data,msg}
}

it('updates the order status to cancelled',async()=>{
    const {listener,order,data,msg} = await setup()
    await listener.onMessage(data,msg)

    const updatedOrder = await Order.findById(order.id)
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);

})

it('emit an OrderCancelled event',async()=>{
    const {listener,order,data,msg} = await setup()
    await listener.onMessage(data,msg)
    expect(natsWrapper.client.publish).toHaveBeenCalled();
    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])
    expect(eventData.id).toEqual(order.id)

})

it('acks the ordercancelled event ',async()=>{
    const {listener,data,msg} = await setup()
    await listener.onMessage(data,msg)
    expect(msg.ack).toHaveBeenCalled();
})