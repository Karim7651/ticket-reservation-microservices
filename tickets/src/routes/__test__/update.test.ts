import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it('returns a 404 if the ticket id is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({ title: 'new title', price: 20 })
    .expect(404);
});

it("returns a 401 forbidden if the user isn't auth", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({ title: 'new title', price: 20 })
    .expect(401);
});
it("returns a 401 if the user doesn't own the ticket", async () => {
  const response = await request(app)
    .post(`/api/tickets/`)
    .set('Cookie', global.signin())
    .send({ title: 'asdf', price: 20 })

    //global.signin() returns a random user everytime, so we are a new user here
    await request(app).put(`/api/tickets/${response.body.id}`).set('Cookie', global.signin()).send({ title: 'new title', price: 20 }).expect(401);
    //optionally get the ticket again to ensure it hasn't changed
});
it('returns a 400 if the user provides an invalid title or price', async () => {
    //safe ref to same user
    const cookie = global.signin();
    const response = await request(app)
    .post(`/api/tickets/`)
    .set('Cookie', cookie)
    .send({ title: 'asdf', price: 20 })

    await request(app).put(`/api/tickets/${response.body.id}`).set('Cookie',cookie).send({title:"", price: -10}).expect(400);

    
});
it('updates the ticket providing a valid input', async () => {
    const cookie = global.signin();
    const response = await request(app)
    .post(`/api/tickets/`).set('Cookie', cookie)
    .send({ title: 'asdf', price: 20 })

    await request(app)
    .put(`/api/tickets/${response.body.id}`).set('Cookie', cookie).send({ title: 'new title', price: 30 }).expect(200);
    //optially get the ticket again to ensure it has changed
    const ticketResponse = await request(app).get(`/api/tickets/${response.body.id}`).send();
    expect(ticketResponse.body.title).toEqual('new title');
    expect(ticketResponse.body.price).toEqual(30)
});
