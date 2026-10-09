export function getTicketImageSrc(image) {
    if (!image) return '';
    const file = String(image)
        .replace(/^\/+/, '')
        .replace(/\.png$/i, '.webp');
    return `/elements/tickets/${file}`;
}
