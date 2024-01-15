import React from 'react';
import axios from 'axios';
import config from "../config.js";
import {useCookies} from "react-cookie";

function Checkout({ onCheckoutConfirmed, panier, onClose }) {
    const [cookies, setCookie, removeCookie] = useCookies(['selectedProfile']);
    const handleSubmit = (event) => {
        event.preventDefault();

        axios.post(`${config.serverUrl}/store/buy`, {
            panier,
            profileId : cookies.selectedProfile
        }, { withCredentials: true })
            .then(response => {
                console.log('Tickets achetés avec succès:', response.data);
                onCheckoutConfirmed()
            })
            .catch(error => {
                console.error('Erreur lors de la création du profil:', error);
            });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Numéro de carte</label>
                <input
                    type="number"
                    placeholder={"Numéro de carte"}
                    required={true}
                    minLength={14}
                    maxLength={18}
                />
            </div>
            <div>
                <label>Expire fin</label>
                <select required={true}>
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
            </div>
            <div>
                <label>Année</label>
                <select required={true}>
                    <option>2023</option>
                    <option>2024</option>
                    <option>2025</option>
                    <option>2026</option>
                </select>
            </div>
            <div>
                <label>Cryptogramme visuel</label>
                <input
                    type="number"
                    placeholder={"***"}
                    required={true}
                    minLength={3}
                    maxLength={3}
                />
            </div>

            <br/>
            <button type="submit" style={{margin:"auto"}}>VALIDER</button>
            <img src={"/elements/images/paiments.JPG"} style={{maxWidth:'300px', margin:'auto', display:"flex"}}/>
        </form>
    );
}

export default Checkout;
