import { Publisher,Subjects, TicketUpdatedEvent } from "@ktickets2025/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;

}