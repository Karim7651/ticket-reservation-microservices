import { TicketUpdatedListener } from '../ticket-updated-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import mongoose from 'mongoose';
import { TicketUpdatedEvent } from '@ktickets2025/common';
import { Message } from 'node-nats-streaming';
const setup = async () => {
  //create a listener instance
  const listener = new TicketUpdatedListener(natsWrapper.client);
  //create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();
  //create a fake data obj
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'concert updated',
    price: 30,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };
  //create a fake message object
  // @ts-ignore //ts won't complain about the msg object
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg, ticket };
};
it('finds, update and saves a ticket', async () => {
  const { listener, data, msg, ticket } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket).toBeDefined();
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});
it('acks the message', async () => {
  const { listener, data, msg, ticket } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
it("doesn't ack the msg if the event has a future version", async () => {
  const { listener, data, msg, ticket } = await setup();

  data.version = 10; // set a future version
  try {
    await listener.onMessage(data, msg);
  } catch (err) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
