// routes/cartRoute.js
import express from 'express';
import { addToCart, getCart, updateCartItem, removeFromCart } from '../controllers/cartController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Utiliser juste verifyToken pour que les clients puissent accéder à leur panier
router.use(verifyToken);

// Routes accessibles aux clients
router.post('/add', addToCart);
router.get('/', getCart);
router.put('/update', updateCartItem);
router.delete('/remove/:itemId', removeFromCart);

export default router;