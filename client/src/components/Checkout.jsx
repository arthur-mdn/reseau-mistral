import React, { useState } from 'react';
import { FaQuestion } from 'react-icons/fa6';
import { useCookies } from 'react-cookie';
import api from '../api';

function Checkout({ onCheckoutConfirmed, panier }) {
    const [cookies] = useCookies(['selectedProfile']);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();
        setError(null);
        setSubmitting(true);

        api.post('/store/buy', {
            panier,
            profileId: cookies.selectedProfile,
        })
            .then(() => {
                onCheckoutConfirmed();
            })
            .catch((err) => {
                setError(err.response?.data?.message || 'Erreur lors de l\'achat');
                setSubmitting(false);
            });
    };

    return (
        <form onSubmit={handleSubmit} style={{ padding: '0 1rem' }} className={"fc g1"}>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                <label htmlFor="card-number" style={{ fontWeight: 'bold', color: 'grey' }}>Numéro de carte</label>
                <div className={"fr g1 ai-c jc-c"}>
                    <input
                        id="card-number"
                        type="text"
                        inputMode="numeric"
                        required
                        style={{ backgroundColor: '#f1f1f1', border: '1px solid lightgrey' }}
                    />
                    <div className={"fc jc-c ai-c"} style={{ width: '25px', height: '25px', borderRadius: '4rem', border: '1px solid black' }} aria-hidden="true">
                        <FaQuestion />
                    </div>
                </div>
            </div>
            <div>
                <label htmlFor="card-month" style={{ fontWeight: 'bold', color: 'grey' }}>Expire fin</label>
                <div className={"fr g1"}>
                    <select id="card-month" required style={{ backgroundColor: '#f1f1f1', border: '1px solid lightgrey' }}>
                        <option>01-Janvier</option>
                        <option>02-Février</option>
                        <option>03-Mars</option>
                        <option>04-Avril</option>
                        <option>05-Mai</option>
                        <option>06-Juin</option>
                        <option>07-Juillet</option>
                        <option>08-Août</option>
                        <option>09-Septembre</option>
                        <option>10-Octobre</option>
                        <option>11-Novembre</option>
                        <option>12-Décembre</option>
                    </select>
                    <select id="card-year" required aria-label="Année d'expiration" style={{ backgroundColor: '#f1f1f1', border: '1px solid lightgrey' }}>
                        {Array.from({ length: 12 }, (_, i) => 2024 + i).map((year) => (
                            <option key={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div>
                <label htmlFor="card-cvc" style={{ fontWeight: 'bold', color: 'grey' }}>Cryptogramme visuel</label>
                <div className={"fr g1 ai-c"}>
                    <input
                        id="card-cvc"
                        type="text"
                        inputMode="numeric"
                        required
                        maxLength={4}
                        style={{ backgroundColor: '#f1f1f1', border: '1px solid lightgrey', width: '100px' }}
                    />
                </div>
            </div>
            <button type="submit" disabled={submitting} style={{ width: '100%', marginTop: '1rem' }}>
                {submitting ? 'Paiement...' : 'Payer'}
            </button>
        </form>
    );
}

export default Checkout;
