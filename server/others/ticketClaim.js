const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');

async function syncUsageCount(ticketOid) {
    const ticket = await Ticket.findById(ticketOid).select('usageCount usages').lean();
    if (!ticket) return null;

    const usagesLen = Array.isArray(ticket.usages) ? ticket.usages.length : 0;
    const usageCount = Number(ticket.usageCount) || 0;
    const synced = Math.max(usageCount, usagesLen);

    if (synced !== usageCount) {
        await Ticket.updateOne(
            { _id: ticketOid, usageCount },
            { $set: { usageCount: synced } }
        );
    }

    return synced;
}

async function claimTicketSlot(ticketOid, maxUse) {
    const synced = await syncUsageCount(ticketOid);
    if (synced === null) return null;
    if (synced >= maxUse) return null;

    return Ticket.findOneAndUpdate(
        {
            _id: ticketOid,
            usageCount: mongoose.trusted({ $lt: maxUse }),
        },
        { $inc: { usageCount: 1 } },
        { returnDocument: 'after' }
    );
}

module.exports = {
    claimTicketSlot,
    syncUsageCount,
};
