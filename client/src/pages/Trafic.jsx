import React, { useState, useEffect } from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate, Link} from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import {useTopBar} from "../TopBarContext.jsx";
import {FaExclamation} from "react-icons/fa6";

function Trafic() {
    const { setTopBarState } = useTopBar();
    const horairesData = [
        { BulleId: 'U', BulleColor: 'orange', Titre: 'Tech.Mer/Pôle d\'Act. Tln Est', Réseau: 'Réseau Mistral' },
        { BulleId: '1', BulleColor: '#0000b7', Titre: 'Coupiane - Beaucaire', Réseau: 'Réseau Mistral' },
        { BulleId: '3', BulleColor: '#e90000', Titre: '4 Ch. des Routes - Mourillon', Réseau: 'Réseau Mistral' },
        { BulleId: '6', BulleColor: '#009ee9', Titre: 'Ripelle - Terre Promise', Réseau: 'Réseau Mistral' },
        { BulleId: '8', BulleColor: '#28677f', Titre: 'La Seyne - Blache', Réseau: 'Réseau Mistral' },
        { BulleId: '9', BulleColor: '#66c34f', Titre: 'Hôpital - Gare Toulon', Réseau: 'Réseau Mistral' },
        { BulleId: '10', BulleColor: '#063951', Titre: 'Lyautey - Darboussèdes', Réseau: 'Réseau Mistral' },
        { BulleId: '11', BulleColor: '#7c35b1', Titre: 'Blache - Montserrat', Réseau: 'Réseau Mistral' },
        { BulleId: '11B', BulleColor: '#7c35b1', Titre: 'La Baume - Blache', Réseau: 'Réseau Mistral' },
        { BulleId: '12', BulleColor: '#e90000', Titre: 'Portes Oll. - La Seyne', Réseau: 'Réseau Mistral' },
    ];
    useEffect(() => {
        setTopBarState({ backLink:"", title: 'Info trafic', isVisible: true, actions: [] });

        // Réinitialiser lors du démontage
        return () => setTopBarState({ title: '', isVisible: true });
    }, [setTopBarState]);

    return (
        <div className={"fc g0-5 jc-fs"} style={{padding:'0.5rem', backgroundColor:"#ebebeb", height:'100%'}}>
            <div className={"fr ai-c jc-c"} style={{padding:'0.2rem',backgroundColor:"lightgrey",borderRadius:'7px'}}>
                <div style={{backgroundColor:"white",borderRadius:'5px', width:'100%', textAlign:"center", fontSize:'1rem', padding:'0.2rem 0'}}>
                    En cours
                </div>
                <div style={{borderRadius:'5px', width:'100%',backgroundColor:"lightgrey", textAlign:"center", fontSize:'1rem', padding:'0.2rem 0'}}>
                    À venir
                </div>
            </div>
            <h4 style={{padding:'0.5rem 0.5rem 0.5rem 0.8rem'}}>Toutes les lignes concernées</h4>
            <div style={{display:"flex",flexWrap:"wrap", justifyContent:"space-evenly", gap:'1rem', backgroundColor:"white",padding:'0.5rem', borderRadius:'0.5rem'}}>
                {horairesData.map((item, index) => (
                    <div key={item.BulleId} style={{position:"relative",backgroundColor: item.BulleColor, color:"white", fontWeight:'bold',fontSize:'1.3rem', borderRadius:"4rem", padding:'0.3rem 0.9rem'}}>
                        {item.BulleId}
                        <div style={{position:"absolute", bottom:"-4px", right:"-4px", backgroundColor:'#f5752a', width:'20px', height:'20px', borderRadius:'4rem'}} className={"fr ai-c jc-c"}>
                            <FaExclamation size={'15px'}/>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

}

export default Trafic;
