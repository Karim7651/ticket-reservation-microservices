import { Listener, OrderCreatedEvent, Subjects } from '@ktickets2025/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { expirationQueue } from '../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(
    data: OrderCreatedEvent['data'],
    msg: Message
  ): Promise<void> {
    const delay = new Date(data.expiresAt as string).getTime() - Date.now();
    console.log('waiting for ...', delay);
    //add to bull queue
    await expirationQueue.add(
      {
        orderId: data.id,
      },
      {
        delay,
      }
    );
    msg.ack();
  }
}
