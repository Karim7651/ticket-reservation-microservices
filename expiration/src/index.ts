import { natsWrapper } from './nats-wrapper';
import { OrderCreatedListener } from './events/listeners/order-created-listener';

const start = async () => {
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

  //start listening
  new OrderCreatedListener(natsWrapper.client).listen();
  
};
start();
