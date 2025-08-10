import { Listener, Subjects, OrderCreatedEvent } from '@ktickets2025/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const { id, userId, status, version } = data;
    const price = data.ticket.price;
    const order = Order.build({
      id,
      userId,
      status,
      price,
      version,
    });

    await order.save();
    msg.ack();
  }
}
