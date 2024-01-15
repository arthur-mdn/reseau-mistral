import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import AddProfile from "./AddProfile.jsx";
import {FaTimes} from "react-icons/fa";
import Modal from './Modal'
import Checkout from "./Checkout.jsx";
import {Navigate} from "react-router-dom";
function PaiementRecap({ panier, onClose, onCheckoutConfirmed }) {
    const [profiles, setProfiles] = useState([]);
    const [cookies, setCookie] = useCookies(['selectedProfile']);
    const selectedProfileId = cookies.selectedProfile;
    const [cgv_checked, setCgv_checked] = useState(false);

    const [checkoutOpen, setCheckoutOpen] = useState(false)
    const totalPrice = panier.reduce((acc, ticket) => acc + ticket.quantity * ticket.price, 0).toFixed(1);

    return (
        <>
            <div className={"fc g0-5 h100"} style={{height:"100%"}}>
                <div className={"fr jc-sb"}>
                    <h2 style={{fontWeight:"bold"}}>Total de la commande : </h2>
                    <h2 style={{fontWeight:"bold"}}>{totalPrice} €</h2>
                </div>
                <hr style={{border:"1px solid lightgray", width:"100%", borderStyle:"dashed"}}/>
                <div>
                    {panier.map(ticket => (
                        <div key={ticket.id}>
                            <div className={"fr jc-sb"}>
                                <span>
                                    {ticket.title}
                                </span>
                                <span>
                                    {ticket.quantity} x {ticket.price} €
                                </span>

                            </div>
                        </div>
                    ))}
                </div>
                <br/>
                <br/>
                <div className={"fr g0-5 ai-c jc-fs"}>
                    <input type={"checkbox"} id={"cgv"} style={{colorScheme:"light"}}
                    checked={cgv_checked} onChange={(e) => {setCgv_checked(e.target.checked)}}
                    />
                    <label htmlFor={"cgv"}>J'ai lu et j'accepte les conditions générales de vente</label>
                </div>
            </div>
            <br/>

            <button type={"button"} style={{width:"100%", marginTop:"auto",marginBottom:'1rem'}} onClick={() => {if(cgv_checked){setCheckoutOpen(true)}else{alert("Merci d'accepter les CGV")}}}>
                Payer
            </button>

            <Modal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} title={"Paiement"} bgColor={"white"}>
                <Checkout panier={panier} onCheckoutConfirmed={() => {setCheckoutOpen(false);onCheckoutConfirmed()}} onClose={() => setCheckoutOpen(false)} />
            </Modal>
        </>
    );
}

export default PaiementRecap;
