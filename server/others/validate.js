const mongoose = require('mongoose');

const MAX_CART_ITEMS = 20;
const MAX_QUANTITY = 50;
const MAX_TICKETS_PER_ORDER = 100;
const SCAN_DATA_REGEX = /^\d{3}\+\d{3}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;
const MAX_NAME_LENGTH = 100;

function isObjectId(value) {
    return typeof value === 'string' && mongoose.Types.ObjectId.isValid(value);
}

function toObjectId(value) {
    if (!isObjectId(value)) {
        return null;
    }
    return new mongoose.Types.ObjectId(value);
}

function normalizeEmail(email) {
    if (typeof email !== 'string') {
        return null;
    }
    const normalized = email.trim().toLowerCase();
    if (!normalized || normalized.length > 254 || !EMAIL_REGEX.test(normalized)) {
        return null;
    }
    return normalized;
}

function validatePassword(password) {
    return typeof password === 'string'
        && password.length >= MIN_PASSWORD_LENGTH
        && password.length <= MAX_PASSWORD_LENGTH;
}

function validateScanData(scanData) {
    return typeof scanData === 'string' && SCAN_DATA_REGEX.test(scanData);
}

function validateName(value) {
    return typeof value === 'string'
        && value.trim().length > 0
        && value.trim().length <= MAX_NAME_LENGTH;
}

function validateCart(panier) {
    if (!Array.isArray(panier) || panier.length === 0 || panier.length > MAX_CART_ITEMS) {
        return { ok: false, message: 'Panier invalide' };
    }

    let totalTickets = 0;
    for (const item of panier) {
        if (!item || !isObjectId(item.id)) {
            return { ok: false, message: 'Identifiant d\'article invalide' };
        }
        if (!Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QUANTITY) {
            return { ok: false, message: 'Quantité invalide' };
        }
        totalTickets += item.quantity;
        if (totalTickets > MAX_TICKETS_PER_ORDER) {
            return { ok: false, message: 'Nombre de tickets trop élevé' };
        }
    }

    return { ok: true, totalTickets };
}

function parseDuration(durationString) {
    if (typeof durationString !== 'string') {
        return 0;
    }
    const [amount, unit] = durationString.split(' ');
    const n = Number(amount);
    if (!Number.isFinite(n)) {
        return 0;
    }
    switch (unit) {
        case 'hour':
        case 'hours':
            return n * 60 * 60 * 1000;
        case 'day':
        case 'days':
            return n * 24 * 60 * 60 * 1000;
        default:
            return 0;
    }
}

module.exports = {
    MAX_CART_ITEMS,
    MAX_QUANTITY,
    MAX_TICKETS_PER_ORDER,
    isObjectId,
    toObjectId,
    normalizeEmail,
    validatePassword,
    validateScanData,
    validateName,
    validateCart,
    parseDuration,
};
