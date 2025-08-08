import { Message } from 'node-nats-streaming';
import { Listener, Subjects, TicketCreatedEvent } from '@ktickets2025/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';
export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    const { id, title, price } = data;
    const ticket = Ticket.build({
      id, // make sure to give it same id as ticket in tickets service
      title,
      price,
    });
    await ticket.save();
    msg.ack();//everythingk is fine, acknowledge the message
  }
}
