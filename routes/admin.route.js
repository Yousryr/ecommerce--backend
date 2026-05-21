const express = require('express');
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const uploadMiddleware = require('../middlewares/upload.middleware');

const router = express.Router();

// All admin routes are protected and restricted to 'admin' role
router.use(authMiddleware.authenticate, authMiddleware.restrictTo('admin'));

// Stats
router.get('/stats', adminController.getStats);

// Products
router.post('/products', uploadMiddleware.uploadProductImage, adminController.createProduct);
router.patch('/products/:id', uploadMiddleware.uploadProductImage, adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Orders
router.get('/orders', adminController.getAllOrders);
router.patch('/orders/:id/status', adminController.updateOrderStatus);

// Users
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Categories
router.post('/categories', adminController.createCategory);
router.get('/categories', adminController.getCategories);
router.get('/categories/:id', adminController.getCategory);
router.patch('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Subcategories
router.post('/subcategories', adminController.createSubcategory);
router.get('/subcategories', adminController.getSubcategories);
router.get('/subcategories/:id', adminController.getSubcategory);
router.patch('/subcategories/:id', adminController.updateSubcategory);
router.delete('/subcategories/:id', adminController.deleteSubcategory);

// Testimonials
router.get('/testimonials', adminController.getAllTestimonials);
router.patch('/testimonials/:id/moderate', adminController.moderateTestimonial);

module.exports = router;
