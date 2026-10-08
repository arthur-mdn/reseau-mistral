export function parseDuration(durationString) {
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

export function isTicketActive(ticket, now = new Date()) {
    if (!ticket?.usages?.length || !ticket?.priceId?.maxTime) {
        return false;
    }
    const maxDuration = parseDuration(ticket.priceId.maxTime);
    return ticket.usages.some((usage) => {
        const usageDate = new Date(usage.date);
        return now < new Date(usageDate.getTime() + maxDuration);
    });
}
