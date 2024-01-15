import React, { useState, useEffect } from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate, Link} from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import {useTopBar} from "../TopBarContext.jsx";
import {FaSearch} from "react-icons/fa";

function Horaires() {
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
        setTopBarState({ backLink:"", title: 'Horaires', isVisible: true, actions: [] });

        // Réinitialiser lors du démontage
        return () => setTopBarState({ title: '', isVisible: true });
    }, [setTopBarState]);

    return (
        <>
            <div className={"fr g1"} style={{backgroundColor:"#1E21A4",color:"lightgrey",textAlign:"center",padding:'0 0 0.5rem 0'}}>
                <div style={{width:'100%'}}>
                    Favoris
                </div>
                <div style={{width:'100%',color:"white", position:"relative"}}>
                    Lignes
                    <div style={{position:"absolute",width:'100%', height:'4px',backgroundColor:"white",bottom:'-0.5rem',left:0}}>

                    </div>
                </div>
                <div style={{width:'100%'}}>
                    Arrêts
                </div>
                <div style={{width:'100%'}}>
                    Gares
                </div>
            </div>
            <div className={"fr ai-c g0-5"} style={{ padding:"0.5rem",margin:'0.5rem 0.5rem 0.5rem 0.5rem', borderRadius:"0.5rem", border:"1px solid lightgrey", outline:"none", backgroundColor:"white", color:"grey"}}>
                <FaSearch/> Rechercher
            </div>
            <div className={"fc g0-5 jc-fs"} style={{padding:'0.5rem', backgroundColor:"#ebebeb", height:'100%'}}>

                {horairesData.map((item, index) => (
                    <div key={index} className={"fr ai-c g0-5"} style={{padding:'0.5rem', backgroundColor:"white", borderRadius:'0.5rem'}}>
                        <div style={{backgroundColor: item.BulleColor, color:"white", fontWeight:'bold', borderRadius:"4rem", padding:'0.3rem 0.8rem'}}>
                            {item.BulleId}
                        </div>
                        <div>
                            <h4>{item.Titre}</h4>
                            <p style={{color:"grey",fontSize:'0.8rem'}}>{item.Réseau}</p>
                        </div>
                    </div>
                ))}
            </div>
        </>

    );

}

export default Horaires;
