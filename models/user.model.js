const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true,
        minlength: 2,
        maxlength: 60
    },
    mobile: {
        type: String,
        required: [true, 'Please provide your mobile number'],
        unique: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        sparse: true // Allow null/missing values to be unique
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: [true, 'Please specify your gender']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    emailConsent: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true,
        select: false
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model('User', userSchema);
