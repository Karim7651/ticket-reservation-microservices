//this is data replication of the ticket model from the tickets service
//we only need to replicate the fields we need for the order service
// NEVER USE A COMMON MODEL BETWEEN SERVICES AS WE'D ONLY REPLICATE WHAT WE NEED IN ORDERS SERVICE HERE

import mongoose from 'mongoose';
import { Order, OrderStatus } from '../models/order';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
//what is required to create a new ticket
interface TicketAttrs {
  id: string;
  title: string;
  price: number;
}
interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  version: number; //added by the plugin
  isReserved(): Promise<boolean>; //available on every Doc
}
interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    // userId: {
    //     type: String,
    //     required: true
    // }
  },
  {
    toJSON: {
      transform(doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

//wire up the plugin to use the versioning system
ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.findByEvent = (event: { id: string; version: number }) => {
  return Ticket.findOne({ _id: event.id, version: event.version - 1 });
};

//method related to creating the a doc
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
  });
};
//method related to the document
//never use an arrow function here as it will not bind 'this' to the document
ticketSchema.methods.isReserved = async function () {
  //this refers to the document
  //Make sure that this ticket is not already reserved
  //Run a query to look at all orders, Find an order where the ticket
  //is the ticket we just found AND the order status is not cancelled
  //if we did find an order from the query, then the ticket is reserved
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });
  return !!existingOrder; //if null => true => false
  //if true => false => true
};
const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);
export { Ticket, TicketDoc }; // Export types for use in other files
