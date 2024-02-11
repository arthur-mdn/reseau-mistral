import React, { useState, useEffect } from 'react';
import {Link} from 'react-router-dom';
import axios from 'axios';
import {useTopBar} from "../TopBarContext.jsx";
import {FaHome, FaSearch} from "react-icons/fa";
import {FaLocationArrow, FaSuitcase} from "react-icons/fa6";
import {useCookies} from "react-cookie";
import config from "../config.js";
import Modal from "../components/Modal.jsx";
import Loading from "../components/Loading.jsx";

function parseDuration(durationString) {
    const [amount, unit] = durationString.split(' ');
    switch (unit) {
        case 'hour':
        case 'hours':
            return amount * 60 * 60 * 1000;
        case 'day':
        case 'days':
            return amount * 24 * 60 * 60 * 1000;
        default:
            return 0;
    }
}

function Home() {
    const { setTopBarState } = useTopBar();
    const [profileSelected, setProfileSelected] = useState(null);
    const [cookies, setCookie, removeCookie] = useCookies(['selectedProfile']);
    const [ticketsEnCours, setTicketsEnCours] = useState([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (cookies.selectedProfile) {
            axios.get(`${config.serverUrl}/user/profiles/${cookies.selectedProfile}`, { withCredentials: true })
                .then(response => {
                    setProfileSelected(response.data);
                    checkTicketsEnCours(response.data.tickets);
                })
                .catch(error => {
                    console.error('Erreur lors de la récupération du profil:', error);
                    if (error.response && error.response.status === 404) {
                        // Supprimer le cookie si le profil n'est pas trouvé
                        removeCookie('selectedProfile', { path: '/' });
                        setIsLoading(false);
                    }
                });
        }else{
            setIsLoading(false);
        }
    }, [cookies.selectedProfile, removeCookie]);

    const checkTicketsEnCours = (tickets) => {
        const ticketsActifs = tickets.filter(ticket => {
            return ticket.usages.some(usage => {
                const now = new Date();
                const usageDate = new Date(usage.date);
                const maxDuration = parseDuration(ticket.priceId.maxTime);
                return now < new Date(usageDate.getTime() + maxDuration);
            });
        });
        setTicketsEnCours(ticketsActifs);
        setIsLoading(false);
    };


    useEffect(() => {
        setTopBarState({ isVisible: false });

        return () => setTopBarState({ title: '', isVisible: true });
    }, [setTopBarState]);

    if (isLoading) return (
        <Loading/>
    );

    return (
        <>
            <img src={"/elements/images/plan.jpg"} alt={"plan"} style={{width:'100%', position:"absolute", top:0, zIndex:1}}/>
            <div style={{height:'100%', zIndex:2, display:"flex",flexDirection:"column",color:"white"}}>

                <div style={{backgroundColor:"#1e22aa", marginTop:"auto", padding:'0.5rem 1rem 2rem 1rem',borderRadius: "0.5rem 0.5rem 0 0"}}>
                    <div style={{backgroundColor:"lightgrey", width:'30px', height:'4px',margin:"auto",borderRadius:'1rem',marginBottom:'1rem'}}>

                    </div>
                    <button type={"button"} style={{width:"100%", padding:"0.5rem", borderRadius:"0.5rem", border:"none", outline:"none", marginBottom:'1rem', backgroundColor:"#001269", color:"white",justifyContent:"flex-start"}} onClick={()=>{setIsSearchOpen(true)}}>
                        <FaSearch/> Rechercher un itinéraire
                    </button>
                    {
                        ticketsEnCours.length > 0 && (
                            <div>
                                <div className={"fr jc-sb ai-c"}>
                                    <h4 style={{fontWeight:"bold"}}>Titre(s) en cours</h4>
                                    <img src={"/elements/images/reseau_mistral.jpg"} alt={"logo"} style={{width:'170px'}}/>
                                </div>
                                <div>
                                    {ticketsEnCours.map(ticket => (
                                        <Link onClick={()=>{setIsLoading(true)g}} key={ticket._id} to={`/tickets/${ticket._id}`} style={{backgroundColor:"white", marginTop:'0.25rem',padding:"0.5rem", borderRadius:"0.5rem", color:"black"}} className={"fr ai-c g0-5"}>
                                            <div style={{backgroundColor:"#1E21A4", padding:'0.5rem', borderRadius:'4rem', display:"flex",flexDirection:"row",position:"relative"}}>
                                                <div style={{position:"absolute",top:0,right:0,backgroundColor:"red",borderRadius:'4rem', width:'10px', height:'10px'}}>

                                                </div>
                                                <img src={"/elements/icons/ticket.svg"} style={{width:'15px', filter:'invert(100%) sepia(100%) saturate(0%) hue-rotate(288deg) brightness(102%) contrast(102%)'}} alt={"ticket"}/>
                                            </div>
                                            <div className={"fr g0-5"}>
                                                <h4 style={{fontWeight:"bold"}}>1 titre</h4>
                                                <h4>"1voyage"</h4>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )
                    }

                    <div className={"fr jc-sb ai-c"} style={{marginTop:'2rem'}}>
                        <h4 style={{fontWeight:"bold"}}>On y va ?</h4>
                        {
                            ticketsEnCours.length <= 0 && (
                                <img src={"/elements/images/reseau_mistral.jpg"} alt={"logo"} style={{width:'160px'}}/>
                            )
                        }
                    </div>
                    <div style={{backgroundColor:"white", marginTop:'0.25rem',padding:"0.5rem", borderRadius:"0.5rem", color:"black"}} className={"fc g1"}>
                        <div className={"fr jc-sb ai-c"}>
                            <div className={"fr ai-c g0-5 jc-c"}>
                                <div style={{backgroundColor:"grey", padding:'0.5rem', borderRadius:'4rem', display:"flex",flexDirection:"row"}}>
                                    <FaHome fill={"white"}/>
                                </div>
                                <h4>Maison</h4>
                            </div>
                            <div style={{border:"1px solid lightgrey", padding:'0.1rem 0.6rem', fontSize:'0.8rem',fontWeight:"bold", borderRadius:'0.25rem'}}>
                                Définir
                            </div>
                        </div>
                        <div className={"fr jc-sb ai-c"}>
                            <div className={"fr ai-c g0-5 jc-c"}>
                                <div style={{backgroundColor:"grey", padding:'0.5rem', borderRadius:'4rem', display:"flex",flexDirection:"row"}}>
                                    <FaSuitcase fill={"white"}/>
                                </div>
                                <h4>Travail</h4>
                            </div>
                            <div style={{border:"1px solid lightgrey", padding:'0.1rem 0.6rem', fontSize:'0.8rem',fontWeight:"bold", borderRadius:'0.25rem'}}>
                                Définir
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Modal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} title={"Rechercher"}>
                <div>
                    <input type={"text"} placeholder={"Arrivée"} style={{padding:"1rem", width:"100%", margin:"1rem 0"}}/>

                    <div className={"fr ai-c g1"} style={{padding:'0.8rem 0 0.8rem 0',borderBottom:'1px solid lightgrey'}}>
                        <div style={{backgroundColor:"#0761ad", width:'40px',height:'40px', borderRadius:'4rem', display:"flex",alignItems:"center",justifyContent:"center"}}>
                            <FaLocationArrow fill={"white"} size={"20px"}/>
                        </div>
                        <h4 style={{fontWeight:"bold"}}>Ma position</h4>
                    </div>

                    <div style={{ marginTop:'0.25rem',padding:'1rem 0 0 0', borderRadius:"0.5rem", color:"black"}} className={"fc g1"}>
                        <div className={"fr jc-sb ai-c"}>
                            <div className={"fr ai-c g0-5 jc-c"}>
                                <div style={{backgroundColor:"grey", padding:'0.5rem', borderRadius:'4rem', display:"flex",flexDirection:"row"}}>
                                    <FaHome fill={"white"}/>
                                </div>
                                <h4>Maison</h4>
                            </div>
                            <div style={{border:"1px solid lightgrey", padding:'0.1rem 0.6rem', fontSize:'0.8rem',fontWeight:"bold", borderRadius:'0.25rem'}}>
                                Définir
                            </div>
                        </div>
                        <div className={"fr jc-sb ai-c"}>
                            <div className={"fr ai-c g0-5 jc-c"}>
                                <div style={{backgroundColor:"grey", padding:'0.5rem', borderRadius:'4rem', display:"flex",flexDirection:"row"}}>
                                    <FaSuitcase fill={"white"}/>
                                </div>
                                <h4>Travail</h4>
                            </div>
                            <div style={{border:"1px solid lightgrey", padding:'0.1rem 0.6rem', fontSize:'0.8rem',fontWeight:"bold", borderRadius:'0.25rem'}}>
                                Définir
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );

}

export default Home;
