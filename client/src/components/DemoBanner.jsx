import React from 'react';

const DemoBanner = () => {
    return (
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                textAlign: 'center',
                padding: '10px',
                pointerEvents: 'none',
                zIndex: 1000000000000,
            }}
            role="status"
            aria-live="polite"
        >
            <h3 style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: '0.5rem', borderRadius: '1rem' }}>
                Application de démonstration, usage quotidien strictement interdit.
            </h3>
        </div>
    );
};

export default DemoBanner;
