import { Subjects,Publisher,ExpirationCompleteEvent } from "@ktickets2025/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
}
