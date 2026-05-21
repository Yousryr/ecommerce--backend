const express = require('express');
const productController = require('../controllers/product.controller');

const router = express.Router();

router.get('/', productController.getProducts);
router.get('/new-arrivals', productController.getNewArrivals);
router.get('/best-sellers', productController.getBestSellers);
router.get('/categories', productController.getCategories);
router.get('/categories/:categoryId/subcategories', productController.getSubcategories);
router.get('/:id', productController.getProduct);

module.exports = router;
