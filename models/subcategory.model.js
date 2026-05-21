const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Subcategory title is required'],
        trim: true,
        minlength: 2,
        maxlength: 60
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Parent category is required']
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

// Ensure title is unique within the scope of a category
subcategorySchema.index({ title: 1, categoryId: 1 }, { unique: true });

module.exports = mongoose.model('Subcategory', subcategorySchema);
