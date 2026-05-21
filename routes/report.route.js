const express = require('express');
const reportController = require('../controllers/report.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware.authenticate, authMiddleware.restrictTo('admin'));

router.get('/sales', reportController.getSalesReport);

module.exports = router;
