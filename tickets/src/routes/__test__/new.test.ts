//Test driven development
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

it('has a route handler listening to /api/tickets for post requests (not a 404 error)', async () => {
  const response = await request(app).post('/api/tickets').send({});
  expect(response.status).not.toEqual(404);
});

it('can be accessed if the user is signed in', async () => {
  const response = await request(app).post('/api/tickets').send({});

  expect(response.status).toEqual(401);
});
it('return a status other than 401 if user is signed in', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .send({})
    .set('Cookie', global.signin()); //fake authentication function
  expect(response.status).not.toEqual(401);
  console.log(response.status);
});
it('return an error if an invalid title (empty or no title) is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'fdghdfgh', price: -10 })
    .expect(400);
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ titile:"dghdfgh" })
    .expect(400);
});

it('creates a ticket with valid inputs', async () => {
  //add a check to see if the ticket was created # = # +1
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'dghdfgh',
      price: 10,
    })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(10);
});
