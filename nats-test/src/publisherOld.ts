import nats from 'node-nats-streaming'

console.clear()
/**
 * Connects to the NATS Streaming Server.
 *
 * @param {string} clusterId - The ID of the NATS cluster to connect to. Must match the server's `--cluster_id`.
 * @param {string} clientId - A unique identifier for this client. Must be unique among all clients connected to the cluster.
 * @param {object} options - Configuration options for the connection.
 * @param {string} options.url - The URL of the NATS server to connect to.
 */
const client = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222',
})

client.on('connect', () => {
  console.log('Publisher connected to NATS')
  //we can only share strings (JSON) over NATS
  const data = JSON.stringify({
    id: '123',
    title: 'concert',
    price: 20,
  })
  //event name is ticket:created
  //data => data we want to share
  client.publish('ticket:created', data, () => {
    console.log('Event published')
  })
})