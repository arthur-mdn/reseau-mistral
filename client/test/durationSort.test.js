import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isTicketUsable, sortTicketsActiveFirst } from '../src/utils/duration.js';

describe('isTicketUsable', () => {
    const now = new Date('2026-10-08T12:00:00.000Z');

    it('keeps unused and active tickets, drops expired ones', () => {
        const unused = { usages: [], priceId: { maxTime: '1 hours' } };
        const active = {
            usages: [{ date: '2026-10-08T11:30:00.000Z' }],
            priceId: { maxTime: '1 hours' },
        };
        const expired = {
            usages: [{ date: '2026-10-08T10:00:00.000Z' }],
            priceId: { maxTime: '1 hours' },
        };

        assert.equal(isTicketUsable(unused, now), true);
        assert.equal(isTicketUsable(active, now), true);
        assert.equal(isTicketUsable(expired, now), false);
    });
});

describe('sortTicketsActiveFirst', () => {
    it('puts active tickets before unused ones', () => {
        const now = new Date('2026-10-08T12:00:00.000Z');
        const unused = {
            _id: 'unused',
            usages: [],
            priceId: { maxTime: '1 hours' },
        };
        const active = {
            _id: 'active',
            usages: [{ date: '2026-10-08T11:30:00.000Z' }],
            priceId: { maxTime: '1 hours' },
        };
        const expired = {
            _id: 'expired',
            usages: [{ date: '2026-10-08T10:00:00.000Z' }],
            priceId: { maxTime: '1 hours' },
        };

        const sorted = sortTicketsActiveFirst([unused, expired, active], now);
        assert.equal(sorted[0]._id, 'active');
        assert.deepEqual(
            sorted.slice(1).map((ticket) => ticket._id).sort(),
            ['expired', 'unused']
        );
    });
});
