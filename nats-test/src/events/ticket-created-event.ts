import { Subjects } from "./subjects";
// This file defines the structure of the TicketCreated event's data & subject.
export interface TicketCreatedEvent {
  subject: Subjects.TicketCreated;
  data: {
    id: string;
    title: string;
    price: number;
  };
}