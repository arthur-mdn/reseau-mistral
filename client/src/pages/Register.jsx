import React, { useState } from 'react';
import {Link} from 'react-router-dom';
import axios from 'axios';
import {useAuth} from "../AuthContext.jsx";
import { useNavigate } from 'react-router-dom';
import config from "../config.js";
function Register() {
    const { setAuthStatus } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [lastName, setLastName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [acceptConditions, setAcceptConditions] = useState(false);
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        axios.post(`${config.serverUrl}/auth/register` , { email,
            password,
            lastName,
            firstName,
            birthDate }, { withCredentials: true })
            .then(response => {
                setAuthStatus("authenticated");
                navigate('/');
            })
            .catch(error => {
                if (error.response) {
                    setErrorMessage(error.response.data.message || 'Erreur lors de l\'inscription');
                } else {
                    setErrorMessage('Erreur de connexion');
                }
            });

    };

    return (
        <form onSubmit={handleSubmit} className={"form"} id={"login_form"}>
            <h2>Inscription</h2>
            {errorMessage && <div style={{color:"red",fontWeight:"bold"}}>{errorMessage}</div>}
            <div className={"input_container"}>
                <label htmlFor="lastName">Nom</label>
                <input
                    type="text"
                    placeholder="Nom"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    minLength={3}
                    maxLength={32}
                    pattern="[a-zA-Z\s-]+"
                />
            </div>
            <div className={"input_container"}>
                <label htmlFor="firstName">Prénom</label>
                <input
                    type="text"
                    placeholder="Prénom"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    minLength={3}
                    maxLength={32}
                    pattern="[a-zA-Z\s-]+"
                />
            </div>
            <div className={"input_container"}>
                <label htmlFor="birthDate">Date de naissance</label>
                <input
                    type="date"
                    placeholder="Date de naissance"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                />
            </div>
            <div className={"input_container"}>
                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    maxLength={64}
                />
            </div>
            <div className={"input_container"}>
                <label htmlFor="password">Mot de passe</label>
                <input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    maxLength={32}
                />
            </div>
            <div className={"input_container"} style={{flexDirection:'row-reverse', justifyContent:'flex-end', alignItems:"center",gap:'10px'}}>
                <label htmlFor="acceptConditions" style={{margin:0}}>J'accepte les conditions d'utilisation</label>
                <input
                    id={"acceptConditions"}
                    type="checkbox"
                    checked={acceptConditions}
                    onChange={(e) => setAcceptConditions(e.target.checked)}
                    required
                    style={{colorScheme:'light'}}
                />
            </div>
            <button type="submit" className={"main_button"}>Inscription</button>
            <p>Vous avez déjà un compte ?</p>
            <Link to={'/login'} className={"sub_button force_button_style"}>Se connecter</Link>

        </form>
    );

}

export default Register;
