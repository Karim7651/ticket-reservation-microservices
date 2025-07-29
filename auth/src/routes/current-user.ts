import express, { Request, Response } from 'express';
import { currentUser } from '@ktickets2025/common';


const router = express.Router();

router.get('/api/users/currentuser',currentUser, async (req: Request, res: Response) => {
  console.log('Current user route hit');
  res.send({currentUser: req.currentUser || null});
}); 

export { router as currentUserRouter };
