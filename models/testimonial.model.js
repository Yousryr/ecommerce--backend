const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    comment: {
        type: String,
        required: [true, 'Comment is required'],
        minlength: 10,
        maxlength: 500
    },
    stars: {
        type: Number,
        required: [true, 'Star rating is required'],
        min: 1,
        max: 5
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'refused'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Testimonial', testimonialSchema);
