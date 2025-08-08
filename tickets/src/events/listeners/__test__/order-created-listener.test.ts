import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';
import { OrderCreatedEvent, OrderStatus } from '@ktickets2025/common';

import mongoose from 'mongoose';
const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);
  const userId = new mongoose.Types.ObjectId().toHexString()
  const ticket = Ticket.build({
    title: 'concert',
    price: 99,
    userId,
  });
  await ticket.save()
  //create fake data event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId,
    expiresAt: new Date().toISOString(),
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };
  //@ts-ignore
  const msg : Message = {
    ack: jest.fn(),
  }
  return {ticket,data, msg, listener};
};
it('sets the user id of the ticket', async () => {
  const { ticket, data, msg, listener } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.userId).toEqual(data.userId);
});
it('acks the message',async()=>{
  const { ticket, data, msg, listener } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
})
it('publishes a ticket updated event',async()=>{
  const { ticket, data, msg, listener } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled(); 

});