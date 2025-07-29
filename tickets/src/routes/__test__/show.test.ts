import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';

it('returns a 404 if the ticket is not found', async () => {
  await request(app)
    .get(`/api/tickets/${new mongoose.Types.ObjectId().toHexString()}`)
    .send()
    .expect(404);
});

it('returns the ticket if it is found', async () => {
  // request to create a ticket from api not directly from the db
  const title = 'concert';
  const price = 20;
  const response = await request(app)
    .post('/api/tickets').set('Cookie', global.signin())
    .send({
      title,
      price
    });
    const ticketResponse = await request(app)
      .get(`/api/tickets/${response.body.id}`)
      .send()
      .expect(200);
})