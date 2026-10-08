export const DEMO_BANNER_STORAGE_KEY = 'demoBannerHidden';
export const DEMO_BANNER_EVENT = 'demo-banner-visibility';

export function isDemoBannerHidden() {
    try {
        return localStorage.getItem(DEMO_BANNER_STORAGE_KEY) === '1';
    } catch {
        return false;
    }
}

export function setDemoBannerHidden(hidden) {
    try {
        if (hidden) {
            localStorage.setItem(DEMO_BANNER_STORAGE_KEY, '1');
        } else {
            localStorage.removeItem(DEMO_BANNER_STORAGE_KEY);
        }
    } catch {
        /* ignore */
    }
    window.dispatchEvent(new Event(DEMO_BANNER_EVENT));
}

export function toggleDemoBannerHidden() {
    const next = !isDemoBannerHidden();
    setDemoBannerHidden(next);
    return next;
}
