import { Listener, OrderStatus } from '@ktickets2025/common';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledEvent } from '@ktickets2025/common';
import { Order } from '../../../models/order';
import mongoose from 'mongoose';
import { OrderCancelledListener } from '../order-cancelled-listener';
const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
  });
  await order.save();

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: 1,
    ticket: {
      id: 'sdfasdfasdf',
    },
  };
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg,order };
};



it('updates the status of the order',async()=>{
    const {listener,data,msg,order} = await setup()
    await listener.onMessage(data,msg) 

    const updatedOrder = await Order.findById(order.id)
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('acks the msg',async()=>{
    const {listener,data,msg,order} = await setup()
    await listener.onMessage(data,msg) 
    expect(msg.ack).toHaveBeenCalled()
})