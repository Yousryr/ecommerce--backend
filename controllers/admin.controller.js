const Product = require('../models/product.model');
const Category = require('../models/category.model');
const Subcategory = require('../models/subcategory.model');
const Order = require('../models/order.model');
const Testimonial = require('../models/testimonial.model');
const User = require('../models/user.model');
const catchAsync = require('../utilites/catchAsync.uti');
const AppError = require('../utilites/appError.uti');

exports.getStats = catchAsync(async (req, res, next) => {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProducts = await Product.countDocuments({ isDeleted: false });
    
    const revenue = await Order.aggregate([
        { $match: { status: { $in: ['shipped', 'received'] } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    res.status(200).json({
        success: true,
        data: {
            totalOrders,
            pendingOrders,
            totalUsers,
            totalProducts,
            totalRevenue: revenue[0]?.total || 0
        }
    });
});

// --- Product Management ---
exports.createProduct = catchAsync(async (req, res, next) => {
    const product = await Product.create({
        ...req.body,
        image: req.file?.filename
    });
    res.status(201).json({ success: true, data: product });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
    const data = { ...req.body };
    if (req.file) data.image = req.file.filename;

    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!product) return next(new AppError('Product not found', 404));
    res.status(200).json({ success: true, data: product });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!product) return next(new AppError('Product not found', 404));
    res.status(200).json({ success: true, message: 'Product deleted' });
});

// --- Order Management ---
exports.getAllOrders = catchAsync(async (req, res, next) => {
    const orders = await Order.find().populate('userId', 'name email').sort('-createdAt');
    res.status(200).json({ success: true, count: orders.length, data: orders });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!order) return next(new AppError('Order not found', 404));
    res.status(200).json({ success: true, data: order });
});

// --- User Management ---
exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find().sort('-createdAt');
    res.status(200).json({ success: true, count: users.length, data: users });
});

exports.updateUserRole = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
    if (!user) return next(new AppError('User not found', 404));
    res.status(200).json({ success: true, data: user });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return next(new AppError('User not found', 404));
    res.status(200).json({ success: true, message: 'User deleted' });
});

// --- Category Management ---
exports.createCategory = catchAsync(async (req, res, next) => {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
});

exports.getCategories = catchAsync(async (req, res, next) => {
    const categories = await Category.find({ isDeleted: false }).sort('title');
    res.status(200).json({ success: true, count: categories.length, data: categories });
});

exports.getCategory = catchAsync(async (req, res, next) => {
    const category = await Category.findById(req.params.id);
    if (!category || category.isDeleted) return next(new AppError('Category not found', 404));
    res.status(200).json({ success: true, data: category });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return next(new AppError('Category not found', 404));
    res.status(200).json({ success: true, data: category });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
    const category = await Category.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!category) return next(new AppError('Category not found', 404));
    res.status(200).json({ success: true, message: 'Category deleted' });
});

// --- Subcategory Management ---
exports.createSubcategory = catchAsync(async (req, res, next) => {
    // Verify category exists
    const category = await Category.findById(req.body.categoryId);
    if (!category) return next(new AppError('Parent category not found', 404));

    const subcategory = await Subcategory.create(req.body);
    res.status(201).json({ success: true, data: subcategory });
});

exports.getSubcategories = catchAsync(async (req, res, next) => {
    const { categoryId } = req.query;
    let query = { isDeleted: false };
    
    if (categoryId) {
        query.categoryId = categoryId;
    }

    const subcategories = await Subcategory.find(query)
        .populate('categoryId', 'title')
        .sort('title');
    
    res.status(200).json({ success: true, count: subcategories.length, data: subcategories });
});

exports.getSubcategory = catchAsync(async (req, res, next) => {
    const subcategory = await Subcategory.findById(req.params.id)
        .populate('categoryId', 'title');
    
    if (!subcategory || subcategory.isDeleted) return next(new AppError('Subcategory not found', 404));
    res.status(200).json({ success: true, data: subcategory });
});

exports.updateSubcategory = catchAsync(async (req, res, next) => {
    // If categoryId is being changed, verify the new category exists
    if (req.body.categoryId) {
        const category = await Category.findById(req.body.categoryId);
        if (!category) return next(new AppError('Parent category not found', 404));
    }

    const subcategory = await Subcategory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        .populate('categoryId', 'title');
    
    if (!subcategory) return next(new AppError('Subcategory not found', 404));
    res.status(200).json({ success: true, data: subcategory });
});

exports.deleteSubcategory = catchAsync(async (req, res, next) => {
    const subcategory = await Subcategory.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!subcategory) return next(new AppError('Subcategory not found', 404));
    res.status(200).json({ success: true, message: 'Subcategory deleted' });
});

// --- Testimonials ---
exports.getAllTestimonials = catchAsync(async (req, res, next) => {
    const testimonials = await Testimonial.find().populate('userId', 'name email').sort('-createdAt');
    res.status(200).json({ success: true, count: testimonials.length, data: testimonials });
});

exports.moderateTestimonial = catchAsync(async (req, res, next) => {
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!testimonial) return next(new AppError('Testimonial not found', 404));
    res.status(200).json({ success: true, data: testimonial });
});
