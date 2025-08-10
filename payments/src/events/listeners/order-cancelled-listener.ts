import { OrderCancelledEvent,Subjects,Listener,OrderStatus } from "@ktickets2025/common";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";
import { Message } from "node-nats-streaming";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        //finding the last version isn't necessary but it is future proof (new features)
        const order = await Order.findOne({ _id: data.id ,version:data.version-1});
        if (!order) {
            throw new Error('Order not found');
        }
        order.set({ status: OrderStatus.Cancelled });
        await order.save();
        
        msg.ack();
    }
}