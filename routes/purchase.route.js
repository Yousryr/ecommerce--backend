const express = require('express');
const purchaseController = require('../controllers/purchase.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware.authenticate);

router.get('/cart', purchaseController.getCart);
router.post('/cart', purchaseController.addToCart);
router.patch('/cart/:id', purchaseController.updateCartItem);
router.delete('/cart/:id', purchaseController.removeCartItem);

router.post('/order', purchaseController.placeOrder);
router.get('/orders', purchaseController.getMyOrders);
router.patch('/orders/:id/cancel', purchaseController.cancelOrder);
router.post('/orders/:id/refund', purchaseController.requestRefund);

module.exports = router;
