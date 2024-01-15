const User = require("../models/User");
const Profile = require("../models/Profile");
const Ticket = require("../models/Ticket");
const express = require("express");
const router = express.Router();
const verifyToken = require('../others/verifyToken');

router.post('/user/profiles/new', verifyToken, async (req, res) => {
    try {
        const { firstName, lastName, email } = req.body;

        const newProfile = new Profile({
            userId: req.user.userId,
            nom: firstName,
            prenom: lastName,
            email: email
        });
        await newProfile.save();
        res.status(201).json(newProfile);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

router.get('/user/details', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur'+error });
    }
});

router.get('/user/profiles', verifyToken, async (req, res) => {
    try {
        const profiles = await Profile.find({ userId: req.user.userId });
        res.json(profiles);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur'+error });
    }
});

router.get('/user/profiles/:id', verifyToken, async (req, res) => {
    try {
        const profile = await Profile.findOne({ _id: req.params.id, userId: req.user.userId });
        if (!profile) {
            return res.status(404).json({ message: 'Profil non trouvé' });
        }

        const tickets = await Ticket.find({ profileId: profile._id }).populate('priceId').populate('usages');

        const profileWithTickets = {
            ...profile.toObject(),
            tickets: tickets
        };

        res.json(profileWithTickets);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur: ' + error });
    }
});
router.get('/user/profiles/:id/tickets', verifyToken, async (req, res) => {
    try {
        const profile = await Profile.findOne({ _id: req.params.id, userId: req.user.userId });
        if (!profile) {
            return res.status(404).json({ message: 'Profil non trouvé' });
        }

        const tickets = await Ticket.find({ profileId: profile._id }).populate('priceId').populate('usages');
        const profileWithTickets = {
            ...profile.toObject(),
            tickets: tickets
        };

        res.json(profileWithTickets);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur: ' + error });
    }
});

module.exports = router;