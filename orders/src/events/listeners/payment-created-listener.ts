import { Subjects, Listener, PaymentCreatedEvent } from '@ktickets2025/common';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';
import { OrderStatus } from '@ktickets2025/common';
import { Message } from 'node-nats-streaming';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: PaymentCreatedEvent['data'],msg:Message) {
    const order = await Order.findById(data.orderId);
    if(!order){
        throw new Error('Order not found')
    }
    order.set({
        status:OrderStatus.Complete
    })
    msg.ack()
  }
}
