import React, { useState } from 'react';
import { FaCalendarDays, FaCircleQuestion, FaCreditCard, FaUser } from 'react-icons/fa6';
import { useCookies } from 'react-cookie';
import api from '../api';
import Loading from './Loading.jsx';

const PAYMENT_LOADER_MS = 3000;

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function Checkout({ onCheckoutConfirmed, panier }) {
    const [cookies] = useCookies(['selectedProfile']);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const totalPrice = (panier || []).reduce((acc, ticket) => acc + ticket.quantity * ticket.price, 0);
    const totalLabel = totalPrice.toFixed(2).replace('.', ',');

    const processPayment = async () => {
        setError(null);
        setSubmitting(true);

        try {
            await Promise.all([
                api.post('/store/buy', {
                    panier,
                    profileId: cookies.selectedProfile,
                }),
                delay(PAYMENT_LOADER_MS),
            ]);
            onCheckoutConfirmed();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l\'achat');
            setSubmitting(false);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        processPayment();
    };

    if (submitting) {
        return <Loading />;
    }

    return (
        <form onSubmit={handleSubmit} className={"checkout-form"}>
            {error && <p style={{ color: 'red', margin: '0 0 0.75rem' }}>{error}</p>}

            <div className={"checkout-cards-banner"}>
                <p className={"checkout-cards-banner__title"}>Cartes</p>
                <img
                    src={"/elements/images/creditcards.jpg"}
                    alt={"CB, Mastercard, Maestro, Visa"}
                    className={"checkout-cards-banner__img"}
                />
            </div>

            <div className={"checkout-field"}>
                <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="Numéro de carte"
                    required
                    aria-label="Numéro de carte"
                />
                <FaCreditCard className={"checkout-field__icon"} aria-hidden="true" />
            </div>

            <div className={"checkout-field"}>
                <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM/AA"
                    required
                    maxLength={5}
                    aria-label="Date d'expiration"
                />
                <FaCalendarDays className={"checkout-field__icon"} aria-hidden="true" />
            </div>

            <div className={"checkout-field"}>
                <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder="Code de sécurité"
                    required
                    maxLength={4}
                    aria-label="Code de sécurité"
                />
                <FaCircleQuestion className={"checkout-field__icon"} aria-hidden="true" />
            </div>

            <div className={"checkout-field"}>
                <input
                    type="text"
                    autoComplete="cc-name"
                    placeholder="Titulaire de la carte"
                    required
                    aria-label="Titulaire de la carte"
                />
                <FaUser className={"checkout-field__icon"} aria-hidden="true" />
            </div>

            <button type="submit" disabled={submitting} className={"checkout-pay-btn"}>
                {`PAYER ${totalLabel} €`}
            </button>

            <p className={"checkout-other-label"}>Autre moyens de paiement :</p>
            <button
                type="button"
                className={"checkout-apple-pay"}
                disabled={submitting}
                onClick={processPayment}
            >
                <img src={"/elements/images/apple-pay.webp"} alt="" className={"checkout-apple-pay__img"} />
                <span>Apple Pay</span>
            </button>
        </form>
    );
}

export default Checkout;
