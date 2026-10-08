const Profile = require('../models/Profile');
const Ticket = require('../models/Ticket');
const express = require('express');
const router = express.Router();
const verifyToken = require('../others/verifyToken');
const TicketUsage = require('../models/TicketUsage');
const { toObjectId, validateScanData, parseDuration } = require('../others/validate');
const { assertProfileOwned, resolveProfileId } = require('../others/ownership');
const { asyncHandler } = require('../others/errors');

router.post('/tickets/use', verifyToken, asyncHandler(async (req, res) => {
    const ticketOid = toObjectId(req.body.ticketId);
    const { scanData } = req.body;

    if (!ticketOid) {
        return res.status(400).json({ message: 'Identifiant de ticket invalide' });
    }
    if (!validateScanData(scanData)) {
        return res.status(400).json({ message: 'Données de scan invalides' });
    }

    const ticket = await Ticket.findById(ticketOid).populate('priceId');
    if (!ticket || !ticket.priceId) {
        return res.status(404).json({ message: 'Ticket non trouvé' });
    }

    const profile = await Profile.findById(ticket.profileId).lean();
    if (!profile || profile.userId.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'Accès non autorisé à ce ticket' });
    }

    const maxUse = ticket.priceId.maxUse || 1;
    const maxTime = parseDuration(ticket.priceId.maxTime);
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - maxTime);

    if (maxTime > 0) {
        const existingUsage = await TicketUsage.findOne({
            ticketId: ticket._id,
            date: { $gte: cutoffTime },
        }).lean();
        if (existingUsage) {
            return res.status(400).json({ message: 'Usage déjà enregistré dans la période définie' });
        }
    }

    const recentUsage = await TicketUsage.findOne({
        ticketId: ticket._id,
        date: { $gte: new Date(now.getTime() - 1000) },
    }).lean();
    if (recentUsage) {
        return res.status(400).json({ message: 'Un usage a déjà été enregistré récemment' });
    }

    const claimed = await Ticket.findOneAndUpdate(
        {
            _id: ticketOid,
            $expr: {
                $lt: [
                    {
                        $max: [
                            { $ifNull: ['$usageCount', 0] },
                            { $size: { $ifNull: ['$usages', []] } },
                        ],
                    },
                    maxUse,
                ],
            },
        },
        [
            {
                $set: {
                    usageCount: {
                        $add: [
                            {
                                $max: [
                                    { $ifNull: ['$usageCount', 0] },
                                    { $size: { $ifNull: ['$usages', []] } },
                                ],
                            },
                            1,
                        ],
                    },
                },
            },
        ],
        { returnDocument: 'after' }
    );

    if (!claimed) {
        return res.status(400).json({ message: 'Limite d\'utilisation du ticket atteinte' });
    }

    try {
        const newUsage = await TicketUsage.create({
            ticketId: ticketOid,
            scanData,
            date: now,
        });

        await Ticket.findByIdAndUpdate(ticketOid, {
            $push: { usages: newUsage._id },
        });

        res.json({ message: 'Usage enregistré avec succès', usage: newUsage });
    } catch (error) {
        await Ticket.findByIdAndUpdate(ticketOid, { $inc: { usageCount: -1 } });
        throw error;
    }
}));

router.get('/tickets/:ticketId', verifyToken, asyncHandler(async (req, res) => {
    const ticketOid = toObjectId(req.params.ticketId);
    if (!ticketOid) {
        return res.status(400).json({ message: 'Identifiant de ticket invalide' });
    }

    const profileId = resolveProfileId(req);
    const profile = await assertProfileOwned(req.user.userId, profileId);

    const ticket = await Ticket.findOne({
        _id: ticketOid,
        profileId: profile._id,
    }).populate('priceId').populate({
        path: 'usages',
        options: { sort: { date: -1 }, limit: 50 },
    }).lean();

    if (!ticket) {
        return res.status(404).json({ message: 'Ticket non trouvé ou non associé à ce profil' });
    }

    res.json(ticket);
}));

router.delete('/tickets/:ticketId', verifyToken, asyncHandler(async (req, res) => {
    const ticketOid = toObjectId(req.params.ticketId);
    if (!ticketOid) {
        return res.status(400).json({ message: 'Identifiant de ticket invalide' });
    }

    const profileId = resolveProfileId(req);
    const profile = await assertProfileOwned(req.user.userId, profileId);

    const ticket = await Ticket.findById(ticketOid);
    if (!ticket) {
        return res.status(404).json({ message: 'Ticket non trouvé' });
    }

    if (ticket.profileId.toString() !== profile._id.toString()) {
        return res.status(403).json({ message: 'Accès non autorisé à ce ticket' });
    }

    await TicketUsage.deleteMany({ ticketId: ticketOid });
    await Ticket.findByIdAndDelete(ticketOid);
    res.status(200).json({ message: 'Ticket supprimé avec succès' });
}));

router.delete('/tickets', verifyToken, asyncHandler(async (req, res) => {
    const profileId = resolveProfileId(req);
    const profile = await assertProfileOwned(req.user.userId, profileId);

    const tickets = await Ticket.find({ profileId: profile._id }).select('_id').lean();
    const ticketIds = tickets.map((t) => t._id);
    if (ticketIds.length > 0) {
        await Promise.all(
            ticketIds.map((ticketId) => TicketUsage.deleteMany({ ticketId }))
        );
    }
    const result = await Ticket.deleteMany({ profileId: profile._id });

    res.status(200).json({
        message: 'Tickets supprimés avec succès',
        deletedCount: result.deletedCount,
    });
}));

module.exports = router;
