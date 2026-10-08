import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import AddProfile from './AddProfile.jsx';
import Modal from './Modal';
import { FaCheck, FaPlus } from 'react-icons/fa6';
import api from '../api';

function formatAccountNumber(id) {
    const source = String(id);
    let digits = source.replace(/\D/g, '');
    let i = 0;
    while (digits.length < 7) {
        digits += String(source.charCodeAt(i % source.length) % 10);
        i += 1;
    }
    return digits.slice(0, 7);
}

function ProfileSelection({ onProfileSelect, onClose, fromProfile = false }) {
    const [profiles, setProfiles] = useState([]);
    const [cookies, setCookie] = useCookies(['selectedProfile']);
    const selectedProfileId = cookies.selectedProfile;
    const [addProfileOpen, setAddProfileOpen] = useState(false);
    const [loadError, setLoadError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        api.get('/user/profiles', { signal: controller.signal })
            .then((response) => {
                setProfiles(response.data);
            })
            .catch((error) => {
                if (error.name !== 'CanceledError') {
                    setLoadError('Impossible de charger les profils');
                }
            });
        return () => controller.abort();
    }, []);

    const selectProfile = (profile) => {
        setCookie('selectedProfile', profile._id, {
            path: '/',
            maxAge: 365 * 24 * 60 * 60,
        });
        onProfileSelect?.(profile);
        onClose?.();
    };

    const addProfileCallback = (newProfileData) => {
        setAddProfileOpen(false);
        setProfiles((currentProfiles) => [...currentProfiles, newProfileData]);
        setCookie('selectedProfile', newProfileData._id, {
            path: '/',
            maxAge: 365 * 24 * 60 * 60,
        });
        onProfileSelect?.(newProfileData);
    };

    return (
        <div className={"profile-selection"}>
            {loadError && <p style={{ color: 'red' }}>{loadError}</p>}
            <div className={"profile-selection__list fc g0-5"}>
                {profiles.map((profile) => {
                    const isSelected = profile._id === selectedProfileId;
                    return (
                        <button
                            key={profile._id}
                            type="button"
                            onClick={() => selectProfile(profile)}
                            className={"profile"}
                            aria-pressed={isSelected}
                        >
                            <span
                                className={`profile-check${isSelected ? ' profile-check--selected' : ''}`}
                                aria-hidden="true"
                            >
                                {isSelected && <FaCheck size={11} />}
                            </span>
                            <div className={"profile-info fc"}>
                                <h4 className={"profile-name"}>
                                    {profile.prenom}
                                </h4>
                                <p className={"profile-email"}>
                                    {profile.email || '—'}
                                </p>
                                <p className={"profile-id"}>
                                    N°{formatAccountNumber(profile._id)}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>
            <div className={"profile-selection__footer"}>
                {!fromProfile && (
                    <p className={"profile-selection__hint"}>
                        Associez votre profil voyageur pour profiter de tarifs personnalisés, ou le profil de vos proches pour créditer leur compte.
                    </p>
                )}
                {fromProfile ? (
                    <button
                        type={"button"}
                        style={{ backgroundColor: 'transparent', color: '#1E21A4', marginRight: 'auto', padding: 0 }}
                        onClick={() => setAddProfileOpen(true)}
                    >
                        <FaPlus /> Ajouter un voyageur
                    </button>
                ) : (
                    <button
                        type={"button"}
                        style={{ width: '100%' }}
                        onClick={() => setAddProfileOpen(true)}
                    >
                        Ajouter un voyageur
                    </button>
                )}
            </div>

            <Modal isOpen={addProfileOpen} onClose={() => setAddProfileOpen(false)} title={"Ajouter un profil"}>
                <AddProfile onProfileAdded={addProfileCallback} />
            </Modal>
        </div>
    );
}

export default ProfileSelection;
