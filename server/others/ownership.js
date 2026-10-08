const Profile = require('../models/Profile');
const { toObjectId } = require('./validate');

async function assertProfileOwned(userId, profileId) {
    const oid = toObjectId(profileId);
    if (!oid) {
        const err = new Error('Profil invalide');
        err.status = 400;
        throw err;
    }

    const profile = await Profile.findOne({ _id: oid, userId }).lean();
    if (!profile) {
        const err = new Error('Profil non trouvé ou non associé à cet utilisateur');
        err.status = 403;
        throw err;
    }
    return profile;
}

function resolveProfileId(req) {
    return req.body?.profileId
        || req.query?.profileId
        || req.headers['x-profile-id']
        || req.cookies?.selectedProfile
        || null;
}

module.exports = {
    assertProfileOwned,
    resolveProfileId,
};
