import { Stan } from 'node-nats-streaming';
import { Subjects } from './subjects';
interface Event {
  subject: Subjects;
  data: any;
}
export abstract class Publisher<T extends Event> {
  abstract subject: Subjects;
  private client: Stan;

  constructor(client: Stan) {
    this.client = client;
  }

  publish(data: T['data']): Promise<void> {
    //nats is callback based, in order to use async/await, we need to wrap it in a Promise
    return new Promise<void>((resolve, reject) => {
      //data published must be a JSON string
      this.client.publish(this.subject, JSON.stringify(data), (err) => {
        if (err) {
          return reject(err);
        }
        console.log(`Event published to subject: ${this.subject}`);
        resolve();
      });
    });
  }
}
