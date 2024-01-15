import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {useTopBar} from "../TopBarContext.jsx";
import ProfileSelection from "../components/ProfileSelection";
import Boutique from "../components/Boutique";
import Modal from '../components/Modal'
import {useCookies} from "react-cookie";
import {FaCartShopping, FaRightLeft} from "react-icons/fa6";
import TicketSlider from "../components/TicketSlider.jsx";
import Scan from "../components/Scan.jsx";
import { useNavigate } from 'react-router-dom';
import Validations from "../components/Validations.jsx";
import config from "../config.js";
import Loading from "../components/Loading.jsx";
function Tickets() {
    const navigate = useNavigate();
    const { setTopBarState } = useTopBar();
    const [cookies, setCookie, removeCookie] = useCookies(['selectedProfile']);
    const [isProfileSelectionOpen, setIsProfileSelectionOpen] = useState(false);
    const [isBoutiqueOpen, setIsBoutiqueOpen] = useState(false);
    const [profileSelected, setProfileSelected] = useState(null);
    const [ticketSelected, setTicketSelected] = useState(null);
    const [useTicket, setUseTicket] = useState(null);
    const [validationListOpen, setValidationListOpen] = useState(false);
    const [howUseOpen, setHowUseOpen] = useState(false);
    const [paymentSuccessOpen, setPaymentSuccessOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setTopBarState({ backLink:"", title: 'M-Tickets', isVisible: true, actions: [{title:"Mes validations", action: function(){setValidationListOpen(true)}},{title:"Comment utiliser ses titres ?", action: function(){setHowUseOpen(true)}}] });

        // Réinitialiser lors du démontage
        return () => setTopBarState({ title: '', isVisible: true });
    }, [setTopBarState]);

    useEffect(() => {
        if (cookies.selectedProfile) {
            axios.get(`${config.serverUrl}/user/profiles/${cookies.selectedProfile}`, { withCredentials: true })
                .then(response => {
                    setProfileSelected(response.data);
                    setIsLoading(false);
                })
                .catch(error => {
                    console.error('Erreur lors de la récupération du profil:', error);
                    if (error.response && error.response.status === 404) {
                        // Supprimer le cookie si le profil n'est pas trouvé
                        removeCookie('selectedProfile', { path: '/' });
                    }
                });
        }else{
            setIsLoading(false);
        }
    }, [cookies.selectedProfile, removeCookie]);

    const handleTicketSelect = (ticket) => {
        if (ticket.usages && ticket.usages.length > 0) {
            navigate('/tickets/' + ticket._id, { replace: true });
        } else {
            setTicketSelected(ticket);
        }
    };

    const onCheckoutConfirmed = () => {
        // Mettre à jour la liste des tickets du profil
        axios.get(`${config.serverUrl}/user/profiles/${cookies.selectedProfile}`, { withCredentials: true })
            .then(response => {
                setProfileSelected(response.data);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération du profil:', error);
                if (error.response && error.response.status === 404) {
                    // Supprimer le cookie si le profil n'est pas trouvé
                    removeCookie('selectedProfile', { path: '/' });
                }
            });
    }

    const [isSubmitting, setIsSubmitting] = useState(false);
    const useThisTicket = (scanData) => {
        if (isSubmitting) {
            return;
        }
        setIsSubmitting(true);

        axios.post(`${config.serverUrl}/tickets/use`, {
            ticketId: ticketSelected._id,
            scanData: scanData
        },
            { withCredentials: true })
            .then(response => {
                navigate('/tickets/' + ticketSelected._id, { replace: true });
            })
            .catch(error => {
                console.error('Erreur lors de l\'utilisation du ticket:', error);
                setIsSubmitting(false);
            });
    }
    if (isLoading) return (
        <Loading/>
    );

    return (
        <>

            {
                !profileSelected &&
                <>
                    <div className={"no_profile_selected"} style={{textAlign:"center"}}>
                        <h3>Aucun voyageur sélectionné</h3>
                        <p>Veuillez sélectionner un voyageur pour visualiser vos titres.</p>
                        <button type={"button"} onClick={() => setIsProfileSelectionOpen(true)}>Choisir un voyageur</button>
                    </div>
                </>
            }
            {
                profileSelected &&
                <>
                    <div className={"actual_profile_selector"}>
                        <h4>
                            {profileSelected.prenom} {profileSelected.nom}
                        </h4>
                        <div onClick={()=>{setIsProfileSelectionOpen(true)}}>
                            <img src={"/elements/icons/arrows.svg"} style={{width:'15px'}} alt={"->"}/>
                        </div>
                    </div>
                    {
                        (!profileSelected.tickets || profileSelected.tickets.length === 0) &&
                        <div className={"no_tickets"}>
                            <h3>Aucun titre à utiliser.</h3>
                            <p>Vous pouvez acheter des titres pour voyager sur le réseau</p>
                            <button type={"button"} onClick={() => setIsBoutiqueOpen(true)}>Acheter des titres</button>
                        </div>
                    }
                    {
                        profileSelected.tickets && profileSelected.tickets.length > 0 &&
                        <>
                            <div style={{display:"flex",flexDirection:"column", height:"100%"}} className={"bg-grey"}>
                                <h4 style={{padding:' 2rem 1rem 1.3rem', fontSize:'0.9rem'}}>SUR MON TÉLÉPHONE</h4>
                                <div className={"tickets"}>
                                    <TicketSlider
                                        tickets={profileSelected.tickets}
                                        onTicketSelect={handleTicketSelect}
                                    />
                                </div>
                                <button type={"button"} style={{margin:"auto 1rem 1rem 1rem"}} onClick={() => setIsBoutiqueOpen(true)}> <FaCartShopping/>Acheter des titres</button>

                            </div>
                        </>
                    }

                </>
            }

            <Modal isOpen={isProfileSelectionOpen} onClose={() => setIsProfileSelectionOpen(false)} title={"Changer de voyageur"}>
                <ProfileSelection onProfileSelect={(profile) => {setProfileSelected(profile)}} onClose={() => setIsProfileSelectionOpen(false)} />
            </Modal>
            {
                profileSelected && profileSelected.tickets && (
                    <>
                        <Modal isOpen={validationListOpen} onClose={() => setValidationListOpen(false)} title={"Mes validations"} padding={0}>
                            <Validations tickets={profileSelected.tickets} />
                        </Modal>
                        <Modal isOpen={howUseOpen} onClose={() => setHowUseOpen(false)} title={"Comment utiliser ses titres ?"} padding={0}>
                            <>
                            <div style={{padding:'0 1rem'}}>
                                <div className={"fr ai-c g1"} style={{borderBottom:'1px solid lightgrey',padding:'1rem 0'}}>
                                    <div className={"fr jc-c ai-c"} style={{border:'1px solid grey', width:'40px', height:'40px', borderRadius:'4rem', fontWeight:"bold"}}>
                                        1
                                    </div>
                                    <h3>Monter dans le bus par la porte avant</h3>
                                </div>
                                <div className={"fr ai-c g1"} style={{borderBottom:'1px solid lightgrey',padding:'1rem 0'}}>
                                    <div className={"fr jc-c ai-c"} style={{border:'1px solid grey', width:'40px', height:'40px', borderRadius:'4rem', fontWeight:"bold"}}>
                                        2
                                    </div>
                                    <h3>Sélectionner un M-TICKET</h3>
                                </div>
                                <div className={"fr ai-c g1"} style={{borderBottom:'1px solid lightgrey',padding:'1rem 0'}}>
                                    <div className={"fr jc-c ai-c"} style={{border:'1px solid grey', width:'40px', height:'40px', borderRadius:'4rem', fontWeight:"bold"}}>
                                        3
                                    </div>
                                    <h3>Actionnez le bouton "" Scanner le QR Code "" </h3>
                                </div>
                                <div className={"fr ai-c g1"} style={{borderBottom:'1px solid lightgrey',padding:'1rem 0'}}>
                                    <div className={"fr jc-c ai-c"} style={{border:'1px solid grey', width:'40px', height:'40px', borderRadius:'4rem', fontWeight:"bold"}}>
                                        4
                                    </div>
                                    <h3>Scanner le QR Code à proximité du conducteur</h3>
                                </div>
                            </div>
                            </>
                        </Modal>
                    </>

                )
            }

            <Modal isOpen={isBoutiqueOpen} onClose={() => setIsBoutiqueOpen(false)} title={"Acheter"} padding={"0"}>
                <Boutique onClose={() => setIsBoutiqueOpen(false)} onCheckoutConfirmed={()=> {setIsBoutiqueOpen(false);setPaymentSuccessOpen(true);onCheckoutConfirmed()}} />
            </Modal>
            <Modal isOpen={ticketSelected} onClose={() => setTicketSelected(null)} title={"Acheter"} padding={"0"} hideBg={true}>
                <div style={{position:"absolute",top:0,left:0, height:"100%", width:'100%', display:"flex", flexDirection:"column"}}>
                    <div style={{position:"absolute",top:0,left:0, height:"100%", width:'100%', backgroundColor:"rgba(0,0,0,0)", zIndex:9998, display:"flex", flexDirection:"column"}} onClick={()=>{setTicketSelected(null)}}>
                    </div>
                    <div style={{backgroundColor:"white",zIndex:9999,marginTop:"auto", padding:"2rem", borderTopLeftRadius:'1rem', borderTopRightRadius:'1rem'}}>
                        <h2 style={{fontWeight:"bold"}}>{ticketSelected && ticketSelected.priceId.title}</h2>
                        <h4><span style={{fontWeight:"bold"}}>1</span> Voyage disponible</h4>
                        <button type={"button"}  style={{width:"100%", margin:'6rem 0 2rem 0'}} onClick={()=>{setUseTicket(ticketSelected)}}>Utiliser</button>
                    </div>
                </div>
            </Modal>
            <Modal isOpen={useTicket} onClose={() => setUseTicket(false)} title={"Scanner pour valider"} padding={"0"}>
                <Scan onClose={() => setUseTicket(false)} onScanSuccess={(scanData) => {setUseTicket(false); useThisTicket(scanData)}} />
            </Modal>
            <Modal isOpen={paymentSuccessOpen} onClose={() => setPaymentSuccessOpen(false)} title={"Paiement validé"} bgColor={"white"}>
               <div className={"fc ai-c jc-c g1"} style={{textAlign:"center",padding: '2rem 0', height:'100%'}}>
                   <img src={"/elements/images/pay_success.PNG"} alt={"paiment_success"} style={{width:'160px'}}/>
                   <h1 style={{fontWeight:"bold"}}>
                       Paiement validé
                   </h1>
                   <p>Retrouvez vos titres dans votre espace de voyage et utilisez-les pour vous déplacer facilement</p>
                   <button type={"button"}  style={{width:'100%', marginTop:'auto'}} onClick={()=>{setPaymentSuccessOpen(false)}}>Fermer</button>
               </div>
            </Modal>
        </>
    );

}

export default Tickets;
