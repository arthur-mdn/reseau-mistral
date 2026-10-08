const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

process.env.SECRET_KEY = process.env.SECRET_KEY || 'test-secret-key-16chars';
process.env.DB_URI = process.env.DB_URI || 'mongodb://127.0.0.1:27017/test';
process.env.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const User = require('../models/User');
const Ticket = require('../models/Ticket');
const TicketUsage = require('../models/TicketUsage');
const Profile = require('../models/Profile');

describe('models', () => {
  it('hides password by default and has tokenVersion', () => {
    assert.equal(User.schema.path('password').selected, false);
    assert.equal(User.schema.path('tokenVersion').defaultValue, 0);
  });

  it('declares unique email index', () => {
    const indexes = User.schema.indexes();
    assert.ok(indexes.some(([fields, opts]) => fields.email === 1 && opts?.unique));
  });

  it('indexes ownership fields', () => {
    assert.ok(Profile.schema.path('userId').options.index || Profile.schema.indexes().some(([f]) => f.userId === 1));
    assert.ok(Ticket.schema.path('profileId').options.index || Ticket.schema.indexes().some(([f]) => f.profileId === 1));
    assert.ok(TicketUsage.schema.path('ticketId').options.index || TicketUsage.schema.indexes().some(([f]) => f.ticketId === 1));
  });

  it('tracks usageCount on tickets', () => {
    assert.equal(Ticket.schema.path('usageCount').defaultValue, 0);
  });
});
