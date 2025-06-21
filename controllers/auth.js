const ErrorResponse = require('../utils/ErrorResponse');
const User = require('../models/User');
const mongoose = require('mongoose');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// Register user
// POST request to /api/v1/auth/register
// public
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role
    });

    sendTokenResponse(user, 201, res);

});

// Login user
// POST request to /api/v1/auth/login
// public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // validate email and password 
    if (!email || !password) {
        return next(new ErrorResponse('Please provide an email and password', 400));
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(user, 201, res);

});

// Log User out - clear cookie
// POST request to /api/v1/auth/me
// private

exports.logout = asyncHandler(async (req, res, next) => {
    
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        data: user
    });
});



// get current logged in user
// POST request to /api/v1/auth/me
// private

exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        return next(new ErrorResponse(`User not found with id of ${req.user.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: user
    });
});


// update user detaiils
//  PUT request to /api/v1/auth/me
// private

exports.updateDetails = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email
    };
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,  
        runValidators: true
    });


    res.status(200).json({
        success: true,
        data: user
    });
});

// Update Password
// PUT request to /api/v1/auth/updatepassword
// private

exports.updatepassword = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    // check current password
    if(!(await user.matchPassword(req.body.currentPassword))) {
        return next(new ErrorResponse('Password is incorrect', 401));
    }
    // set new password
    user.password = req.body.newPassword;
    await user.save();
    
    sendTokenResponse(user, 200, res);
});



// forgot password
// POST request to /api/v1/auth/forgotpassword
// public

exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({email: req.body.email});

    if (!user) {
        return next(new ErrorResponse('User not found with that email', 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Token',
            message
        });

        res.status(200).json({
            success: true,
            data: 'Email sent'
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new ErrorResponse('Email could not be sent', 500));
    }

    res.status(200).json({
        success: true,
        data: user
    });
});

// reset password
// PUT request to /api/v1/auth/resetpassword/:resettoken
// public

exports.resetpassword = asyncHandler(async (req, res, next) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    //get hashed token

    if (!user) {
        return next(new ErrorResponse(`User not found with id of ${req.user.id}`, 404));
    }

    // set the new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
});

// get token from model , create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true; // serve secure cookies in production
    }

    res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
        success: true,
        token
    });
}