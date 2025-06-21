const crypto = require('crypto');
const { reset } = require('colors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "name is required"]
    },
    email: {
        type: String,
        required: [true, "email is required"],
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,'Please use a valid email address']
    },
    role:{
        type: String,
        enum: ['user', 'publisher'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, "password is required"],
        minlength: [6, "password must be at least 6 characters"],
        select: false // do not return password in queries
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
})

// encrypt password using bcrypt - middleware
userSchema.pre('save', async function(next) {
    if( !this.isModified('password')) {
        next();  
    }
    const salt = await bcrypt.genSalt(10); 
    this.password = await bcrypt.hash(this.password, salt);

});

// sign JWT token and return 
userSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
}

// match password
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

// generate and hash password reset token
userSchema.methods.getResetPasswordToken = function() {
    // generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // set expire time for reset password token
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
}

module.exports = mongoose.model('User', userSchema)