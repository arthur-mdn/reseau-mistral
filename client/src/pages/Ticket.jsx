import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {useTopBar} from "../TopBarContext.jsx";
import {useNavigate, useParams} from 'react-router-dom';
import Modal from "../components/Modal.jsx";
import ControlModal from "../components/ControlModal.jsx";
import ControlTouch from "../components/ControlTouch.jsx";
import {FaChevronLeft, FaInfo} from "react-icons/fa6";
import { QRCodeSVG } from 'qrcode.react';
import config from "../config.js";
import Loading from "../components/Loading.jsx";

const decToHex = (dec) => dec.toString(16);

function calculateRemainingTime(ticketUseDate, maxTime) {
    const useDate = new Date(ticketUseDate);
    const maxDuration = parseDuration(maxTime);
    const expireDate = new Date(useDate.getTime() + maxDuration);
    const currentDate = new Date();

    const remainingTime = expireDate - currentDate;
    if (remainingTime <= 0) {
        return '00:00:00'; // Temps expiré
    }

    const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
    const seconds = Math.floor((remainingTime / 1000) % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

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
const getLastUsageDate = (usages) => {
    if (usages && usages.length > 0) {
        return new Date(usages[usages.length - 1].date);
    }
    return null;
};

const getLastUsageFormatted = (usages) => {
    if (usages && usages.length > 0) {
        const lastUsage = usages[usages.length - 1];
        const scanPart = lastUsage.scanData.split("+")[0];
        const hexId = decToHex(lastUsage._id);
        return `${scanPart}-${hexId}`;
    }
    return '';
};

const initializeTimeRemaining = (ticketDetails) => {
    const lastUsageDate = getLastUsageDate(ticketDetails.usages);
    if (lastUsageDate && ticketDetails.priceId.maxTime) {
        return calculateRemainingTime(lastUsageDate, ticketDetails.priceId.maxTime);
    }
    return '';
};

const formatDate = (dateTimeString) => {
    const dateTime = new Date(dateTimeString);
    return dateTime.toLocaleDateString();
};

const formatDateStr = (dateTimeString) => {
    const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

    const date = new Date(dateTimeString);
    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    const dayOfMonth = date.getDate();

    return `${dayName} ${dayOfMonth} ${monthName}`;
};

const formatTime = (dateTimeString) => {
    const dateTime = new Date(dateTimeString);
    return dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const calculateTimePassed = (usages, maxTime) => {
    const lastUsageDate = getLastUsageDate(usages);
    if (!lastUsageDate) return '';

    const maxDuration = parseDuration(maxTime);
    const expireTime = new Date(lastUsageDate.getTime() + maxDuration);
    const currentTime = new Date();

    if (currentTime >= expireTime) {
        return '';
    }

    const timePassed = currentTime - lastUsageDate;
    const minutes = Math.floor((timePassed / (1000 * 60)) % 60);
    const seconds = Math.floor((timePassed / 1000) % 60);

    if (minutes === 0 && seconds === 0) {
        return '';
    }

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const getLastUsage = (usages) => {
    if (usages && usages.length > 0) {
        return usages[usages.length - 1]; // Retourne le dernier usage
    }
    return null;
};

function Ticket() {
    const navigate = useNavigate();
    const { ticketId } = useParams();
    const { setTopBarState } = useTopBar();
    const [ticketDetails, setTicketDetails] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState('');
    const [controlModalOpen, setControlModalOpen] = useState(false);
    const [timePassed, setTimePassed] = useState('');
    const [isControlQrOpen, setIsControlQrOpen] = useState(false);
    const [groupedUsages, setGroupedUsages] = useState({});

    useEffect(() => {
        if (ticketDetails && ticketDetails.usages && ticketDetails.priceId.maxTime) {
            const intervalId = setInterval(() => {
                const remaining = calculateRemainingTime(getLastUsageDate(ticketDetails.usages), ticketDetails.priceId.maxTime);
                setTimeRemaining(remaining);
                const passed = calculateTimePassed(ticketDetails.usages, ticketDetails.priceId.maxTime);
                setTimePassed(passed);
            }, 1000);

            return () => clearInterval(intervalId);
        }
    }, [ticketDetails]);

    useEffect(() => {
        if (ticketDetails) {
            // Regrouper les usages par jour
            const newGroupedUsages = ticketDetails.usages.reduce((acc, usage) => {
                const date = new Date(usage.date).toDateString();
                if (!acc[date]) {
                    acc[date] = [];
                }
                acc[date].push(usage);
                return acc;
            }, {});
            setGroupedUsages(newGroupedUsages);
        }
    }, [ticketDetails]);


    useEffect(() => {
        axios.get(`${config.serverUrl}/tickets/${ticketId}`, { withCredentials: true })
            .then(response => {
                setTicketDetails(response.data);
                setTimeRemaining(initializeTimeRemaining(response.data));
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des détails du ticket:', error);
            });
    }, [ticketId]);

    const deleteTicket = () => {
        axios.delete(`${config.serverUrl}/tickets/${ticketId}`, { withCredentials: true })
            .then(response => {
                navigate('/tickets/', { replace: true });
                console.log('Ticket supprimé avec succès');
            })
            .catch(error => {
                console.error('Erreur lors de la suppression du ticket:', error);
            });
    };


    useEffect(() => {
        setTopBarState({ backLink:{title:"M-Tickets", link:"/tickets/"}, title: 'Votre voyage', isVisible: true, actions: [{title:"Supprimer le ticket", action: function(){deleteTicket()}}] });
        // Réinitialiser lors du démontage
        return () => setTopBarState({ title: '', isVisible: true });
    }, [setTopBarState]);


    const calculateProgressBarWidth = () => {
        if (!ticketDetails || !ticketDetails.usages || ticketDetails.usages.length === 0) {
            return 0; // Pas d'usage enregistré, la barre de progression est vide.
        }
        const lastUsageDate = getLastUsageDate(ticketDetails.usages);
        const maxDuration = parseDuration(ticketDetails.priceId.maxTime);
        const expireTime = new Date(lastUsageDate.getTime() + maxDuration);
        const currentTime = new Date();
        const timePassed = currentTime - lastUsageDate;

        // Calculer le pourcentage du temps écoulé par rapport au temps total de validité.
        const percentage = Math.min((timePassed / maxDuration) * 100, 100);
        return percentage;
    };

    const isExpired = timeRemaining === '00:00:00';
    const lastUsage = getLastUsage(ticketDetails ? ticketDetails.usages : []);
    const B64_ID = getLastUsageFormatted(ticketDetails ? ticketDetails.usages : []);
    return (
        <>
            {ticketDetails ? (
                <>
                    <div className={"fc ai-c jc-fs g1 h100"} style={{padding:"1rem"}}>
                        <div className={"fr g0-5"}>
                            <h3 style={{fontWeight:"bold"}}>En cours d'utilisation</h3>
                            <div className={"hourglass"}>
                                <img src={"/elements/icons/hourglass.png"} alt={"hourglass"}/>
                            </div>
                        </div>
                        <div style={{position:"relative", boxShadow:"rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px", borderRadius:"1.5rem"}}>
                            <img src={`/elements/tickets/${ticketDetails.priceId.image}`} style={{width:'60vw', maxWidth:'400px', minWidth:'200px', padding:'0 1rem'}}/>
                            <div style={{position:"absolute", backgroundColor:"rgba(0,0,0,0.9)", bottom:0, left:0, width:"100%", color:"white", display:"flex", padding:"0.5rem 1rem 0.3rem", flexDirection:"column",alignItems:"center", borderBottomLeftRadius:"1.5rem", borderBottomRightRadius:"1.5rem", border:"4px solid white", borderTop:0}}>
                                <h4 style={{color:"grey", lineHeight:'1rem'}}>Fin de validité :</h4>
                                <span style={{fontSize:'1.3rem',lineHeight:'1.8rem',fontWeight:"bold"}}>{timeRemaining}</span>
                            </div>
                        </div>
                        {/* Afficher les détails du ticket ici */}
                        <h3 style={{fontWeight:"bold"}}>Mes validations</h3>
                        <div style={{width:'100%'}}>
                            {Object.keys(groupedUsages).map((date) => (
                                <div key={date} className={"fc"} style={{gap:'0.3rem'}}>
                                    <span style={{backgroundColor:"#e9e9e9", padding:"0.1rem 0.5rem", borderRadius:'0.25rem', fontSize:'0.8rem', alignSelf:'flex-start'}}>{formatDateStr(date)}</span>
                                    {groupedUsages[date].map((usage) => (
                                        <div key={usage._id} >
                                            <div className={"fr jc-sb"} style={{border:"1px dashed #e5e5e5", borderLeft:0,borderRight:0,padding:'0.4rem 0.5rem 0.3rem'}}>
                                                <div>
                                                    <p style={{lineHeight:"0.9rem",fontSize:'0.9rem'}}>1 validation</p>
                                                    <h4 style={{fontWeight:"bold",lineHeight:"1.3rem"}}>{ticketDetails.priceId.title}</h4>
                                                </div>
                                                <h4 style={{fontWeight:"bold"}}>{formatTime(usage.date)}</h4>
                                            </div>

                                        </div>
                                    ))}
                                </div>
                            ))}

                        </div>
                        {/* Plus de détails... */}
                        <div className={"fr g0-5 ai-c"} style={{margin:'auto auto 0 0'}}>
                            <div className={"fr jc-c ai-c"} style={{backgroundColor:"#1E21A4", width:'20px', height:'20px', borderRadius:'4rem'}}>
                                <FaInfo fill={"white"} size={"10px"}/>
                            </div>
                            <h5 style={{fontWeight:"bold"}}>Comment prendre une correspondance ?</h5>
                        </div>
                        <button type={"button"} style={{width:'100%', padding:'0.5rem 0rem', borderRadius:'0.5rem'}} onClick={()=>{setControlModalOpen(true)}}>Afficher mon titre en cours</button>
                    </div>
                    <ControlModal isOpen={controlModalOpen} onClose={() => setControlModalOpen(false)} onOpenQrCode={() => setIsControlQrOpen(true)} title={""} bgColor={"rgb(41, 41, 41)"}>
                        <div className={"fc h100"} >
                            {isExpired && (
                                <div className={"fc g1 jc-c ai-c"} style={{marginTop:'30%'}}>
                                    <div style={{textAlign: 'center', color: 'black',backgroundColor:"white", borderRadius:'1rem', padding:'0.5rem'}}>
                                        <h1 style={{fontWeight:"bold"}}>Expiré</h1>
                                    </div>
                                    <div id="cercle">
                                        <div id="text1">Durée de validation terminée</div>
                                        <div id="progress-bar-container">
                                            <div id="progress-bar2"></div>
                                        </div>

                                        <div id="circle-container">
                                        <div id="small-circle"></div>
                                        </div>
                                        <div id="text2">Relancez la validation en cliquant ici</div>
                                    </div>
                                </div>
                            )}
                            <div style={{margin:'auto 0 4rem 0'}}>
                                <div style={{backgroundColor: isExpired ? "black" : "white",padding:"0.5rem",borderRadius:'1rem'}} className={"fc g1"}>
                                    <div style={{color: isExpired ? "white" : "black"}}>
                                        <h2 style={{fontWeight:"bold"}}>{ticketDetails.priceId.title}</h2>
                                        <h4 style={{textAlign:"center"}}>Période de validité</h4>
                                        <div className={"fr jc-sb"}>
                                            <div>
                                                <h2 style={{fontWeight:"bold",fontSize:'1.5rem',lineHeight:'1.5rem'}}>{formatDate(lastUsage.date)}</h2>
                                                <h3 style={{textAlign:"center"}}>{formatTime(lastUsage.date)}</h3>
                                            </div>
                                            <div>
                                                <h2 style={{fontWeight:"bold",fontSize:'1.5rem',lineHeight:'1.5rem'}}>{formatDate(new Date(new Date(lastUsage.date).getTime() + parseDuration(ticketDetails.priceId.maxTime)))}</h2>
                                                <h3 style={{textAlign:"center"}}>{formatTime(new Date(new Date(lastUsage.date).getTime() + parseDuration(ticketDetails.priceId.maxTime)))}</h3>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <br/>
                                <div style={{backgroundColor:"white",padding:"0.5rem",borderRadius:'1rem'}} className={"fc g1"}>
                                    <div style={{color: "black"}}>
                                        <h4 style={{textAlign:"center"}}>Informations de contrôle</h4>
                                        <div className={"fr jc-sb"}>
                                            <img src={"/elements/icons/controleur.svg"} style={{width:"45px",marginBottom:"30px"}}/>
                                            <div>
                                                <h2 style={{fontWeight:"bold",textAlign:"center"}}>{formatDate(new Date(new Date(lastUsage.date).getTime() + parseDuration(ticketDetails.priceId.maxTime)))}</h2>
                                                <h3 style={{textAlign:"center",fontSize:'1.3rem',lineHeight:'1.5rem'}}>{formatTime(new Date(new Date(lastUsage.date).getTime() + parseDuration(ticketDetails.priceId.maxTime)))}</h3>
                                                <h1 style={{fontWeight:"bold", fontSize:"1.3rem",textWrap:"nowrap", textTransform:"uppercase",maxWidth:'225px', overflow:"hidden",textOverflow:"ellipsis", textAlign:"center", whiteSpace:'nowrap', wordBreak:"break-word"}}>{B64_ID}</h1>
                                            </div>
                                            <h1 style={{width:'70px', color:'limegreen',fontSize:"1.5rem", fontWeight:"bold"}}>{timePassed}</h1>
                                        </div>
                                    </div>
                                </div>
                                <br/>
                                <div id={"progress-container"} style={{width:'100%', backgroundColor:"grey", borderRadius:"1rem", overflow:"hidden"}}>
                                    <div id={"progress-bar"} style={{width: `${calculateProgressBarWidth()}%`, backgroundColor:"red", height:"10px", borderRadius:"1rem"}}></div>
                                </div>
                            </div>
                            { !isExpired && (
                                <ControlTouch/>
                            )}
                        </div>

                    </ControlModal>
                    <Modal isOpen={isControlQrOpen} onClose={() => setIsControlQrOpen(false)} hideBg={true} title={"Paiement"} padding={0}>
                        <div style={{backgroundColor:"white", width:'100%', height:'100%', color:"black"}}>
                            <div className={"over_top_menu"} style={{backgroundColor:"transparent", justifyContent:"space-between",padding:"0 1rem"}}>
                                <div onClick={()=>{setIsControlQrOpen(false)}} style={{backgroundColor:"white", display:"flex",alignItems:"center",justifyContent:"center",width:"35px",height:"35px",borderRadius:"2rem",zIndex:15}}>
                                    <FaChevronLeft fill={"black"} size={"20px"}/>
                                </div>
                            </div>
                            <div style={{padding:'1rem', display:"flex",flexDirection:"column", alignItems:"center"}}>
                                <QRCodeSVG value={B64_ID} size={150} level={"H"} width={'60%'} height={'60%'} style={{maxWidth:'450px'}}/>
                                <h1 style={{fontWeight:"bold", fontSize:"1.2rem",textWrap:"nowrap", textTransform:"uppercase",marginTop:'1rem', textAlign:"center", whiteSpace:'nowrap', wordBreak:"break-word"}}>{B64_ID}</h1>
                                <h4 style={{marginTop:'1rem'}}>Fin de validation</h4>
                                <div className={"fr jc-sb"} style={{backgroundColor:"black",color:"white", padding:'0.5rem 1rem', borderRadius:'0.5rem'}}>
                                    <div>
                                        <h2 style={{fontWeight:"bold"}}>{formatDate(new Date(new Date(lastUsage.date).getTime() + parseDuration(ticketDetails.priceId.maxTime)))}</h2>
                                        <h3 style={{textAlign:"center"}}>{formatTime(new Date(new Date(lastUsage.date).getTime() + parseDuration(ticketDetails.priceId.maxTime)))}</h3>
                                    </div>
                                </div>
                                <h4 style={{textAlign:"center",marginTop:'1rem'}}>Période de validité</h4>
                                <div className={"fr jc-sb g3"} style={{backgroundColor:"black",color:"white", padding:'0.5rem 1rem', borderRadius:'0.5rem'}}>
                                    <div>
                                        <h2 style={{fontWeight:"bold"}}>{formatDate(lastUsage.date)}</h2>
                                        <h3 style={{textAlign:"center"}}>{formatTime(lastUsage.date)}</h3>
                                    </div>
                                    <div>
                                        <h2 style={{fontWeight:"bold"}}>{formatDate(new Date(new Date(lastUsage.date).getTime() + parseDuration(ticketDetails.priceId.maxTime)))}</h2>
                                        <h3 style={{textAlign:"center"}}>{formatTime(new Date(new Date(lastUsage.date).getTime() + parseDuration(ticketDetails.priceId.maxTime)))}</h3>
                                    </div>
                                </div>
                                <h4 style={{textAlign:"center",marginTop:'1rem'}}>Transport n°</h4>
                                <div className={"fr jc-sb"} style={{backgroundColor:"black",color:"white", padding:'0.5rem 1rem', borderRadius:'0.5rem'}}>
                                    <div>
                                        <h2 style={{fontWeight:"bold"}}>{lastUsage.scanData.split("+")[0]}</h2>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </Modal>
                </>
            ) : (
                <Loading/>
            )}

        </>
    );
}

export default Ticket;
