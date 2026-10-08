const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    lastName: {
        type: String,
        required: true,
        default: 'Unknown',
    },
    firstName: {
        type: String,
        required: true,
        default: 'Unknown',
    },
    birthDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
    creation: {
        type: Date,
        default: Date.now,
    },
    socketId: {
        type: String,
        default: null,
    },
    userRole: {
        type: String,
        required: true,
        default: 'user',
    },
    tokenVersion: {
        type: Number,
        required: true,
        default: 0,
    },
});

module.exports = mongoose.model('User', userSchema);
