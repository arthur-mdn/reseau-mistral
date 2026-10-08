const isProd = process.env.NODE_ENV === 'production';

function sessionCookieOptions(maxAgeMs = 7 * 24 * 60 * 60 * 1000) {
    return {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: maxAgeMs,
    };
}

function clearSessionCookieOptions() {
    return {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
    };
}

module.exports = {
    sessionCookieOptions,
    clearSessionCookieOptions,
    SESSION_MAX_AGE_MS: 7 * 24 * 60 * 60 * 1000,
};
