import request from 'supertest';
import { app } from '../../app';
//super test uses http connection => cookies wouldn't work as we set secure to true
//so we need to set the cookie to false in the test environment



it('returns a 201 on successful signup', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);
});

it('it return a 400 with an invalid email', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test',
      password: 'password',
    })
    .expect(400);
});
it('it return a 400 with an invalid password (short length)', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@gmail.com',
      password: 'p',
    })
    .expect(400);
});
it('it return a 400 with missing email and password', async () => {
    //mutliple tests can be chained together
  await request(app).post('/api/users/signup').send({}).expect(400);
  await request(app).post('/api/users/signup').send({}).expect(400);
});
it('disallows duplicate emails',async() => {
    await request(app).post("/api/users/signup").send({
        email: 'test@gmail.com',
        password: 'password',
    }).expect(201);

    await request(app).post("/api/users/signup").send({
        email: 'test@gmail.com',
        password: 'password',
    }).expect(400);
})
it('sets a cookie after a successful sign up',async() => {
    const response = await request(app).post("/api/users/signup").send({
        email: 'test@gmail.com',
        password: 'password',
    }).expect(201);
    //inspect the response header using get
    expect(response.get('Set-Cookie')).toBeDefined();
})
