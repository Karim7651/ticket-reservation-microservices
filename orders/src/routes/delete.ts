import express , {Request, Response} from 'express';
import { Order } from '../models/order';
import { NotAuthorizedError, NotFoundError, requireAuth } from '@ktickets2025/common';
import { OrderStatus } from '../models/order';
const router = express.Router();

router.delete('/api/orders/:orderId', async(req: Request, res: Response) => {
    const {orderId} = req.params;
    const order = await Order.findById(orderId)
    if(!order){
        throw new NotFoundError();
    }
    if(order.userId !== req.currentUser!.id){
        throw new NotAuthorizedError();
    }
    order.status = OrderStatus.Cancelled;
    await order.save();
    //publish an event => order:cancelled

    res.status(204).send();
})

export {router as deleteOrderRouter};