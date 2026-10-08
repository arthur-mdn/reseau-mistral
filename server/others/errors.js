function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    const status = err.status || err.statusCode || 500;
    if (status >= 500) {
        console.error(err);
    }

    const message = status >= 500
        ? 'Erreur serveur'
        : (err.message || 'Requête invalide');

    res.status(status).json({ message });
}

function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

module.exports = {
    errorHandler,
    asyncHandler,
};
