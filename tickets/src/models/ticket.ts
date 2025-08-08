import mongoose from "mongoose";
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
//required to create a ticket
interface TicketAttrs {
    title: string;
    price: number;
    userId: string;
}
//actual properties of the ticket document (single record)
interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    version: number; //for optimistic concurrency control
    orderId?: string; // string or undefined, optional field
}
//just add a function to the model to create a ticket so we can integrate it with mongoose
interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    userId: { type: String, required: true },
    orderId:{type:String},
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);
//wire up optimistic concurrency control library mongoose-update-if-current
ticketSchema.set('versionKey', 'version'); //version instead of __v
ticketSchema.plugin(updateIfCurrentPlugin);


ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };