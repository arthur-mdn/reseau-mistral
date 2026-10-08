const mongoose = require('mongoose');
const { Schema } = mongoose;

const profileSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        index: true,
    },
    nom: {
        type: String,
        required: true,
    },
    prenom: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    birthDate: {
        type: Date,
    },
});

module.exports = mongoose.model('Profile', profileSchema);
