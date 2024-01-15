require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const storeRoutes = require('./routes/storeRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const config = require('./others/config');
const database = require('./others/database');
const insertPricesIfNotExist = require('./others/insertPricesIfNotExist');

const app = express();
app.use(bodyParser.json());
app.use(cookieParser({
    sameSite: 'none',
    secure: true
}));
app.use(cors({
    origin: config.clientUrl,
    credentials: true
}));

database.connect();

insertPricesIfNotExist();

app.use(authRoutes);
app.use(userRoutes);
app.use(storeRoutes);
app.use(ticketRoutes);

app.listen(config.port, () => {
    console.log('Server started on port ' + config.port );
});
