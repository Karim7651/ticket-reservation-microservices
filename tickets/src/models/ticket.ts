import mongoose from "mongoose";
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

ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };