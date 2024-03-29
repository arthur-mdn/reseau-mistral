import React, { useState } from 'react';
import axios from 'axios';
import config from "../config.js";

function AddProfile({ onProfileAdded }) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();

        axios.post(`${config.serverUrl}/user/profiles/new`, {
            firstName, lastName, email
        }, { withCredentials: true })
            .then(response => {
                onProfileAdded(response.data)
            })
            .catch(error => {
                console.error('Erreur lors de la création du profil:', error);
            });
    };

    return (
        <form onSubmit={handleSubmit} className={"fc g1"}>
            <div>
                <label>Prénom</label>
                <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={"Prénom"}
                    style={{padding:'1.5rem', borderRadius:'0.5rem'}}
                />
            </div>
            <div>
                <label>Nom</label>
                <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={"Nom"}
                    style={{padding:'1.5rem', borderRadius:'0.5rem'}}
                />
            </div>
            <div>
                <label>Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={"Email"}
                    style={{padding:'1.5rem', borderRadius:'0.5rem'}}
                />
            </div>
            <br/>
            <button type="submit" style={{width:'100%'}}>Ajouter</button>
        </form>
    );
}

export default AddProfile;
