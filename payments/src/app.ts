import express from 'express';
import { json } from 'body-parser';

import cookieSession from 'cookie-session';
import { currentUser, errorHandler } from '@ktickets2025/common';
import { NotFoundError } from '@ktickets2025/common';
import { createChargeRouter } from './routes/new';

export const app = express();
app.set('trust proxy', true); //trust traffic from ingress-nginx

app.use(json());
app.use(
  cookieSession({
    signed: false, //disable encryption
    secure: process.env.NODE_ENV !== 'test', //only use cookies over https, supertest uses http connection
  })
);
app.use(currentUser);
app.use(createChargeRouter)
//just before error handling middleware
app.all('/{*any}', (req, res) => {
  console.log(req.url);
  throw new NotFoundError();
});
app.use(errorHandler);
