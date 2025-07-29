import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
const createTicket = async () => {
  await request(app).post('/api/tickets').set('Cookie', global.signin()).send({
    title: 'concert',
    price: 20,
  });
};
it('can fetch a list of tickets', async () => {
  await createTicket();
  await createTicket();
  await createTicket();
  const response = await request(app)
    .get('/api/tickets')
    .send()
    .expect(200);
  expect(response.body.length).toEqual(3);
  expect(response.body[0].title).toEqual('concert');
  expect(response.body[0].price).toEqual(20);
});
