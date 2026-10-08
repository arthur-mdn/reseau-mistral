import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import api from '../api';

function Register() {
    const { setAuthStatus } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [lastName, setLastName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [acceptConditions, setAcceptConditions] = useState(false);
    const [titleClickCount, setTitleClickCount] = useState(0);
    const [showSuperadminCode, setShowSuperadminCode] = useState(false);
    const [superadminAccessCode, setSuperadminAccessCode] = useState('');
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');

    const handleTitleClick = () => {
        const next = titleClickCount + 1;
        if (next >= 11) {
            setShowSuperadminCode(true);
            setTitleClickCount(0);
            return;
        }
        setTitleClickCount(next);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const payload = {
            email,
            password,
            lastName,
            firstName,
            birthDate,
        };
        if (showSuperadminCode && superadminAccessCode) {
            payload.superadminAccessCode = superadminAccessCode;
        }
        api.post('/auth/register', payload)
            .then(() => {
                setAuthStatus('authenticated');
                navigate('/');
            })
            .catch((error) => {
                setErrorMessage(error.response?.data?.message || 'Erreur lors de l\'inscription');
            });
    };

    return (
        <form onSubmit={handleSubmit} className={"form"} id={"login_form"}>
            <h2
                onClick={handleTitleClick}
                style={{ cursor: 'default', userSelect: 'none' }}
            >
                Inscription
            </h2>
            {errorMessage && <div style={{ color: 'red', fontWeight: 'bold' }}>{errorMessage}</div>}
            <div className={"input_container"}>
                <label htmlFor="lastName">Nom</label>
                <input
                    id="lastName"
                    type="text"
                    placeholder="Nom"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    minLength={2}
                    maxLength={100}
                />
            </div>
            <div className={"input_container"}>
                <label htmlFor="firstName">Prénom</label>
                <input
                    id="firstName"
                    type="text"
                    placeholder="Prénom"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    minLength={2}
                    maxLength={100}
                />
            </div>
            <div className={"input_container"}>
                <label htmlFor="birthDate">Date de naissance</label>
                <input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                />
            </div>
            <div className={"input_container"}>
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    maxLength={254}
                    autoComplete="email"
                />
            </div>
            <div className={"input_container"}>
                <label htmlFor="password">Mot de passe</label>
                <input
                    id="password"
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    maxLength={128}
                    autoComplete="new-password"
                />
            </div>
            {showSuperadminCode && (
                <div className={"input_container"}>
                    <label htmlFor="superadminAccessCode">Superadmin access code</label>
                    <input
                        id="superadminAccessCode"
                        type="password"
                        placeholder="Superadmin access code"
                        value={superadminAccessCode}
                        onChange={(e) => setSuperadminAccessCode(e.target.value)}
                        autoComplete="off"
                    />
                </div>
            )}
            <div className={"input_container"} style={{ flexDirection: 'row-reverse', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
                <label htmlFor="acceptConditions" style={{ margin: 0 }}>J'accepte les conditions d'utilisation</label>
                <input
                    id={"acceptConditions"}
                    type="checkbox"
                    checked={acceptConditions}
                    onChange={(e) => setAcceptConditions(e.target.checked)}
                    required
                    style={{ colorScheme: 'light' }}
                />
            </div>
            <button type="submit" className={"main_button"}>Inscription</button>
            <p>Vous avez déjà un compte ?</p>
            <Link to={'/login'} className={"sub_button force_button_style"}>Se connecter</Link>
        </form>
    );
}

export default Register;
