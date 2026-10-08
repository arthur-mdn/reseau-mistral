const PLACEHOLDERS = new Set([
    'SECRET_KEY_FOR_JWT',
    'changeme',
    'secret',
    'your-secret-key',
]);

function requireEnv(name) {
    const value = process.env[name];
    if (!value || !String(value).trim()) {
        throw new Error(`Variable d'environnement manquante: ${name}`);
    }
    return value;
}

const secretKey = requireEnv('SECRET_KEY');
if (PLACEHOLDERS.has(secretKey) || secretKey.length < 16) {
    throw new Error('SECRET_KEY invalide ou trop faible');
}

module.exports = {
    dbUri: requireEnv('DB_URI'),
    port: process.env.PORT || 3000,
    clientUrl: requireEnv('CLIENT_URL'),
    secretKey,
    isProd: process.env.NODE_ENV === 'production',
};
