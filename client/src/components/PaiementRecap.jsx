import React, { useState } from 'react';
import { FaCircleInfo } from 'react-icons/fa6';
import Modal from './Modal';
import Checkout from './Checkout.jsx';

function PaiementRecap({ panier, onCheckoutConfirmed }) {
    const [cgv_checked, setCgv_checked] = useState(false);
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const totalPrice = panier.reduce((acc, ticket) => acc + ticket.quantity * ticket.price, 0).toFixed(2);

    return (
        <>
            <div className={"fc g0-5 h100"} style={{ height: '100%' }}>
                <div className={"fr jc-sb"}>
                    <h2 style={{ fontWeight: 'bold' }}>Total de la commande : </h2>
                    <h2 style={{ fontWeight: 'bold' }}>{totalPrice} €</h2>
                </div>
                <hr style={{ border: '1px solid lightgray', width: '100%', borderStyle: 'dashed' }} />
                <div>
                    {panier.map((ticket) => (
                        <div key={ticket.id}>
                            <div className={"fr jc-sb"}>
                                <span>{ticket.title}</span>
                                <span>{ticket.quantity} x {Number(ticket.price).toFixed(2)} €</span>
                            </div>
                        </div>
                    ))}
                </div>
                <br />
                <br />
                <div
                    className={"fr g0-5 ai-c"}
                    style={{
                        backgroundColor: '#F4F5FC',
                        borderRadius: '0.6rem',
                        padding: '0.75rem 0.85rem',
                        marginBottom: '0.85rem',
                    }}
                >
                    <FaCircleInfo size={18} color="#1B1F9C" style={{ flexShrink: 0 }} />
                    <p style={{ margin: 0, fontSize: '0.8rem', lineHeight: 1.35, color: '#000', fontWeight: 600 }}>
                        ⚠️ VOUS AVEZ CHOISI LE PAIEMENT EN 1 MENSUALITÉ PRÉLEVÉE SUR VOTRE CB 💳
                    </p>
                </div>
                <div className={"fr g0-5 ai-c jc-fs"}>
                    <input
                        type={"checkbox"}
                        id={"cgv"}
                        style={{ colorScheme: 'light' }}
                        checked={cgv_checked}
                        onChange={(e) => setCgv_checked(e.target.checked)}
                    />
                    <label htmlFor={"cgv"} style={{ fontSize: '0.85rem', lineHeight: 1.35, color: '#000' }}>
                        J&apos;ai lu et j&apos;accepte les{' '}
                        <a
                            href="https://instant-system.com/disclaimers/cgv_112.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#1B1F9C', textDecoration: 'underline' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            conditions générales de vente
                        </a>
                    </label>
                </div>
            </div>
            <br />
            <button
                type={"button"}
                style={{ width: '100%', marginTop: 'auto', marginBottom: '1rem' }}
                onClick={() => {
                    if (cgv_checked) {
                        setCheckoutOpen(true);
                    } else {
                        alert("Merci d'accepter les CGV");
                    }
                }}
            >
                Payer
            </button>
            <Modal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} title={"Paiement"} bgColor={"white"}>
                <Checkout
                    panier={panier}
                    onCheckoutConfirmed={() => {
                        setCheckoutOpen(false);
                        onCheckoutConfirmed();
                    }}
                />
            </Modal>
        </>
    );
}

export default PaiementRecap;
