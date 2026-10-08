const mongoose = require('mongoose');
const config = require('./config');

mongoose.set('sanitizeFilter', true);

module.exports.connect = async () => {
    await mongoose.connect(config.dbUri);
    console.log('MongoDB Connected');
};
