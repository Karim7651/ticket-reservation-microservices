import { Listener,Subjects,ExpirationCompleteEvent } from "@ktickets2025/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";
import { OrderStatus } from "@ktickets2025/common";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";


export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
    queueGroupName = queueGroupName;

    async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
        const order = await Order.findById(data.orderId);
        if (!order) {
            throw new Error('Order not found');
        }
        // Mark the order as expired
        order.set({ 
            status: OrderStatus.Cancelled, //unlock ticket since order is cancelled
            
        });
        await order.save();
        await new OrderCancelledPublisher(this.client).publish({ //await before acking the msg
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id
            }
        });
        //order:cacelled event
        msg.ack();
    }
}