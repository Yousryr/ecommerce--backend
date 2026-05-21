const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Address must belong to a user']
    },
    label: {
        type: String,
        enum: ['home', 'work', 'other'],
        required: [true, 'Address label is required']
    },
    addressText: {
        type: String,
        required: [true, 'Address text is required'],
        minlength: 10
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Address', addressSchema);
