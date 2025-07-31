import { Stan, Message } from 'node-nats-streaming';
import { Subjects } from './subjects';
interface Event{
    subject:Subjects
    data:any
}
export abstract class Listener<T extends Event> {
  abstract subject: T['subject'];
  abstract queueGroupName: string;
  abstract onMessage(data: T['data'], msg: Message): void;

  private client: Stan;
  protected ackWait = 5 * 1000; // in ms = 5 seconds
  constructor(client: Stan) {
    this.client = client;
  }
  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setManualAckMode(true) // manually acknowledge messages
      .setAckWait(this.ackWait) // set the time to wait for an ack before resending
      .setDeliverAllAvailable() // deliver all available messages
      .setDurableName(this.queueGroupName); // durable subscription name
  }
  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    );
    subscription.on('message', (msg: Message) => {
      console.log(
        `Received message #${this.subject} with data: ${this.queueGroupName}`
      );
      const parsedData = this.parseMessage(msg);
      this.onMessage(parsedData, msg);
    });
  }
  parseMessage(msg: Message) {
    const data = msg.getData();
    //either a string or a buffer
    return typeof data === 'string'
      ? JSON.parse(data)
      : JSON.parse(data.toString('utf8'));
  }
}