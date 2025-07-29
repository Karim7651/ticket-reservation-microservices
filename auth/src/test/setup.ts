import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import request from 'supertest';
//add types for global variables
declare global {
  var signin: () => Promise<string[]>;
}

let mongo: MongoMemoryServer;
beforeAll(async () => {
  //set the environment variables for testing, super test uses http connection
  process.env.NODE_ENV = 'test';
  //since we're not testing in kubernetes, we can use an in-memory MongoDB server and set environment variables
  process.env.JWT_KEY = 'test';
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();
  await mongoose.connect(mongoUri, {});
});
//before each test delete everything
beforeEach(async () => {
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
      await collection.deleteMany({});
    }
  }
});
//after all tests close db connection
afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});
//global function just for ease of use without imports
global.signin = async (): Promise<string[]> => {
  const email = 'test@test.com';
  const password = 'password';

  const response = await request(app)  // ✅ await the request
    .post('/api/users/signup')
    .send({
      email,
      password,
    })
    .expect(201);

  const cookie = response.get('Set-Cookie');  // this will be string[]

  if (!cookie) {
    throw new Error('Failed to get cookie from response');
  }

  return cookie;  // ✅ returns Promise<string[]>
};
