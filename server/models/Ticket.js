const mongoose = require('mongoose');
const { Schema } = mongoose;

const ticketSchema = new Schema({
    profileId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Profile',
        index: true,
    },
    priceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Price',
    },
    buyDate: {
        type: Date,
        default: Date.now,
    },
    usages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TicketUsage',
    }],
    usageCount: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    status: {
        type: String,
        required: true,
        default: 'ok',
    },
});

module.exports = mongoose.model('Ticket', ticketSchema);
