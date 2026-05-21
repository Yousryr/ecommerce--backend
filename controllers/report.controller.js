const Order = require('../models/order.model');
const catchAsync = require('../utilites/catchAsync.uti');

exports.getSalesReport = catchAsync(async (req, res, next) => {
    const { from, to } = req.query;
    
    const query = {
        status: { $in: ['shipped', 'received'] },
        createdAt: {
            $gte: new Date(from),
            $lte: new Date(to)
        }
    };

    const stats = await Order.aggregate([
        { $match: query },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$totalPrice' },
                totalOrders: { $sum: 1 },
                avgOrderValue: { $avg: '$totalPrice' }
            }
        }
    ]);

    const topProducts = await Order.aggregate([
        { $match: query },
        { $unwind: '$products' },
        {
            $group: {
                _id: '$products.productId',
                name: { $first: '$products.name' },
                unitsSold: { $sum: '$products.quantity' },
                revenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } }
            }
        },
        { $sort: { unitsSold: -1 } },
        { $limit: 10 }
    ]);

    res.status(200).json({
        success: true,
        data: {
            summary: stats[0] || {},
            topProducts
        }
    });
});
