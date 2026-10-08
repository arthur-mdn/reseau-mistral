const jwt = require('jsonwebtoken');
const config = require('./config');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
    const token = req.cookies['session_token'];
    if (!token) {
        return res.status(403).json({ message: 'Un token est requis pour l\'authentification' });
    }

    try {
        const decoded = jwt.verify(token, config.secretKey, { algorithms: ['HS256'] });
        const user = await User.findById(decoded.userId).select('_id tokenVersion');
        if (!user || user.tokenVersion !== decoded.tokenVersion) {
            return res.status(401).json({ message: 'Token invalide' });
        }
        req.user = { userId: user._id.toString(), tokenVersion: user.tokenVersion };
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token invalide' });
    }
};

module.exports = verifyToken;
