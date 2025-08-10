import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import request from 'supertest';
import jwt from 'jsonwebtoken';
//add types for global variables
declare global {
  var signin: (id?:string) => string[];
}
jest.mock('../nats-wrapper'); //real file we want to fake, jest would go and import the file in __mocks__ folder instead
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
  jest.clearAllMocks(); //clear the mock calls for event emitting function so we can check how many times it was called
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
//global function just for ease of use without imports //fake authentication function
global.signin = (id? : string) => {
  //build a jwt payload {id, email}
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com',
  };
  //create a jwt
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  //build session object {jwt: myJwt}
  const session = { jwt: token };
  //turn that session into json
  const sessionJSON = JSON.stringify(session);
  //base64 encode that json
  const base64 = Buffer.from(sessionJSON).toString('base64');
  //return the string that is the cookie with the encoded data
  return [`session=${base64}`];


};
