import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {useTopBar} from "../TopBarContext.jsx";
import {
    FaCaretRight,
    FaChevronRight,
    FaEnvelope,
    FaFile,
    FaHeart,
    FaLink, FaPaperPlane,
    FaPerson,
    FaSolarPanel, FaSuitcase
} from "react-icons/fa6";
import Modal from "../components/Modal.jsx";
import Boutique from "../components/Boutique.jsx";
import ProfileSelection from "../components/ProfileSelection.jsx";
import {FaExternalLinkAlt, FaHome} from "react-icons/fa";
import config from "../config.js";

function Menu() {
    const { setTopBarState } = useTopBar();
    const [userDetails, setUserDetails] = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const [favoriteOpen, setFavoriteOpen] = useState(false);
    const [isPlanOpen, setIsPlanOpen] = useState(false);
    const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
    const [isLiensOpen, setIsLiensOpen] = useState(false);
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [isPolitiqueOpen, setIsPolitiqueOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        axios.get(`${config.serverUrl}/user/details`, { withCredentials: true })
            .then(response => {
                setUserDetails(response.data);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des détails:', error);
            });
    }, []);

    useEffect(() => {
        setTopBarState({ backLink:"", title: 'Menu', isVisible: false, actions: [] });
        return () => setTopBarState({ title: '', isVisible: true });
    }, [setTopBarState]);

    return (
        <>
            <div style={{position:"relative", width:"100%", height:"100%"}}>

                <div style={{ width: "100%", display: "flex", alignItems: "center",padding:"2rem 0",justifyContent: "center"}}>
                    <img src="/elements/favicon.png" style={{width: "50px", borderRadius: "25px"}}/>
                </div>
                <div style={{padding: 0,margin:"0 1rem", borderRadius: "10px", backgroundColor: "white", boxShadow: "rgba(0, 0, 0, 0.56) 0px 22px 70px 4px", position:"relative", zIndex:1}}>
                    <button onClick={()=>{setProfileOpen(true)}} type={"button"}  className="row-card setting_element" style={{padding:'0.7rem', backgroundColor:"white",color:"black",width:'100%',borderBottom:'1px solid lightgrey'}}>
                            {
                                userDetails && (
                                    <>
                                        <div style={{backgroundColor: "#bbffff", width: "40px", height: "40px", border: "1px solid lightgrey", borderRadius: "50px", display: "flex", alignContent: "center", justifyContent: "center", alignItems: "center"}}>
                                            <span style={{fontFamily: "Arial Narrow, serif", fontSize: "25px", opacity: "0.9", textTransform:"uppercase"}}>
                                                {userDetails.firstName.substring(0, 1)}{userDetails.lastName.substring(0, 1)}
                                            </span>
                                        </div>
                                         <span style={{textTransform:'capitalize'}}>{userDetails.firstName} {userDetails.lastName}</span>
                                    </>

                                )
                            }
                        <FaChevronRight style={{marginLeft:"auto"}}/>
                    </button>
                    <button onClick={()=>{setFavoriteOpen(true)}} type={"button"}  className="row-card setting_element" style={{padding:'0.7rem', backgroundColor:"white",color:"black",width:'100%',borderBottom:'1px solid lightgrey'}}>
                        <div
                            style={{width: "40px", height: "40px", borderRadius: "50px", display: "flex", alignContent: "center", justifyContent: "center", alignItems: "center"}}
                        >
                            <FaHeart/>
                        </div>
                        <span>Favoris</span>
                        <FaChevronRight style={{marginLeft:"auto"}}/>
                    </button>
                    <button  onClick={()=>{setIsPlanOpen(true)}} type={"button"}  className="row-card setting_element" style={{padding:'0.7rem', backgroundColor:"white",color:"black",width:'100%',borderBottom:'1px solid lightgrey'}} >
                        <div style={{width: "40px", height: "40px", borderRadius: "50px", display: "flex", alignContent: "center", justifyContent: "center", alignItems: "center"}}>
                            <FaSolarPanel/>
                        </div>
                        <span>Plans des réseaux</span>
                        <FaChevronRight style={{marginLeft:"auto"}}/>
                    </button>
                    <button onClick={()=>{setIsDocumentsOpen(true)}} type={"button"}  className="row-card setting_element" style={{padding:'0.7rem', backgroundColor:"white",color:"black",width:'100%',borderBottom:'1px solid lightgrey'}} >
                        <div style={{width: "40px", height: "40px", borderRadius: "50px", display: "flex", alignContent: "center", justifyContent: "center", alignItems: "center"}}>
                            <FaFile/>
                        </div>
                        <span>Mes documents</span>
                        <FaChevronRight style={{marginLeft:"auto"}}/>
                    </button>
                    <button  onClick={()=>{setIsLiensOpen(true)}} type={"button"}  className="row-card setting_element" style={{padding:'0.7rem', backgroundColor:"white",color:"black",width:'100%',borderBottom:'1px solid lightgrey'}} >
                        <div style={{width: "40px", height: "40px", borderRadius: "50px", display: "flex", alignContent: "center", justifyContent: "center", alignItems: "center"}}>
                            <FaLink/>
                        </div>
                        <span>Liens utiles : Achat, Appel Bus, PV</span>
                        <FaChevronRight style={{marginLeft:"auto"}}/>
                    </button>
                    <button  onClick={()=>{setIsContactOpen(true)}} type={"button"}  className="row-card setting_element" style={{padding:'0.7rem', backgroundColor:"white",color:"black",width:'100%',borderBottom:0}} >
                        <div style={{width: "40px", height: "40px", borderRadius: "50px", display: "flex", alignContent: "center", justifyContent: "center", alignItems: "center"}}>
                            <FaEnvelope/>
                        </div>
                        <span>Nous contacter</span>
                        <FaChevronRight style={{marginLeft:"auto"}}/>
                    </button>
                </div>


                <div
                    style={{padding: "2rem", display:"flex", flexDirection:"column", gap:"2rem", position:"relative", zIndex:1}}>

                    <button  onClick={()=>{setIsPolitiqueOpen(true)}} type={"button"}  className="row-card setting_element" style={{padding:'0rem',backgroundColor:"transparent",color:"white",marginRight:"auto",borderBottom:0}} >
                        Politique de confidentialité
                    </button>

                    <button  onClick={()=>{setIsSettingsOpen(true)}} type={"button"}  className="row-card setting_element" style={{padding:'0rem',backgroundColor:"transparent",color:"white",marginRight:"auto",borderBottom:0}} >
                        Paramètres
                    </button>
                </div>

                <div className="row-card"
                     style={{backgroundColor: "transparent", position: "absolute", bottom: "10px", right: 0, width: "220px", zIndex:1}}>
                    <img src="/elements/images/transports.jpg" style={{width: "100%"}} alt={"transports"}/>
                </div>
                <div style={{backgroundColor:"#1E21A4", height:'75%',position:"absolute", width:'100%', zIndex:0,bottom:0}}>

                </div>
            </div>
            {
                userDetails && (
                    <Modal isOpen={profileOpen} onClose={() => setProfileOpen(false)} title={"Mon profil"} padding={"0"} bgColor={"#F5F5F6"} actions={[{title:"Se déconnecter", link:"/logout"}]}>
                        <>
                            <div style={{backgroundColor:"#1E21A4", color:"white"}} className={"fc ai-c g0-5"}>
                                <div style={{backgroundColor:"#bbffff",width:"80px",height:"80px",border:"1px solid lightgrey",borderRadius:"4rem",textTransform:"uppercase",color:"black",display:"flex",alignItems:"center",justifyContent:"center"}}>
                            <span style={{fontSize:'2.5rem',textAlign:"center"}}>
                                {userDetails.firstName.substring(0, 1)}{userDetails.lastName.substring(0, 1)}
                            </span>
                                </div>
                                <p style={{textTransform:'capitalize'}}>
                                    {userDetails.firstName} {userDetails.lastName}
                                </p>
                                <br/>
                                <div style={{marginBottom:'5px'}} className={"fr ai-c jc-c g0-5"}>
                                    <FaPerson/> Informations
                                </div>
                            </div>
                            <div className={"fc g1"} style={{padding:'1rem'}}>

                                <div style={{backgroundColor:"white",padding:'1rem', borderRadius:'0.5rem'}}>
                                    <h4>
                                        Coordonnées
                                    </h4>
                                    <div className={"fr g0-5 ai-c"}>
                                        <FaPaperPlane/>
                                        <p style={{color:"gray"}}>
                                            {userDetails.email}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className={"fc g1"} style={{padding:'1rem'}}>

                                <div style={{backgroundColor:"white",padding:'1rem', borderRadius:'0.5rem'}}>
                                    <h4>
                                        Voyageurs M-tickets
                                    </h4>
                                    <div className={"fc g0-5 ai-c"} style={{marginTop:'0.5rem'}}>
                                        <ProfileSelection fromProfile={true} onProfileSelect={()=>{}} onClose={()=>{}}/>
                                    </div>
                                </div>
                            </div>
                        </>
                    </Modal>
                )
            }

            <Modal isOpen={favoriteOpen} onClose={() => setFavoriteOpen(false)} title={"Favoris"} padding={"0"} bgColor={"#F5F5F6"} >
                <>
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
                </>
            </Modal>

            <Modal isOpen={isPlanOpen} onClose={() => setIsPlanOpen(false)} title={"Plans des réseaux"}>
                {/* Contenu du modal Plan */}
                <p>Contenu du modal Plan ici</p>
            </Modal>

            <Modal isOpen={isDocumentsOpen} onClose={() => setIsDocumentsOpen(false)} title={"Renseignez vos justificatifs"}>
                <div className={"fc g1 ai-c"} style={{padding:'4rem 1rem',textAlign:"center"}}>
                    <h2 style={{fontWeight:"bold"}}>Aucune pièce justificative trouvée !</h2>
                    <p>Essayez d'envoyer une pièce justificative pour la retrouver ici.</p>
                    <button type={"button"} style={{width:'100%',margin:"auto 1rem 1rem 1rem"}} > Réessayer</button>
                </div>
            </Modal>

            <Modal isOpen={isLiensOpen} onClose={() => setIsLiensOpen(false)} title={"Liens utiles : Achat, Appel Bus, PV..."}>
                <div>
                    <div style={{borderBottom:'1px solid lightgrey',marginTop:'1rem'}}>
                        <h3>Site officiel du réseau Mistral</h3>
                        <p>J'organise mes déplacements sur la Métropole Toulon Provence Méditéranée</p>
                        <button type={"button"} style={{color:"#1E21A4",padding:0,backgroundColor:"transparent",margin:"1rem 1rem 1rem auto"}} > <FaExternalLinkAlt/> En savoir plus</button>
                    </div>
                    <div style={{borderBottom:'1px solid lightgrey',marginTop:'1rem'}}>
                        <h3>Accueil commerciaux</h3>
                        <p></p>
                        <button type={"button"} style={{color:"#1E21A4",padding:0,backgroundColor:"transparent",margin:"1rem 1rem 1rem auto"}} > <FaExternalLinkAlt/> En savoir plus</button>
                    </div>
                    <div style={{borderBottom:'1px solid lightgrey',marginTop:'1rem'}}>
                        <h3>Appel Bus (TAD)</h3>
                        <p></p>
                        <button type={"button"} style={{color:"#1E21A4",padding:0,backgroundColor:"transparent",margin:"1rem 1rem 1rem auto"}} > <FaExternalLinkAlt/> En savoir plus</button>
                    </div>
                    <div style={{borderBottom:'1px solid lightgrey',marginTop:'1rem'}}>
                        <h3>Règlement PV</h3>
                        <p></p>
                        <button type={"button"} style={{color:"#1E21A4",padding:0,backgroundColor:"transparent",margin:"1rem 1rem 1rem auto"}} > <FaExternalLinkAlt/> En savoir plus</button>
                    </div>
                    <div style={{borderBottom:'1px solid lightgrey',marginTop:'1rem'}}>
                        <h3>Service PMR</h3>
                        <p></p>
                        <button type={"button"} style={{color:"#1E21A4",padding:0,backgroundColor:"transparent",margin:"1rem 1rem 1rem auto"}} > <FaExternalLinkAlt/> En savoir plus</button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} title={"Nous contacter"}>
            </Modal>

            <Modal isOpen={isPolitiqueOpen} onClose={() => setIsPolitiqueOpen(false)} title={"Politique de confidentialité"}>
            </Modal>

            <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title={"Paramètres"}>
            </Modal>



        </>
    );

}

export default Menu;
