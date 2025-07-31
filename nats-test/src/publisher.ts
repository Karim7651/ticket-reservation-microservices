import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';
console.clear();
/**
 * Connects to the NATS Streaming Server.
 *
 * @param {string} clusterId - The ID of the NATS cluster to connect to. Must match the server's `--cluster_id`.
 * @param {string} clientId - A unique identifier for this client. Must be unique among all clients connected to the cluster.
 * @param {object} options - Configuration options for the connection.
 * @param {string} options.url - The URL of the NATS server to connect to.
 */
const stan = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222',
});

stan.on('connect', async () => {
  console.log('Publisher connected to NATS');
  const publisher = new TicketCreatedPublisher(stan);
  try {
    await publisher.publish({
      id: '123',
      title: 'concert',
      price: 20,
    });
  } catch (err) {
    console.error(err);
  }

  //we can only share strings (JSON) over NATS
  //   const data = JSON.stringify({
  //     id: '123',
  //     title: 'concert',
  //     price: 20,
  //   })
  //   //event name is ticket:created
  //   //data => data we want to share
  //   stan.publish('ticket:created', data, () => {
  //     console.log('Event published')
  //   })
});
