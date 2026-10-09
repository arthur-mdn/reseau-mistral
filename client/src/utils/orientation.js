export function lockPortraitOrientation() {
    const orientation = typeof screen !== 'undefined' ? screen.orientation : null;
    if (orientation && typeof orientation.lock === 'function') {
        return orientation.lock('portrait').catch(() => undefined);
    }
    const legacyLock =
        typeof screen !== 'undefined'
        && (screen.lockOrientation
            || screen.mozLockOrientation
            || screen.msLockOrientation);
    if (typeof legacyLock === 'function') {
        try {
            legacyLock.call(screen, 'portrait');
        } catch {
            // ignore unsupported lock
        }
    }
    return Promise.resolve();
}
