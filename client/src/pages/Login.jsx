import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api';

function Login() {
    const { setAuthStatus } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        setErrorMessage('');
        api.post('/auth/login', { email, password })
            .then(() => {
                setAuthStatus('authenticated');
            })
            .catch((error) => {
                setErrorMessage(error.response?.data?.message || 'Erreur de connexion');
            });
    };

    return (
        <form onSubmit={handleSubmit} className={"form"} id={"login_form"}>
            <h2>Connexion</h2>
            {errorMessage && <div style={{ color: 'red', fontWeight: 'bold' }}>{errorMessage}</div>}
            <div className={"input_container"}>
                <label htmlFor="email">Email</label>
                <input
                    id={"email"}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                />
            </div>
            <div className={"input_container"}>
                <label htmlFor="password">Mot de passe</label>
                <input
                    id={"password"}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="current-password"
                />
            </div>
            <button type="submit" className={"main_button"}>Connexion</button>
            <p>Vous n'avez pas de compte ?</p>
            <Link to={'/register'} className={"force_button_style sub_button"}>Créer un compte</Link>
        </form>
    );
}

export default Login;
