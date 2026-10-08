import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {useTopBar} from "../TopBarContext.jsx";
import {useNavigate, useParams} from 'react-router-dom';
import Modal from "../components/Modal.jsx";
import ControlModal from "../components/ControlModal.jsx";
import ControlTouch from "../components/ControlTouch.jsx";
import {FaBus, FaChevronLeft, FaInfo} from "react-icons/fa6";
import { QRCodeSVG } from 'qrcode.react';
import config from "../config.js";
import Loading from "../components/Loading.jsx";

const CONTROL_GREEN = '#348C0D';
const CONTROL_TITLE_BG = '#C0C0E6';

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

const parseScanData = (scanData = '') => {
    const [prefix = '', transport = ''] = String(scanData).split('+');
    return { prefix, transport };
};

const getLastUsageFormatted = (usages) => {
    if (usages && usages.length > 0) {
        const lastUsage = usages[usages.length - 1];
        const { prefix } = parseScanData(lastUsage.scanData);
        const hexId = decToHex(lastUsage._id).slice(0, 13);
        return `${prefix}-${hexId}`;
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

const formatDateTime = (dateTimeString) => {
    const dateTime = new Date(dateTimeString);
    return `${dateTime.toLocaleDateString('fr-FR')} à ${dateTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
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
    const [correspondanceModalOpen, setCorrespondanceModalOpen] = useState(false);
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
    const expireDate = lastUsage && ticketDetails
        ? new Date(new Date(lastUsage.date).getTime() + parseDuration(ticketDetails.priceId.maxTime))
        : null;
    const transportNumber = parseScanData(lastUsage?.scanData).transport;
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
                            <h5 style={{fontWeight:"bold", opacity:'0.5'}}>Comment prendre une correspondance ?</h5>
                        </div>
                        <div className={"fc g1 w100"} style={{gap:'0.5rem',width:'100%'}}>
                            <button type={"button"} style={{width:'100%', padding:'0.5rem 0rem', borderRadius:'0.5rem'}} onClick={()=>{setControlModalOpen(true)}}>Afficher mon titre en cours</button>
                            <button type={"button"} style={{width:'100%', padding:'0.5rem 0rem', borderRadius:'0.5rem'}} onClick={()=>{setCorrespondanceModalOpen(true)}}>Prendre une correspondance</button>
                        </div>
                    </div>
                    <Modal isOpen={correspondanceModalOpen} onClose={() => setCorrespondanceModalOpen(false)} title={""} padding={"0"} hideBg={true}>
                        <div style={{position:"absolute",top:0,left:0, height:"100%", width:'100%', display:"flex", flexDirection:"column"}}>
                            <div style={{position:"absolute",top:0,left:0, height:"100%", width:'100%', backgroundColor:"rgba(0,0,0,0)", zIndex:9998}} onClick={()=>{setCorrespondanceModalOpen(false)}}>
                            </div>
                            <div style={{backgroundColor:"white",zIndex:9999,marginTop:"auto", padding:"2rem", borderTopLeftRadius:'1rem', borderTopRightRadius:'1rem'}}>
                                <h2 style={{fontWeight:"bold"}}>{ticketDetails.priceId.title}</h2>
                                <h4><span style={{fontWeight:"bold"}}>1</span> Voyage disponible</h4>
                                <p style={{marginTop:'1rem', color:'#555'}}>
                                    Du {formatDate(lastUsage.date)} au {formatDate(new Date(new Date(lastUsage.date).getTime() + parseDuration(ticketDetails.priceId.maxTime)))}
                                </p>
                                <button type={"button"} style={{width:"100%", margin:'3rem 0 1rem 0'}} onClick={()=>{}}>Utiliser</button>
                            </div>
                        </div>
                    </Modal>
                    <ControlModal isOpen={controlModalOpen} onClose={() => setControlModalOpen(false)} bgColor={"#000"}>
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
                            <div style={{margin:'auto 0 2rem 0', display:'flex', flexDirection:'column', gap:'0.75rem', zIndex:20, position:'relative'}}>
                                <div style={{backgroundColor:'white', borderRadius:'0.75rem', overflow:'hidden', border:'1px solid #949493'}}>
                                    <div style={{display:'flex', alignItems:'stretch', backgroundColor:CONTROL_TITLE_BG, minHeight:'35px'}}>
                                        <div style={{backgroundColor:'white', display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.35rem 0.65rem', margin:'0 0.55rem 0 0', borderRadius:'0 0 0.85rem 0', border:'1px solid #949493', borderTop:0,borderLeft:0}}>
                                            <img src={"/elements/icons/user-check.png"} alt="" style={{width:'1.15rem', height:'1.15rem', objectFit:'contain', display:'block'}}/>
                                            <span style={{fontWeight:900, fontSize:'1.15rem', color:'#1a1a1a', lineHeight:1}}>1</span>
                                        </div>
                                        <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'flex-end', padding:'0 0.85rem'}}>
                                            <span style={{fontWeight:'bold', fontSize:'1.2rem', color:'#1a1a1a'}}>{ticketDetails.priceId.title}</span>
                                        </div>
                                    </div>
                                    <div style={{display:'flex', padding:'0.75rem 0.85rem', gap:'0.75rem', alignItems:'center'}}>
                                        <div style={{flex:1, minWidth:0}}>
                                            <p style={{fontSize:'0.8rem', color:'#666'}}>Période de validité</p>
                                            <div style={{display:'flex', alignItems:'center', gap:'0.45rem'}}>
                                                <img src={"/elements/icons/calendar-check.png"} alt="" style={{width:'18px', height:'18px', objectFit:'contain'}}/>
                                                <span style={{fontSize:'0.9rem', color:'#1a1a1a'}}>{formatDateTime(lastUsage.date)}</span>
                                            </div>
                                            <div style={{display:'flex', alignItems:'center', gap:'0.45rem'}}>
                                                <img src={"/elements/icons/calendar-cross.png"} alt="" style={{width:'18px', height:'18px', objectFit:'contain'}}/>
                                                <span style={{fontSize:'0.9rem', color:'#1a1a1a'}}>{formatDateTime(new Date(new Date(lastUsage.date).getTime() + parseDuration(ticketDetails.priceId.maxTime)))}</span>
                                            </div>
                                        </div>
                                        <div style={{width:'1px', backgroundColor:'#1E21A4', alignSelf:'stretch', flexShrink:0}}/>
                                        <button
                                            type="button"
                                            onClick={() => setIsControlQrOpen(true)}
                                            style={{background:'transparent', border:'1px solid #000', borderRadius:'0.45rem', padding:'0.35rem', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}
                                            aria-label="Afficher le QR code"
                                        >
                                            <img src={"/elements/icons/qr.png"} alt="" style={{width:'40px', height:'40px', objectFit:'contain', display:'block'}}/>
                                        </button>
                                    </div>
                                </div>

                                <div style={{backgroundColor:'white', borderRadius:'0.75rem', overflow:'hidden', border:'1px solid #949493'}}>
                                    <div style={{display:'flex', alignItems:'stretch', backgroundColor:CONTROL_TITLE_BG, minHeight:'35px'}}>
                                        <div style={{backgroundColor:'white', display:'flex', alignItems:'center', justifyContent:'center', padding:'0.35rem 0.7rem', margin:'0 0.55rem 0 0', borderRadius:'0 0 0.85rem 0', border:'1px solid #949493', borderTop:0,borderLeft:0}}>
                                            <span style={{fontWeight:700, fontSize:'1.15rem', color:CONTROL_GREEN, fontVariantNumeric:'tabular-nums', lineHeight:1}}>{timePassed || '00:00'}</span>
                                        </div>
                                        <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'flex-end', padding:'0 0.85rem'}}>
                                            <span style={{fontWeight:'bold', fontSize:'1.2rem', color:'#1a1a1a'}}>Informations de contrôle</span>
                                        </div>
                                    </div>
                                    <div style={{padding:'0.85rem', display:'flex', flexDirection:'column', alignItems:'center', gap:'0.45rem'}}>
                                        <div style={{display:'flex', alignItems:'center', gap:'0.45rem'}}>
                                            <img src={"/elements/icons/calendar-check.png"} alt="" style={{width:'18px', height:'18px', objectFit:'contain'}}/>
                                            <span style={{fontSize:'0.9rem', color:'#1a1a1a'}}>{formatDateTime(lastUsage.date)}</span>
                                        </div>
                                        <h1 style={{fontWeight:'bold', fontSize:'1.35rem', textTransform:'uppercase', letterSpacing:'0.02em', textAlign:'center', wordBreak:'break-all', lineHeight:1.2, margin:0}}>{B64_ID}</h1>
                                    </div>
                                </div>

                                <div id={"progress-container"} style={{width:'100%', backgroundColor:'#ffffff', borderRadius:'2rem', overflow:'hidden', height:'22px'}}>
                                    <div id={"progress-bar"} style={{width: `${Math.max(calculateProgressBarWidth(), 2)}%`, backgroundColor:CONTROL_GREEN, height:'100%', borderRadius:'2rem'}}></div>
                                </div>
                            </div>
                            { !isExpired && (
                                <ControlTouch/>
                            )}
                        </div>

                    </ControlModal>
                    <Modal isOpen={isControlQrOpen} onClose={() => setIsControlQrOpen(false)} hideBg={true} title={""} padding={0}>
                        <div style={{width:'100%', height:'100%', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden'}}>
                            <div style={{height:'58%', backgroundColor:'#2023AE', display:'flex', flexDirection:'column', alignItems:'center', padding:'0.75rem 1rem 1.1rem', boxSizing:'border-box'}}>
                                <div style={{alignSelf:'flex-start', zIndex:2, flexShrink:0}}>
                                    <div onClick={()=>{setIsControlQrOpen(false)}} style={{backgroundColor:"white", display:"flex",alignItems:"center",justifyContent:"center",width:"40px",height:"40px",borderRadius:"2rem"}}>
                                        <FaChevronLeft fill={"#333"} size={"18px"}/>
                                    </div>
                                </div>
                                <div style={{width:'100%', display:'flex', flexDirection:'column', alignItems:'center', marginTop:'0.75rem', minHeight:0}}>
                                    <div style={{backgroundColor:'white', borderRadius:'1rem', padding:'0.9rem', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(0,0,0,0.12)'}}>
                                        <QRCodeSVG value={B64_ID} size={320} level={"H"} style={{display:'block', width:'min(78vw, 320px)', height:'min(78vw, 320px)'}}/>
                                    </div>
                                    <h1 style={{fontWeight:700, fontSize:'1.15rem', color:'#fff', textTransform:'uppercase', margin:'0.65rem 0 0', textAlign:'center', letterSpacing:'0.02em', wordBreak:'break-all', lineHeight:1.2}}>
                                        {B64_ID}
                                    </h1>
                                </div>
                            </div>

                            <div style={{position:'absolute', left:'50%', top:'58%', transform:'translate(-50%, -50%)', zIndex:5, backgroundColor:'#fff', borderRadius:'0.5rem', padding:'0.55rem 1rem', display:'flex', alignItems:'center', gap:'0.55rem', boxShadow:'0 2px 10px rgba(0,0,0,0.12)', whiteSpace:'nowrap'}}>
                                <FaBus size={'1.15rem'} color={'#2023AE'}/>
                                <span style={{fontWeight:400, fontSize:'0.95rem', color:'#333'}}>Transport n° {transportNumber}</span>
                            </div>

                            <div style={{height:'42%', backgroundColor:'#F2F2F2', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem 1.5rem 1.5rem', boxSizing:'border-box'}}>
                                <p style={{margin:0, textAlign:'center', fontWeight:700, fontSize:'1.35rem', color:'#111', lineHeight:1.35}}>
                                    Expire le {formatDate(expireDate)}
                                    <br/>
                                    à {formatTime(expireDate)}
                                </p>
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
