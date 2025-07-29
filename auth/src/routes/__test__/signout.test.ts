import request from 'supertest';
import { app } from '../../app';

it('clears the cookie after signing out', async () => {
  // First, sign up a user
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);

  //signout
  const response = await request(app)
    .post('/api/users/signout')
    .send({})
    .expect(200);

  const cookie = response.get('Set-Cookie')?.[0];

  expect(cookie).toBeDefined();
  expect(cookie).toContain('session=');
  expect(cookie).toContain('expires=Thu, 01 Jan 1970 00:00:00 GMT');
});
