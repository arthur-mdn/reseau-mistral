import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sortTicketsActiveFirst } from '../src/utils/duration.js';

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
