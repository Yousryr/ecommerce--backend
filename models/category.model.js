const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Category title is required'],
        unique: true,
        trim: true,
        minlength: 2,
        maxlength: 60
    },
    isDeleted: {
        type: Boolean,
        default: false,
        select: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
