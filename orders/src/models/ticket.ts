//this is data replication of the ticket model from the tickets service
//we only need to replicate the fields we need for the order service
// NEVER USE A COMMON MODEL BETWEEN SERVICES AS WE'D ONLY REPLICATE WHAT WE NEED IN ORDERS SERVICE HERE


import mongoose from "mongoose";
import { Order,OrderStatus } from '../models/order';

interface TicketAttrs {
    title: string;
    price: number;

}
interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;

    isReserved(): Promise<boolean>; //available on every Doc
}
interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min:0
    },
    // userId: {
    //     type: String,
    //     required: true
    // }
},{
    toJSON: {
        transform(doc, ret:any) {
            ret.id = ret._id;
            delete ret._id;

        }
    }
})
//method related to the model
ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket(attrs);
}
//method related to the document
//never use an arrow function here as it will not bind 'this' to the document
ticketSchema.methods.isReserved = async function () {
    //this refers to the document
    //Make sure that this ticket is not already reserved
    //Run a query to look at all orders, Find an order where the ticket
    //is the ticket we just found AND the order status is not cancelled
    //if we did find an order from the query, then the ticket is reserved
    const existingOrder = await Order.findOne({
      ticket:this,
      status:{
        $in:[
          OrderStatus.Created,
          OrderStatus.AwaitingPayment,
          OrderStatus.Complete
        ]
      }
    })
   return !!existingOrder; //if null => true => false
   //if true => false => true
}
const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);
export  { Ticket,TicketDoc }; // Export types for use in other files