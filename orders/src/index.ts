import mongoose from 'mongoose';
import { natsWrapper } from './nats-wrapper';
import { app } from './app';
import { TicketCreatedListener } from './events/listeners/ticket-created-listener';
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener';
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener';
const start = async () => {
  if (!process.env.JWT_KEY) {
    //type guard
    throw new Error('JWT_KEY must be defined');
  }
  if (!process.env.MONGO_URI) {
    //type guard
    throw new Error('MONGO_URI must be defined');
  }
  if (!process.env.NATS_CLIENT_ID) {
    //type guard
    throw new Error('NATS_CLIENT_ID must be defined');
  }
  if (!process.env.NATS_URL) {
    //type guard
    throw new Error('NATS_URL must be defined');
  }
  if (!process.env.NATS_CLUSTER_ID) {
    //type guard
    throw new Error('NATS_CLUSTER_ID must be defined');
  }
  await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL);
  natsWrapper.client.on('close', () => {
    console.log('NATS connection closed');
    process.exit();
  });

  //graceful shutdown
  process.on('SIGINT', () => natsWrapper.client.close());
  process.on('SIGTERM', () => natsWrapper.client.close());

  //listen for events
  new TicketCreatedListener(natsWrapper.client).listen();
  new TicketUpdatedListener(natsWrapper.client).listen();
  new ExpirationCompleteListener(natsWrapper.client).listen();
  
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error(err);
  }
  app.listen(3000, () => {
    console.log('Listening on port 3000!');
  });
};
start();
