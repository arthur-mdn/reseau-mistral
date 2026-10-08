import React, { useState } from 'react';
import api from '../api';

function AddProfile({ onProfileAdded }) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = (event) => {
        event.preventDefault();
        setError(null);

        api.post('/user/profiles/new', { firstName, lastName, email })
            .then((response) => {
                onProfileAdded?.(response.data);
            })
            .catch((err) => {
                setError(err.response?.data?.message || 'Erreur lors de la création du profil');
            });
    };

    return (
        <form onSubmit={handleSubmit} className={"fc g1"}>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                <label htmlFor="add-profile-firstName">Prénom</label>
                <input
                    id="add-profile-firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={"Prénom"}
                    required
                    style={{ padding: '1.5rem', borderRadius: '0.5rem' }}
                />
            </div>
            <div>
                <label htmlFor="add-profile-lastName">Nom</label>
                <input
                    id="add-profile-lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={"Nom"}
                    required
                    style={{ padding: '1.5rem', borderRadius: '0.5rem' }}
                />
            </div>
            <div>
                <label htmlFor="add-profile-email">Email</label>
                <input
                    id="add-profile-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={"Email"}
                    required
                    style={{ padding: '1.5rem', borderRadius: '0.5rem' }}
                />
            </div>
            <br />
            <button type="submit" style={{ width: '100%' }}>Ajouter</button>
        </form>
    );
}

export default AddProfile;
