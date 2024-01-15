import React from 'react';
import axios from 'axios';
import config from "../config.js";
import {useCookies} from "react-cookie";
import {FaQuestion} from "react-icons/fa6";

function Checkout({ onCheckoutConfirmed, panier, onClose }) {
    const handleSubmit = (event) => {
        event.preventDefault();

        axios.post(`${config.serverUrl}/store/buy`, {
            panier
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
        <form onSubmit={handleSubmit} style={{padding:'0 1rem'}} className={"fc g1"}>
            <div>
                <label style={{fontWeight:"bold",color:"grey"}}>Numéro de carte</label>
                <div className={"fr g1 ai-c jc-c"}>
                    <input
                        type="number"
                        required={true}
                        style={{backgroundColor:"#f1f1f1",border:'1px solid lightgrey'}}
                    />
                    <div className={"fc jc-c ai-c"} style={{width:'25px', height:'25px', borderRadius:'4rem', border:'1px solid black'}}>
                        <FaQuestion/>
                    </div>
                </div>

            </div>
            <div>
                <label  style={{fontWeight:"bold",color:"grey"}}>Expire fin</label>
                <div className={"fr g1"}>
                    <select required={true}
                    style={{backgroundColor:"#f1f1f1",border:'1px solid lightgrey'}}>
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

                    <select required={true}
                    style={{backgroundColor:"#f1f1f1",border:'1px solid lightgrey'}}>
                        <option>2024</option>
                        <option>2025</option>
                        <option>2026</option>
                        <option>2027</option>
                        <option>2028</option>
                        <option>2029</option>
                        <option>2030</option>
                        <option>2031</option>
                        <option>2032</option>
                        <option>2033</option>
                        <option>2034</option>
                        <option>2035</option>
                    </select>
                </div>

            </div>
            <div>
                <label  style={{fontWeight:"bold",color:"grey"}}>Cryptogramme visuel</label>
                <div className={"fr g1 ai-c"}>
                    <input
                        type="number"
                        placeholder={"***"}
                        required={true}
                        style={{backgroundColor:"#f1f1f1",border:'1px solid lightgrey',width:'100px'}}
                    />
                    <div className={"fc jc-c ai-c"} style={{width:'25px', height:'25px', borderRadius:'4rem', border:'1px solid black'}}>
                        <FaQuestion/>
                    </div>
                </div>
            </div>

            <div className={"fr g0-5"}>
                <input type={"checkbox"} id={"save"} style={{colorScheme:"light"}}/>
                <label htmlFor={"save"} style={{fontSize:'0.9rem',lineHeight:'1rem'}}>Je souhaite enregistrer les données de mon moyen de paiement pour un futur achat</label>
            </div>

            <br/>
            <button type="submit" style={{margin:"auto"}}>VALIDER</button>
            <img src={"/elements/images/paiments.JPG"} alt={"payment ways"} style={{maxWidth:'300px', margin:'auto', display:"flex"}}/>
        </form>
    );
}

export default Checkout;
