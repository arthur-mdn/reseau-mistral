const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');

process.env.SECRET_KEY = process.env.SECRET_KEY || 'test-secret-key-16chars';
process.env.DB_URI = process.env.DB_URI || 'mongodb://127.0.0.1:27017/reseau-mistral-test-claim';
process.env.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const Ticket = require('../models/Ticket');
const TicketUsage = require('../models/TicketUsage');
const Profile = require('../models/Profile');
const Price = require('../models/Price');
const User = require('../models/User');
const { claimTicketSlot, syncUsageCount } = require('../others/ticketClaim');

describe('ticketClaim', () => {
    let connected = false;
    let user;
    let profile;
    let price;

    before(async () => {
        mongoose.set('sanitizeFilter', true);
        await mongoose.connect(process.env.DB_URI);
        connected = true;
    });

    after(async () => {
        if (!connected) return;
        await mongoose.connection.dropDatabase().catch(() => {});
        await mongoose.connection.close().catch(() => {});
    });

    beforeEach(async () => {
        await Promise.all([
            Ticket.deleteMany({}),
            TicketUsage.deleteMany({}),
            Profile.deleteMany({}),
            Price.deleteMany({}),
            User.deleteMany({}),
        ]);

        user = await User.create({
            email: `claim-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`,
            password: 'hashed-password-value',
            firstName: 'Test',
            lastName: 'User',
            birthDate: new Date('1990-01-01'),
        });

        profile = await Profile.create({
            userId: user._id,
            nom: 'User',
            prenom: 'Test',
            email: user.email,
        });

        price = await Price.create({
            title: `Prix claim ${Date.now()}-${Math.random().toString(16).slice(2)}`,
            type: 'ticket',
            price: 1.5,
            maxUse: 2,
            maxTime: '0 minute',
            status: 'active',
        });
    });

    it('rejects array updates without updatePipeline option', () => {
        assert.throws(
            () => Ticket.findOneAndUpdate(
                { _id: new mongoose.Types.ObjectId() },
                [{ $set: { usageCount: 1 } }],
                { returnDocument: 'after' }
            ),
            (error) => {
                assert.match(String(error.message), /updatePipeline/);
                return true;
            }
        );
    });

    it('claims a ticket slot atomically without update pipeline', async () => {
        const ticket = await Ticket.create({
            profileId: profile._id,
            priceId: price._id,
            usageCount: 0,
            usages: [],
        });

        const claimed = await claimTicketSlot(ticket._id, 2);
        assert.ok(claimed);
        assert.equal(claimed.usageCount, 1);

        const claimedAgain = await claimTicketSlot(ticket._id, 2);
        assert.ok(claimedAgain);
        assert.equal(claimedAgain.usageCount, 2);

        const overLimit = await claimTicketSlot(ticket._id, 2);
        assert.equal(overLimit, null);

        const stored = await Ticket.findById(ticket._id).lean();
        assert.equal(stored.usageCount, 2);
    });

    it('syncs usageCount when usages array is ahead', async () => {
        const phantomUsage = await TicketUsage.create({
            ticketId: new mongoose.Types.ObjectId(),
            scanData: '123+456',
            date: new Date(),
        });

        const ticket = await Ticket.create({
            profileId: profile._id,
            priceId: price._id,
            usageCount: 0,
            usages: [phantomUsage._id, phantomUsage._id],
        });

        const synced = await syncUsageCount(ticket._id);
        assert.equal(synced, 2);

        const overLimit = await claimTicketSlot(ticket._id, 2);
        assert.equal(overLimit, null);

        const stillAvailable = await claimTicketSlot(ticket._id, 3);
        assert.ok(stillAvailable);
        assert.equal(stillAvailable.usageCount, 3);
    });

    it('handles concurrent claims without exceeding maxUse', async () => {
        const ticket = await Ticket.create({
            profileId: profile._id,
            priceId: price._id,
            usageCount: 0,
            usages: [],
        });

        const results = await Promise.all([
            claimTicketSlot(ticket._id, 1),
            claimTicketSlot(ticket._id, 1),
            claimTicketSlot(ticket._id, 1),
        ]);

        const successes = results.filter(Boolean);
        assert.equal(successes.length, 1);
        assert.equal(successes[0].usageCount, 1);

        const stored = await Ticket.findById(ticket._id).lean();
        assert.equal(stored.usageCount, 1);
    });

    it('allows TicketUsage date $gte queries under sanitizeFilter', async () => {
        const ticket = await Ticket.create({
            profileId: profile._id,
            priceId: price._id,
            usageCount: 0,
            usages: [],
        });

        const now = new Date();
        await TicketUsage.create({
            ticketId: ticket._id,
            scanData: '111+222',
            date: now,
        });

        const recent = await TicketUsage.findOne({
            ticketId: ticket._id,
            date: mongoose.trusted({ $gte: new Date(now.getTime() - 1000) }),
        }).lean();

        assert.ok(recent);
        assert.equal(recent.scanData, '111+222');

        const none = await TicketUsage.findOne({
            ticketId: ticket._id,
            date: mongoose.trusted({ $gte: new Date(now.getTime() + 60_000) }),
        }).lean();
        assert.equal(none, null);
    });
});
