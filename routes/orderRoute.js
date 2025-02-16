// routes/orderRoutes.js
import express from 'express';
import { 
  submitOrder, 
  getAllOrders, 
  getOrderById,
  getUserOrders,
  cancelOrder
} from '../controllers/orderController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/submit-order', verifyToken, submitOrder);
router.get('/', verifyToken, isAdmin, getAllOrders);
router.get('/user-orders', verifyToken, getUserOrders);
router.get('/:id', verifyToken, getOrderById);
router.post('/:id/cancel', verifyToken, cancelOrder);

export default router;