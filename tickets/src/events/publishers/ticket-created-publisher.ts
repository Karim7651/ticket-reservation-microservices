import { Publisher,Subjects,TicketCreatedEvent } from "@ktickets2025/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;

}
//new TicketCreatedPublisher().publish({
//   id: '123',
//   title: 'concert',
//   price: 20,
//   userId: '456',
// });