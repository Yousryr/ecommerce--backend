const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const connectDB = require('./config/db.config');
const corsMiddleware = require('./middlewares/cors.middleware');
const errorHandler = require('./middlewares/errorHandlar.middleware');
const AppError = require('./utilites/appError.uti');

connectDB();

const app = express();

app.use(express.json());
app.use(corsMiddleware);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/v1/auth', require('./routes/auth.route'));
app.use('/api/v1/product', require('./routes/product.route'));
app.use('/api/v1/user', require('./routes/user.route'));
app.use('/api/v1/purchase', require('./routes/purchase.route'));
app.use('/api/v1/admin', require('./routes/admin.route'));
app.use('/api/v1/report', require('./routes/report.route'));

const testimonialController = require('./controllers/testimonial.controller');
const authMiddleware = require('./middlewares/auth.middleware');
app.get('/api/v1/testimonials', testimonialController.getApprovedTestimonials);
app.post('/api/v1/testimonials', authMiddleware.authenticate, testimonialController.submitTestimonial);

app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
