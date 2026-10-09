import { useEffect } from 'react';
import { lockPortraitOrientation } from '../utils/orientation.js';

function OrientationLock() {
    useEffect(() => {
        lockPortraitOrientation();

        const onVisibility = () => {
            if (document.visibilityState === 'visible') {
                lockPortraitOrientation();
            }
        };

        document.addEventListener('visibilitychange', onVisibility);
        window.addEventListener('orientationchange', lockPortraitOrientation);

        return () => {
            document.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('orientationchange', lockPortraitOrientation);
        };
    }, []);

    return (
        <div className="orientation-lock" role="alert" aria-live="polite">
            <p className="orientation-lock__title">Tournez votre appareil</p>
            <p className="orientation-lock__text">
                L'application fonctionne uniquement en mode portrait.
            </p>
        </div>
    );
}

export default OrientationLock;
