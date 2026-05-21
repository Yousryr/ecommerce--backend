const User = require('../models/user.model');
const Address = require('../models/address.model');
const catchAsync = require('../utilites/catchAsync.uti');
const AppError = require('../utilites/appError.uti');

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.getUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('No user found with that ID', 404));

    res.status(200).json({
        success: true,
        data: user
    });
});

exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password) {
        return next(new AppError('This route is not for password updates. Please use /updateMyPassword.', 400));
    }

    const filteredBody = {};
    const allowedFields = ['name', 'email', 'gender', 'emailConsent'];
    Object.keys(req.body).forEach(el => {
        if (allowedFields.includes(el)) filteredBody[el] = req.body[el];
    });

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: updatedUser
    });
});

// Address management
exports.getAddresses = catchAsync(async (req, res, next) => {
    const addresses = await Address.find({ userId: req.user.id });
    res.status(200).json({
        success: true,
        data: addresses
    });
});

exports.addAddress = catchAsync(async (req, res, next) => {
    const { label, addressText, isDefault } = req.body;

    if (isDefault) {
        await Address.updateMany({ userId: req.user.id }, { isDefault: false });
    }

    const newAddress = await Address.create({
        userId: req.user.id,
        label,
        addressText,
        isDefault
    });

    res.status(201).json({
        success: true,
        data: newAddress
    });
});

exports.updateAddress = catchAsync(async (req, res, next) => {
    if (req.body.isDefault) {
        await Address.updateMany({ userId: req.user.id }, { isDefault: false });
    }

    const updatedAddress = await Address.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        req.body,
        { new: true, runValidators: true }
    );

    if (!updatedAddress) return next(new AppError('No address found with that ID', 404));

    res.status(200).json({
        success: true,
        data: updatedAddress
    });
});

exports.deleteAddress = catchAsync(async (req, res, next) => {
    const address = await Address.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!address) return next(new AppError('No address found with that ID', 404));

    res.status(204).json({
        success: true,
        data: null
    });
});
