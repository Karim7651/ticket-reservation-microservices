import { Publisher,OrderCancelledEvent,Subjects } from "@ktickets2025/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
    
}