const Order = require('../models/order.model');
const Product = require('../models/product.model');
const CartItem = require('../models/cart.model');
const catchAsync = require('../utilites/catchAsync.uti');
const AppError = require('../utilites/appError.uti');

exports.getCart = catchAsync(async (req, res, next) => {
    const cartItems = await CartItem.find({ userId: req.user.id }).populate('productId');
    
    const items = cartItems.map(item => {
        if (item.productId.price !== item.price) {
            item.isPriceChanged = true;
        }
        return item;
    });

    res.status(200).json({
        success: true,
        data: items
    });
});

exports.updateCartItem = catchAsync(async (req, res, next) => {
    const { quantity } = req.body;
    const cartItem = await CartItem.findOne({ _id: req.params.id, userId: req.user.id }).populate('productId');

    if (!cartItem) return next(new AppError('Cart item not found', 404));
    if (!cartItem.productId) return next(new AppError('Product no longer available', 404));

    const product = cartItem.productId;
    if (product.stock < quantity) return next(new AppError('Insufficient stock', 400));

    cartItem.quantity = quantity;
    cartItem.price = product.price;
    cartItem.totalPrice = quantity * product.price;
    cartItem.isPriceChanged = false;
    await cartItem.save();

    res.status(200).json({ success: true, data: cartItem });
});

exports.removeCartItem = catchAsync(async (req, res, next) => {
    const cartItem = await CartItem.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!cartItem) return next(new AppError('Cart item not found', 404));
    res.status(200).json({ success: true, message: 'Item removed' });
});

exports.addToCart = catchAsync(async (req, res, next) => {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);

    if (!product) return next(new AppError('Product not found', 404));
    if (product.stock < quantity) return next(new AppError('Insufficient stock', 400));

    let cartItem = await CartItem.findOne({ userId: req.user.id, productId });

    if (cartItem) {
        cartItem.quantity += quantity;
        cartItem.totalPrice = cartItem.quantity * product.price;
        cartItem.price = product.price;
        cartItem.isPriceChanged = false;
        await cartItem.save();
    } else {
        cartItem = await CartItem.create({
            userId: req.user.id,
            productId,
            quantity,
            price: product.price,
            totalPrice: quantity * product.price
        });
    }

    res.status(200).json({
        success: true,
        data: cartItem
    });
});

exports.placeOrder = catchAsync(async (req, res, next) => {
    const { address, phoneNumber } = req.body;
    const cartItems = await CartItem.find({ userId: req.user.id }).populate('productId');

    if (cartItems.length === 0) return next(new AppError('Cart is empty', 400));

    const activeItems = cartItems.filter(item => !item.isPriceChanged && item.productId.stock >= item.quantity);
    if (activeItems.length === 0) return next(new AppError('No valid items in cart', 400));

    let total = 0;
    const orderProducts = [];

    for (const item of activeItems) {
        total += item.totalPrice;
        orderProducts.push({
            productId: item.productId._id,
            name: item.productId.name,
            price: item.price,
            quantity: item.quantity
        });

        item.productId.stock -= item.quantity;
        item.productId.unitsSold += item.quantity;
        await item.productId.save();
    }

    const order = await Order.create({
        userId: req.user.id,
        address,
        phoneNumber,
        totalPrice: total,
        products: orderProducts
    });

    await CartItem.deleteMany({ _id: { $in: activeItems.map(i => i._id) } });

    res.status(201).json({
        success: true,
        data: order
    });
});

exports.getMyOrders = catchAsync(async (req, res, next) => {
    const orders = await Order.find({ userId: req.user.id }).sort('-createdAt');
    res.status(200).json({
        success: true,
        data: orders
    });
});

exports.cancelOrder = catchAsync(async (req, res, next) => {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });

    if (!order) return next(new AppError('Order not found', 404));
    if (!['pending', 'preparing'].includes(order.status)) {
        return next(new AppError('Order cannot be cancelled at this stage', 400));
    }

    order.status = 'cancelledByUser';
    await order.save();

    for (const item of order.products) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
    }

    res.status(200).json({
        success: true,
        message: 'Order cancelled successfully'
    });
});

exports.requestRefund = catchAsync(async (req, res, next) => {
    const { reason } = req.body;
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });

    if (!order) return next(new AppError('Order not found', 404));
    if (!['shipped', 'received'].includes(order.status)) {
        return next(new AppError('Order not eligible for refund', 400));
    }

    order.refundRequest = {
        reason,
        status: 'pending',
        createdAt: Date.now()
    };

    await order.save();

    res.status(200).json({
        success: true,
        message: 'Refund request submitted'
    });
});
