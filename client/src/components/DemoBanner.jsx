import React, { useEffect, useState } from 'react';
import { DEMO_BANNER_EVENT, isDemoBannerHidden } from '../utils/demoBanner';

const DemoBanner = () => {
    const [hidden, setHidden] = useState(() => isDemoBannerHidden());

    useEffect(() => {
        const sync = () => setHidden(isDemoBannerHidden());
        window.addEventListener(DEMO_BANNER_EVENT, sync);
        window.addEventListener('storage', sync);
        return () => {
            window.removeEventListener(DEMO_BANNER_EVENT, sync);
            window.removeEventListener('storage', sync);
        };
    }, []);

    if (hidden) return null;

    return (
        <div className="demo-banner" role="status" aria-live="polite">
            <div className="demo-banner__stripes" aria-hidden="true" />
            <div className="demo-banner__bar demo-banner__bar--top">
                Démonstration · usage quotidien interdit · non valable en contrôle
            </div>
            <div className="demo-banner__mark" aria-hidden="true">DÉMO</div>
            <div className="demo-banner__bar demo-banner__bar--bottom">
                Simulation éducative · toute utilisation frauduleuse est interdite
            </div>
        </div>
    );
};

export default DemoBanner;
