import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import Modal from './Modal'
import {FaMinus, FaPlus} from "react-icons/fa6";
import PaiementRecap from "./PaiementRecap.jsx";
import config from "../config.js";
function Boutique({ onClose, onCheckoutConfirmed }) {
    const [tickets, setTickets] = useState([]);
    const [cookies, setCookie] = useCookies(['selectedProfile']);
    const selectedProfileId = cookies.selectedProfile;
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [purchasedTickets, setPurchasedTickets] = useState([]);

    useEffect(() => {
        axios.get(`${config.serverUrl}/store/prices`, { withCredentials: true })
            .then(response => {
                const ticketsWithQuantity = response.data.map(ticket => ({ ...ticket, quantity: 0 }));
                setTickets(ticketsWithQuantity);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des tickets : ', error);
            });
    }, []);

    const incrementQuantity = (ticketId) => {
        setTickets(currentTickets => currentTickets.map(ticket =>
            ticket._id === ticketId ? { ...ticket, quantity: ticket.quantity + 1 } : ticket
        ));
    };


    const decrementQuantity = (ticketId) => {
        setTickets(currentTickets => currentTickets.map(ticket =>
            ticket._id === ticketId && ticket.quantity > 0 ? { ...ticket, quantity: ticket.quantity - 1 } : ticket
        ));
    };

    const totalPrice = tickets.reduce((acc, ticket) => acc + ticket.quantity * ticket.price, 0);

    const handlePurchase = () => {
        const ticketsToPurchase = tickets
            .filter(ticket => ticket.quantity > 0)
            .map(({ _id, title, price, quantity }) => ({ id: _id, title, price, quantity }));

        setPurchasedTickets(ticketsToPurchase);
        setIsPaymentOpen(true);
    };

    return (
        <>
            {
                tickets.map(ticket => (
                    <div key={ticket._id} className={"price"}>
                        <div className={"fr g1"}>
                            <img src={"/elements/icons/ticket.svg"} alt={"ticket"} style={{width:'25px', marginBottom:'auto'}}/>
                            <div className={"fc"}>
                                <h4 style={{fontWeight:"bold"}}>
                                    {ticket.title}
                                </h4>
                                <p className={"description"}>
                                    {ticket.description}
                                </p>
                            </div>
                        </div>
                        <div>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button type="button" className="decrement" onClick={() => decrementQuantity(ticket._id)}><FaMinus/></button>
                                <h3 style={{fontWeight:"bold"}}>{ticket.quantity}</h3>
                                <button type="button" className="increment" onClick={() => incrementQuantity(ticket._id)}><FaPlus/></button>
                            </div>
                            <div className="price-price">{ticket.price} €</div>
                        </div>

                    </div>
                ))

            }
            {
                totalPrice > 0 &&
                <div className={"total"}>
                    <div>Total :  <h3>{totalPrice.toFixed(2)} €</h3></div>
                    <button type="button" onClick={handlePurchase} style={{marginBottom:'1rem'}}> Acheter</button>
                </div>
            }

            <Modal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} title={"Paiement"}>
                <PaiementRecap onCheckoutConfirmed={()=>{setIsPaymentOpen(false);onCheckoutConfirmed()}} panier={purchasedTickets} onClose={() => setIsPaymentOpen(false)} />
            </Modal>
        </>
    );
}

export default Boutique;
