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
        .select('_id email firstName lastName birthDate creation userRole lastLogin')
        .lean();
    if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(user);
}));

async function requireSuperadmin(userId) {
    const current = await User.findById(userId).select('userRole').lean();
    return current && current.userRole === 'superadmin';
}

router.get('/user/accounts', verifyToken, asyncHandler(async (req, res) => {
    if (!(await requireSuperadmin(req.user.userId))) {
        return res.status(403).json({ message: 'Accès refusé' });
    }

    const accounts = await User.find()
        .select('firstName lastName email creation lastLogin userRole')
        .sort({ creation: -1 })
        .lean();

    res.json(accounts);
}));

router.get('/user/accounts/:id', verifyToken, asyncHandler(async (req, res) => {
    if (!(await requireSuperadmin(req.user.userId))) {
        return res.status(403).json({ message: 'Accès refusé' });
    }

    if (!isObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Identifiant invalide' });
    }

    const account = await User.findById(req.params.id)
        .select('firstName lastName email creation lastLogin userRole')
        .lean();
    if (!account) {
        return res.status(404).json({ message: 'Compte non trouvé' });
    }

    const profiles = await Profile.find({ userId: account._id })
        .select('_id prenom nom email')
        .lean();
    const profileIds = profiles.map((profile) => profile._id);

    let tickets = [];
    if (profileIds.length > 0) {
        const ticketGroups = await Promise.all(
            profileIds.map((profileId) =>
                Ticket.find({ profileId })
                    .populate('priceId', 'title price')
                    .populate({
                        path: 'usages',
                        options: { sort: { date: -1 } },
                    })
                    .lean()
            )
        );
        tickets = ticketGroups
            .flat()
            .sort((a, b) => new Date(b.buyDate) - new Date(a.buyDate));
    }

    const ticketsBought = tickets.length;
    const ticketsUsed = tickets.reduce((sum, ticket) => {
        const byCount = typeof ticket.usageCount === 'number' ? ticket.usageCount : 0;
        const byUsages = Array.isArray(ticket.usages) ? ticket.usages.length : 0;
        return sum + Math.max(byCount, byUsages);
    }, 0);

    const history = [];
    for (const ticket of tickets) {
        const title = ticket.priceId?.title || 'Ticket';
        history.push({
            type: 'purchase',
            date: ticket.buyDate,
            title,
            ticketId: ticket._id,
            profileId: ticket.profileId,
        });
        for (const usage of ticket.usages || []) {
            history.push({
                type: 'usage',
                date: usage.date,
                title,
                ticketId: ticket._id,
                scanData: usage.scanData,
                status: usage.status,
            });
        }
    }
    history.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
        account,
        profiles,
        stats: {
            ticketsBought,
            ticketsUsed,
        },
        tickets: tickets.map((ticket) => ({
            _id: ticket._id,
            title: ticket.priceId?.title || 'Ticket',
            price: ticket.priceId?.price,
            buyDate: ticket.buyDate,
            usageCount: ticket.usageCount,
            usagesCount: Array.isArray(ticket.usages) ? ticket.usages.length : 0,
            status: ticket.status,
            profileId: ticket.profileId,
        })),
        history,
    });
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
