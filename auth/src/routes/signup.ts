import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { User } from '../models/user';
import { BadRequestError } from '@ktickets2025/common';
import jwt from 'jsonwebtoken'
import { validateRequest } from '@ktickets2025/common';
const router = express.Router();

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters'),
  ],validateRequest,
  async(req: Request, res: Response) => {
    const { email,password } = req.body;
    const existingUser = await User.findOne({ email });
    if(existingUser){
      throw new BadRequestError('Email in use');
    }
    const user = User.build({
      email,
      password: password
    });
    await user.save(); // save to db
    
    //generate JWT
    const userJwt = jwt.sign({
      id:user.id,
      email: user.email
    }, process.env.JWT_KEY!); //The ! tells TypeScript: "I promise this is not undefined."
    //store it on session object
    //req.session.jwt = userJwt; ts complains
    req.session = {
      jwt: userJwt
    };
    res.status(201).send(user);
  }
);

export { router as signupRouter };
