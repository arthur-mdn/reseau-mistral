const config = require('./config');

function originCheck(req, res, next) {
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return next();
    }

    const origin = req.get('Origin') || req.get('Referer');
    if (!origin) {
        return next();
    }

    try {
        const allowed = new URL(config.clientUrl).origin;
        const requestOrigin = new URL(origin).origin;
        if (requestOrigin !== allowed) {
            return res.status(403).json({ message: 'Origine non autorisée' });
        }
    } catch {
        return res.status(403).json({ message: 'Origine non autorisée' });
    }

    return next();
}

module.exports = originCheck;
