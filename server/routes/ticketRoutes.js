const Profile = require("../models/Profile");
const Ticket = require("../models/Ticket");
const express = require("express");
const router = express.Router();
const verifyToken = require('../others/verifyToken');
const TicketUsage = require("../models/TicketUsage");


router.post('/tickets/use', verifyToken, async (req, res) => {
    const { ticketId, scanData } = req.body;

    try {
        const newUsage = new TicketUsage({
            ticketId,
            scanData
        });
        await newUsage.save();

        await Ticket.findByIdAndUpdate(ticketId, {
            $push: { usages: newUsage._id }
        });

        res.json({ message: 'Usage enregistré avec succès', usage: newUsage });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur: ' + error });
    }
});


router.get('/tickets/:ticketId', verifyToken, async (req, res) => {
    try {
        const ticketId = req.params.ticketId;
        const userId = req.user.userId;
        const profileId = req.cookies['selectedProfile'];

        const ticket = await Ticket.findOne({
            _id: ticketId,
            'profileId': profileId
        }).populate('priceId').populate('usages');

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket non trouvé ou non associé à ce profil' });
        }
        const profile = await Profile.findOne({
            _id: profileId,
            'userId': userId
        });

        if (!profile) {
            return res.status(404).json({ message: 'Profil non trouvé ou non associé à cet utilisateur' });
        }

        res.json(ticket);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur: ' + error });
    }
});



module.exports = router;