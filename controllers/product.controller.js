const Product = require('../models/product.model');
const Category = require('../models/category.model');
const Subcategory = require('../models/subcategory.model');
const catchAsync = require('../utilites/catchAsync.uti');
const AppError = require('../utilites/appError.uti');
const cache = require('../utilites/memoryCache.utils');

exports.getProducts = catchAsync(async (req, res, next) => {
    const { category, subcategory, minPrice, maxPrice, search, sort } = req.query;

    const query = { isDeleted: false, isActive: true };

    if (category) query.categoryId = category;
    if (subcategory) query.subCategoryId = subcategory;
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }

    let productQuery = Product.find(query).populate('categoryId subCategoryId');

    if (sort) {
        if (sort === 'newest') productQuery = productQuery.sort('-createdAt');
        else if (sort === 'price-low') productQuery = productQuery.sort('price');
        else if (sort === 'price-high') productQuery = productQuery.sort('-price');
    }

    const products = await productQuery;

    res.status(200).json({
        success: true,
        count: products.length,
        data: products
    });
});

exports.getProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findOne({ _id: req.params.id, isDeleted: false, isActive: true }).populate('categoryId subCategoryId');

    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    res.status(200).json({
        success: true,
        data: product
    });
});

exports.getNewArrivals = catchAsync(async (req, res, next) => {
    const cached = cache.get('newArrivals');
    if (cached) {
        return res.status(200).json({ success: true, data: cached });
    }

    const products = await Product.find({ isDeleted: false, isActive: true })
        .sort('-createdAt')
        .limit(10);

    cache.set('newArrivals', products);

    res.status(200).json({
        success: true,
        data: products
    });
});

exports.getBestSellers = catchAsync(async (req, res, next) => {
    const cached = cache.get('bestSellers');
    if (cached) {
        return res.status(200).json({ success: true, data: cached });
    }

    const products = await Product.find({ isDeleted: false, isActive: true })
        .sort('-unitsSold')
        .limit(10);

    cache.set('bestSellers', products);

    res.status(200).json({
        success: true,
        data: products
    });
});

exports.getCategories = catchAsync(async (req, res, next) => {
    const categories = await Category.find({ isDeleted: false, isActive: true });
    res.status(200).json({
        success: true,
        data: categories
    });
});

exports.getSubcategories = catchAsync(async (req, res, next) => {
    const query = { isDeleted: false, isActive: true };
    if (req.params.categoryId) query.categoryId = req.params.categoryId;

    const subcategories = await Subcategory.find(query);
    res.status(200).json({
        success: true,
        data: subcategories
    });
});
