import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import AddProfile from "./AddProfile.jsx";
import Modal from './Modal'
import {FaPlus} from "react-icons/fa6";
import config from "../config.js";
function ProfileSelection({ onProfileSelect, onClose, fromProfile= false }) {
    const [profiles, setProfiles] = useState([]);
    const [cookies, setCookie] = useCookies(['selectedProfile']);
    const selectedProfileId = cookies.selectedProfile;

    const [addProfileOpen, setAddProfileOpen] = useState(false)
    const [profileSelectionOpen, setProfileSelectionOpen] = useState(false);

    useEffect(() => {
        axios.get(`${config.serverUrl}/user/profiles`, { withCredentials: true })
            .then(response => {
                setProfiles(response.data);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des profils:', error);
            });
    }, []);

    const handleProfileSelect = (profile) => {
        setCookie('selectedProfile', profile._id, { path: '/', domain: config.cookieDomain, maxAge: 365 * 24 * 60 * 60 * 1000  });
        onProfileSelect(profile);
        onClose();
    };
    const handleChange = (profile) => {
        handleProfileSelect(profile);
    };

    const addProfileCallback = (newProfileData) => {
        setAddProfileOpen(false);
        setProfiles(currentProfiles => [...currentProfiles, newProfileData]);
        setCookie('selectedProfile', newProfileData._id, { path: '/', maxAge: 365 * 24 * 60 * 60 * 1000  });
    };

    return (
        <>
            <div className={"fc g0-5"} style={{width:'100%'}}>
                {profiles.map(profile => (
                    <button key={profile._id} onClick={() => handleProfileSelect(profile)} className={"profile"} style={{width:'100%', backgroundColor: fromProfile ? "#f3f3f3" : "white"}}>
                        <input
                            type={"radio"}
                            name={"radio-profile"}
                            className={"radio-profile"}
                            id={`radio-profile-${profile._id}`}
                            checked={profile._id === selectedProfileId}
                            onChange={() => handleChange(profile)}
                        />
                        <label htmlFor={`radio-profile-${profile._id}`}>
                        </label>
                        <div style={{textAlign:"left", gap:'0.2rem'}} className={"fc"} >
                            <h4 style={{fontWeight:"bold", fontSize:'0.9rem'}}>
                                {profile.prenom} {profile.nom}
                            </h4>
                            <p style={{fontSize:'0.8rem', opacity:0.8}}>
                                N°{profile._id}
                            </p>

                        </div>
                    </button>
                ))}
            </div>
            <br/>
            {
                fromProfile &&
                <button type={"button"} style={{ backgroundColor: "transparent", color:"#1E21A4",marginRight:"auto", padding:0,marginBottom:'1rem'}} onClick={() => {setAddProfileOpen(true)}}>
                    <FaPlus/>Ajouter un voyageur
                </button>

            }
            {
                !fromProfile &&
                <button type={"button"} style={{width:"100%", marginTop:"auto",marginBottom:'1rem'}} onClick={() => {setAddProfileOpen(true)}}>
                    Ajouter un voyageur
                </button>
            }


            <Modal isOpen={addProfileOpen} onClose={() => setAddProfileOpen(false)} title={"Ajouter un profil"} >
                <AddProfile onClose={() => setAddProfileOpen(false)} />
            </Modal>
        </>
    );
}

export default ProfileSelection;
