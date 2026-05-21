const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('../utilites/appError.uti');
const catchAsync = require('../utilites/catchAsync.uti');
const { normalizeMobile } = require('../utilites/phone.uti');

const signToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user);
    user.password = undefined;

    res.status(statusCode).json({
        success: true,
        data: {
            token,
            user
        }
    });
};

exports.register = catchAsync(async (req, res, next) => {
    const { name, mobile, email, password, gender, emailConsent } = req.body;
    const mobileNorm = normalizeMobile(mobile);
    if (!mobileNorm) {
        return next(new AppError('Please provide a valid mobile number.', 400));
    }

    const newUser = await User.create({
        name,
        mobile: mobileNorm,
        email,
        password,
        gender,
        emailConsent
    });

    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
        return next(new AppError('Please provide mobile number and password!', 400));
    }

    const mobileNorm = normalizeMobile(mobile);
    if (!mobileNorm) {
        return next(new AppError('Please provide a valid mobile number.', 400));
    }
    let user = await User.findOne({ mobile: mobileNorm }).select('+password');
    if (!user) {
        user = await User.findOne({ mobile: String(mobile).trim() }).select('+password');
    }

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect mobile number or password', 401));
    }

    createSendToken(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const mobileNorm = normalizeMobile(req.body.mobile);
    const user = await User.findOne({
        $or: [{ mobile: mobileNorm }, { mobile: String(req.body.mobile || '').trim() }]
    });
    if (!user) {
        return next(new AppError('No account found with this mobile number.', 404));
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log(`OTP for ${req.body.mobile}: ${otp}`);

    res.status(200).json({
        success: true,
        message: 'OTP sent to mobile number (Mocked, check server console)'
    });
});
