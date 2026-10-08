const User = require('../models/User');
const Profile = require('../models/Profile');
const Ticket = require('../models/Ticket');
const express = require('express');
const router = express.Router();
const verifyToken = require('../others/verifyToken');
const { normalizeEmail, validateName, isObjectId } = require('../others/validate');
const { asyncHandler } = require('../others/errors');

const DEFAULT_TICKET_LIMIT = 50;
const MAX_TICKET_LIMIT = 100;

router.post('/user/profiles/new', verifyToken, asyncHandler(async (req, res) => {
    const { firstName, lastName } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!validateName(firstName) || !validateName(lastName) || !email) {
        return res.status(400).json({ message: 'Données de profil invalides' });
    }

    const newProfile = await Profile.create({
        userId: req.user.userId,
        nom: lastName.trim(),
        prenom: firstName.trim(),
        email,
    });
    res.status(201).json(newProfile);
}));

router.get('/user/details', verifyToken, asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.userId)
        .select('_id email firstName lastName birthDate creation')
        .lean();
    if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(user);
}));

router.get('/user/profiles', verifyToken, asyncHandler(async (req, res) => {
    const profiles = await Profile.find({ userId: req.user.userId }).lean();
    res.json(profiles);
}));

async function getProfileTickets(req, res) {
    if (!isObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Identifiant de profil invalide' });
    }

    const profile = await Profile.findOne({ _id: req.params.id, userId: req.user.userId }).lean();
    if (!profile) {
        return res.status(404).json({ message: 'Profil non trouvé' });
    }

    const limit = Math.min(
        Math.max(parseInt(req.query.limit, 10) || DEFAULT_TICKET_LIMIT, 1),
        MAX_TICKET_LIMIT
    );
    const skip = Math.max(parseInt(req.query.skip, 10) || 0, 0);

    const [tickets, total] = await Promise.all([
        Ticket.find({ profileId: profile._id })
            .sort({ buyDate: -1 })
            .skip(skip)
            .limit(limit)
            .populate('priceId')
            .populate({
                path: 'usages',
                options: { sort: { date: -1 }, limit: 20 },
            })
            .lean(),
        Ticket.countDocuments({ profileId: profile._id }),
    ]);

    res.json({
        ...profile,
        tickets,
        pagination: { total, limit, skip },
    });
}

router.get('/user/profiles/:id', verifyToken, asyncHandler(getProfileTickets));
router.get('/user/profiles/:id/tickets', verifyToken, asyncHandler(getProfileTickets));

module.exports = router;
