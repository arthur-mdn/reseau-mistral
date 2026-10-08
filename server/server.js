require('dotenv').config({ quiet: true });
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const storeRoutes = require('./routes/storeRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const config = require('./others/config');
const database = require('./others/database');
const insertPricesIfNotExist = require('./others/insertPricesIfNotExist');
const { errorHandler } = require('./others/errors');
const originCheck = require('./others/originCheck');

async function start() {
    const app = express();
    app.set('trust proxy', 1);
    app.use(express.json({ limit: '32kb' }));
    app.use(cookieParser());
    app.use(cors({
        origin: config.clientUrl,
        credentials: true,
    }));
    app.use(originCheck);

    await database.connect();
    await insertPricesIfNotExist();

    app.get('/health', async (req, res) => {
        const state = mongoose.connection.readyState;
        if (state !== 1) {
            return res.status(503).json({ status: 'unavailable' });
        }
        try {
            await mongoose.connection.db.admin().ping();
            res.json({ status: 'ok' });
        } catch (err) {
            res.status(503).json({ status: 'unavailable' });
        }
    });

    app.use(authRoutes);
    app.use(userRoutes);
    app.use(storeRoutes);
    app.use(ticketRoutes);
    app.use(errorHandler);

    const server = app.listen(config.port, () => {
        console.log('Server started on port ' + config.port);
    });

    const shutdown = async (signal) => {
        console.log(`${signal} received, shutting down`);
        server.close(async () => {
            await mongoose.connection.close().catch(() => {});
            process.exit(0);
        });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((err) => {
    console.error('Failed to start server', err);
    process.exit(1);
});
