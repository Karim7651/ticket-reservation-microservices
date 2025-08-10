import { Subjects,Publisher,PaymentCreatedEvent } from "@ktickets2025/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
}
