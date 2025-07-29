import request from 'supertest';
import { app } from '../../app';
//super test isn't managing cookies, cookies aren't included in the follow up requests
it('responds with details about the current user', async () => {
  
  const cookie = await global.signin();
  if (!cookie) {
    throw new Error('Cookie not set after signup');
  }
  const response = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .send()
    .expect(200);

  expect(response.body.currentUser).toBeDefined();
  expect(response.body.currentUser.email).toEqual('test@test.com');
});
it('responds with details about the current user', async () => {
  const response = await request(app).get('/api/users/currentuser').send();
  expect(response.body.currentUser).toEqual(null);
});