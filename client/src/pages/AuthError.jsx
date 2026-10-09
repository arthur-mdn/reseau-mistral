import React, { useState } from 'react';
import { useAuth } from '../AuthContext.jsx';

function AuthError() {
    const { retrySession } = useAuth();
    const [retrying, setRetrying] = useState(false);

    const handleRetry = async () => {
        if (retrying) return;
        setRetrying(true);
        try {
            await retrySession();
        } finally {
            setRetrying(false);
        }
    };

    return (
        <div
            style={{
                minHeight: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem 1.5rem',
                backgroundColor: '#1B1F9C',
                color: '#fff',
                textAlign: 'center',
                boxSizing: 'border-box',
            }}
        >
            <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700 }}>
                Connexion impossible
            </h1>
            <p style={{ margin: '0.85rem 0 0', maxWidth: '22rem', lineHeight: 1.45, opacity: 0.9 }}>
                Le serveur ne répond pas pour le moment. Vérifie ta connexion, puis réessaie.
            </p>
            <button
                type="button"
                onClick={handleRetry}
                disabled={retrying}
                style={{
                    marginTop: '1.75rem',
                    width: '100%',
                    maxWidth: '18rem',
                    padding: '0.9rem 1rem',
                    border: 0,
                    borderRadius: '0.5rem',
                    backgroundColor: '#fff',
                    color: '#1B1F9C',
                    fontWeight: 700,
                    opacity: retrying ? 0.7 : 1,
                }}
            >
                {retrying ? 'Nouvelle tentative…' : 'Réessayer'}
            </button>
        </div>
    );
}

export default AuthError;
