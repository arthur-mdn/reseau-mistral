const mongoose = require('mongoose');
const { Schema } = mongoose;

const ticketUsageSchema = new Schema({
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Ticket',
        index: true,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
        index: true,
    },
    scanData: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: 'ok',
    },
});

ticketUsageSchema.index({ ticketId: 1, date: -1 });

module.exports = mongoose.model('TicketUsage', ticketUsageSchema);
