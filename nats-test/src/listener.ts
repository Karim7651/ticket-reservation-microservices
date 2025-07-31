import nats, { Message, Stan } from 'node-nats-streaming';
import { randomBytes } from 'crypto';
import { TicketCreatedListener } from './events/ticket-created-listener';
const clientId = randomBytes(4).toString('hex');
console.clear();
/**
 * Connects to the NATS Streaming Server (Stan).
 *
 * @param {string} clusterId - The ID of the NATS Streaming cluster to connect to (must match the server's `--cluster_id`).
 * @param {string} clientId - A unique identifier for this client (e.g., 'publisher'). Must be unique across active clients. HAS TO BE UNIQUE.
 * @param {object} options - Configuration options for the connection.
 * @param {string} options.url - The URL of the NATS server to connect to.
 */
const stan = nats.connect('ticketing', clientId, {
  url: 'http://localhost:4222',
});
stan.on('connect', () => {
  console.log('Listener connected to NATS');
  stan.on('close', () => {
    console.log('NATS connection closed');
    process.exit();
  });
  new TicketCreatedListener(stan).listen();
})

// Handle process termination gracefully
// tell nats to close the connection when the process is terminated (don't wait for heartbeats)
process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());



