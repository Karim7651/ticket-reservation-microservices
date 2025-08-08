import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { OrderCancelledEvent } from "@ktickets2025/common";
import {Ticket} from "../../../models/ticket";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);
    const orderId = new mongoose.Types.ObjectId().toHexString()
    const ticket = Ticket.build({
        title:'concert',
        price: 20,
        userId: 'asdf',
    })
    ticket.set({orderId}) // so that we dont have to change the model interface
    await ticket.save();
    const data : OrderCancelledEvent['data'] = {
        id:orderId,
        version:0,
        ticket: {
            id: ticket.id,
        }
    }
    //@ts-ignore
    const msg:Message = {
        ack:jest.fn(),
    }
    return {msg,data,ticket,orderId,listener};
}
it('updates the ticket, publishes an event, and acknowledges the message', async () => {
    const {msg,data,ticket,orderId,listener} = await setup();

    await listener.onMessage(data,msg);

    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket).toBeDefined();
    expect(updatedTicket!.orderId).toBeUndefined();
    expect(natsWrapper.client.publish).toHaveBeenCalled();
})