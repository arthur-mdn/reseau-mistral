const Ticket = require('../models/Ticket');
const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const verifyToken = require('../others/verifyToken');
const Price = require('../models/Price');
const { validateCart, toObjectId, MAX_TICKETS_PER_ORDER } = require('../others/validate');
const { assertProfileOwned, resolveProfileId } = require('../others/ownership');
const { asyncHandler } = require('../others/errors');

const buyLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Trop de requêtes d\'achat, réessaie plus tard' },
});

router.get('/store/prices', verifyToken, asyncHandler(async (req, res) => {
    const prices = await Price.find({ status: 'ok' }).lean();
    res.json(prices);
}));

router.post('/store/buy', verifyToken, buyLimiter, asyncHandler(async (req, res) => {
    const profileId = resolveProfileId(req);
    const profile = await assertProfileOwned(req.user.userId, profileId);

    const cartCheck = validateCart(req.body.panier);
    if (!cartCheck.ok) {
        return res.status(400).json({ message: cartCheck.message });
    }

    const ticketsToCreate = [];
    let totalTickets = 0;

    for (const item of req.body.panier) {
        const priceOid = toObjectId(item.id);
        const priceItem = await Price.findOne({ _id: priceOid, status: 'ok' }).lean();
        if (!priceItem) {
            return res.status(404).json({ message: `Article non trouvé: ${item.id}` });
        }

        const multiple = Number.isSafeInteger(priceItem.multiple) && priceItem.multiple > 0
            ? priceItem.multiple
            : 1;
        const numberOfTickets = item.quantity * multiple;

        if (!Number.isSafeInteger(numberOfTickets) || numberOfTickets < 1) {
            return res.status(400).json({ message: 'Quantité invalide' });
        }

        totalTickets += numberOfTickets;
        if (totalTickets > MAX_TICKETS_PER_ORDER) {
            return res.status(400).json({ message: 'Nombre de tickets trop élevé' });
        }

        for (let i = 0; i < numberOfTickets; i++) {
            ticketsToCreate.push({
                profileId: profile._id,
                priceId: priceOid,
                usageCount: 0,
            });
        }
    }

    const created = await Ticket.insertMany(ticketsToCreate);
    res.json({
        message: 'Achat réussi',
        ticketCount: created.length,
    });
}));

module.exports = router;
