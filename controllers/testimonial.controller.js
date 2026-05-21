const Testimonial = require('../models/testimonial.model');
const catchAsync = require('../utilites/catchAsync.uti');
const AppError = require('../utilites/appError.uti');

exports.submitTestimonial = catchAsync(async (req, res, next) => {
    const existing = await Testimonial.findOne({ 
        userId: req.user.id, 
        status: { $in: ['pending', 'approved'] } 
    });

    if (existing) {
        return next(new AppError('You already have a pending or approved testimonial.', 400));
    }

    const testimonial = await Testimonial.create({
        userId: req.user.id,
        comment: req.body.comment,
        stars: req.body.stars
    });

    res.status(201).json({
        success: true,
        data: testimonial
    });
});

exports.getApprovedTestimonials = catchAsync(async (req, res, next) => {
    const testimonials = await Testimonial.find({ status: 'approved' })
        .populate('userId', 'name')
        .sort('-createdAt');

    res.status(200).json({
        success: true,
        data: testimonials
    });
});




