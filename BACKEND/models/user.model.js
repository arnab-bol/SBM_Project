
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    isAccountVerified: {
        type: Boolean,
        default: false
    },

    verifyOtp: {
        type: String,
        default: ""
    },

    verifyOtpExpireAt: {
        type: Number,
        default: 0
    },

    resetOtp: {
        type: String,
        default: ""
    },

    resetOtpExpireAt: {
        type: Number,
        default: 0
    }

}, { timestamps: true });

const userModel =
    mongoose.models.user ||
    mongoose.model("user", userSchema);

module.exports = userModel;

