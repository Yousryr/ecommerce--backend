const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'preparing', 'shipped', 'cancelledByUser', 'cancelledByAdmin', 'refused', 'received'],
        default: 'pending'
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        name: String,
        price: Number,
        quantity: Number
    }],
    refundRequest: {
        reason: String,
        status: {
            type: String,
            enum: ['none', 'pending', 'approved', 'refused'],
            default: 'none'
        },
        createdAt: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
