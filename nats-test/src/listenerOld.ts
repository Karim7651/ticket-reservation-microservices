import nats, { Message } from 'node-nats-streaming';
import { randomBytes } from 'crypto';
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
  /**
   * Subscribes to a NATS Streaming channel (subject) with a queue group.
   *
   * @param {string} subject - The name of the subject (channel) to subscribe to (e.g., 'ticket:created').
   * @param {string} queueGroup - The name of the queue group to join. Only one member in the group will receive a given message.
   *                              Useful for load balancing between multiple instances of the same service.
   */
  const options = stan.subscriptionOptions()
  .setManualAckMode(true) //you'd want to manually acknowledge from receivers events so you don't lose them;
  .setDeliverAllAvailable()  // deliver all available messages (not just new ones) if a new service starts up // THAT"S TOO MUCH THOUGH soln next line
  //after adding next line this is still mandatory to send all events to a brand new service(instance of a service)
  .setDurableName("ABC123"); //identifier for the subscription, so that it can be resumed later if the service restarts 
  // (resume from where it left off not from the beginning) ✅
  const subscription = stan.subscribe(
    'ticket:created',
    'queue-group-name', //queue group name, so that only one instance of the service receives the event
    options
  );
  subscription.on('message', (msg: Message) => {
    const data = msg.getData();
    if (typeof data === 'string') {
      console.log(`Received message #${msg.getSequence()} with data: ${data}`);
    }
    msg.ack(); // manually acknowledge the event //if not acked within 30 seconds,
    // it will be resent to another subscriber if exits otherwise it will send to the same subscriber
  });
});

// Handle process termination gracefully
// tell nats to close the connection when the process is terminated (don't wait for heartbeats)
process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());