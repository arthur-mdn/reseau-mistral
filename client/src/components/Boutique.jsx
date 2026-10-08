import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { FaMinus, FaPlus } from 'react-icons/fa6';
import PaiementRecap from './PaiementRecap.jsx';
import api from '../api';

function Boutique({ onCheckoutConfirmed }) {
    const [tickets, setTickets] = useState([]);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [purchasedTickets, setPurchasedTickets] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        api.get('/store/prices', { signal: controller.signal })
            .then((response) => {
                setTickets(response.data.map((ticket) => ({ ...ticket, quantity: 0 })));
            })
            .catch((err) => {
                if (err.name !== 'CanceledError') {
                    setError('Impossible de charger les tarifs');
                }
            });
        return () => controller.abort();
    }, []);

    const incrementQuantity = (ticketId) => {
        setTickets((currentTickets) => currentTickets.map((ticket) =>
            ticket._id === ticketId ? { ...ticket, quantity: ticket.quantity + 1 } : ticket
        ));
    };

    const decrementQuantity = (ticketId) => {
        setTickets((currentTickets) => currentTickets.map((ticket) =>
            ticket._id === ticketId && ticket.quantity > 0 ? { ...ticket, quantity: ticket.quantity - 1 } : ticket
        ));
    };

    const totalPrice = tickets.reduce((acc, ticket) => acc + ticket.quantity * ticket.price, 0);

    const handlePurchase = () => {
        const ticketsToPurchase = tickets
            .filter((ticket) => ticket.quantity > 0)
            .map(({ _id, title, price, quantity }) => ({ id: _id, title, price, quantity }));
        setPurchasedTickets(ticketsToPurchase);
        setIsPaymentOpen(true);
    };

    return (
        <>
            {error && <p style={{ color: 'red', padding: '1rem' }}>{error}</p>}
            {tickets.map((ticket) => (
                <div key={ticket._id} className={"price"}>
                    <div className={"fr g1"}>
                        <img src={"/elements/icons/ticket.svg"} alt="" style={{ width: '25px', marginBottom: 'auto' }} />
                        <div className={"fc"}>
                            <h4 style={{ fontWeight: 'bold' }}>{ticket.title}</h4>
                            <p className={"description"}>{ticket.description}</p>
                        </div>
                    </div>
                    <div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button type="button" aria-label={`Diminuer ${ticket.title}`} className="decrement" onClick={() => decrementQuantity(ticket._id)}>
                                <FaMinus />
                            </button>
                            <h3 style={{ fontWeight: 'bold' }}>{ticket.quantity}</h3>
                            <button type="button" aria-label={`Augmenter ${ticket.title}`} className="increment" onClick={() => incrementQuantity(ticket._id)}>
                                <FaPlus />
                            </button>
                        </div>
                        <div className="price-price">{ticket.price.toFixed(2)} €</div>
                    </div>
                </div>
            ))}
            {totalPrice > 0 && (
                <div className={"total"}>
                    <div>Total : <h3>{totalPrice.toFixed(2)} €</h3></div>
                    <button type="button" onClick={handlePurchase} style={{ marginBottom: '1rem' }}>Acheter</button>
                </div>
            )}
            <Modal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} title={"Paiement"}>
                <PaiementRecap
                    onCheckoutConfirmed={() => {
                        setIsPaymentOpen(false);
                        onCheckoutConfirmed();
                    }}
                    panier={purchasedTickets}
                    onClose={() => setIsPaymentOpen(false)}
                />
            </Modal>
        </>
    );
}

export default Boutique;
