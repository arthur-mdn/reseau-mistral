const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Profile = require('../models/Profile');
const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const config = require('../others/config');
const {
    normalizeEmail,
    validatePassword,
    validateName,
} = require('../others/validate');
const {
    sessionCookieOptions,
    clearSessionCookieOptions,
    SESSION_MAX_AGE_MS,
} = require('../others/cookies');
const { asyncHandler } = require('../others/errors');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Trop de tentatives, réessaie plus tard' },
});

function signToken(user) {
    return jwt.sign(
        { userId: user._id.toString(), tokenVersion: user.tokenVersion || 0 },
        config.secretKey,
        { expiresIn: '7d', algorithm: 'HS256' }
    );
}

router.post('/auth/login', authLimiter, asyncHandler(async (req, res) => {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!email || !validatePassword(password)) {
        return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    const user = await User.findOne({ email }).select('+password tokenVersion');
    if (!user) {
        return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    const token = signToken(user);
    res.cookie('session_token', token, sessionCookieOptions(SESSION_MAX_AGE_MS));
    res.json({ message: 'Authentification réussie' });
}));

router.post('/auth/register', authLimiter, asyncHandler(async (req, res) => {
    const email = normalizeEmail(req.body.email);
    const { password, lastName, firstName, birthDate } = req.body;

    if (!email || !validatePassword(password) || !validateName(lastName) || !validateName(firstName)) {
        return res.status(400).json({ message: 'Données d\'inscription invalides' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'Un compte avec cette adresse e-mail existe déjà.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let newUser;

    try {
        newUser = await User.create({
            lastName: lastName.trim(),
            firstName: firstName.trim(),
            birthDate,
            email,
            password: hashedPassword,
            tokenVersion: 0,
        });

        await Profile.create({
            userId: newUser._id,
            nom: lastName.trim(),
            prenom: firstName.trim(),
            email,
            birthDate,
        });
    } catch (error) {
        if (newUser) {
            await User.findByIdAndDelete(newUser._id).catch(() => {});
        }
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Un compte avec cette adresse e-mail existe déjà.' });
        }
        throw error;
    }

    const token = signToken(newUser);
    res.cookie('session_token', token, sessionCookieOptions(SESSION_MAX_AGE_MS));
    res.status(201).json({ message: 'Inscription réussie' });
}));

router.get('/auth/validate-session', asyncHandler(async (req, res) => {
    const token = req.cookies['session_token'];
    if (!token) {
        return res.json({ isAuthenticated: false });
    }
    try {
        const decoded = jwt.verify(token, config.secretKey, { algorithms: ['HS256'] });
        const user = await User.findById(decoded.userId).select('_id tokenVersion');
        if (!user || user.tokenVersion !== decoded.tokenVersion) {
            return res.json({ isAuthenticated: false });
        }
        res.json({ isAuthenticated: true });
    } catch (err) {
        res.json({ isAuthenticated: false });
    }
}));

router.post('/auth/logout', asyncHandler(async (req, res) => {
    const token = req.cookies['session_token'];
    if (token) {
        try {
            const decoded = jwt.verify(token, config.secretKey, { algorithms: ['HS256'] });
            await User.findByIdAndUpdate(decoded.userId, { $inc: { tokenVersion: 1 } });
        } catch {
            // token already invalid
        }
    }
    res.clearCookie('session_token', clearSessionCookieOptions());
    res.json({ message: 'Déconnexion réussie' });
}));

module.exports = router;
