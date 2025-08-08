import { Publisher,OrderCreatedEvent,Subjects } from "@ktickets2025/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    
}