import mongoose from "mongoose";
import { OrderStatus } from "@ktickets2025/common";
import { TicketDoc } from "./ticket";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
export {OrderStatus}
//create required
interface OrderAttrs{
  ticket: TicketDoc;
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
}
//what actually ends up being on the order
interface OrderDoc extends mongoose.Document {
    ticket: TicketDoc;
    version: number; //added by the plugin
    userId: string;
    status: OrderStatus;
    expiresAt: Date;
}
//add bulld method to allow ts to show us what attributes are required to create an order
interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema({
    userId:{
        type: String,
        required: true
    }
    ,
    status: {
        type: String,   
        required: true,
        enum: Object.values(OrderStatus), 
        default:OrderStatus.Created
    },
    expiresAt: {
        type: mongoose.Schema.Types.Date,
        //required: true
    },
    ticket:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
        required: true
    }
},{
    toJSON: {
        transform(doc, ret:any) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
})
orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
    return new Order(attrs);
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);
export {Order}