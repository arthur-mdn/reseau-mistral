import React, { useState, useEffect } from 'react';
import { useTopBar } from '../TopBarContext.jsx';
import {
    FaChevronRight,
    FaEnvelope,
    FaFile,
    FaHeart,
    FaLink,
    FaPaperPlane,
    FaPerson,
    FaSuitcase,
} from 'react-icons/fa6';
import Modal from '../components/Modal.jsx';
import ProfileSelection from '../components/ProfileSelection.jsx';
import { FaExternalLinkAlt, FaHome } from 'react-icons/fa';
import Loading from '../components/Loading.jsx';
import api from '../api';
import { isDemoBannerHidden, toggleDemoBannerHidden } from '../utils/demoBanner';

const menuIconStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
};

const menuRowStyle = {
    padding: '0.5rem 0.7rem',
    backgroundColor: 'white',
    color: 'black',
    width: '100%',
    borderBottom: '1px solid lightgrey',
};

function MenuIconImg({ src, alt }) {
    return (
        <div style={menuIconStyle}>
            <img src={src} alt={alt} style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
        </div>
    );
}

function Menu() {
    const { setTopBarState } = useTopBar();
    const [userDetails, setUserDetails] = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const [servicesOpen, setServicesOpen] = useState(false);
    const [trajetsOpen, setTrajetsOpen] = useState(false);
    const [favoriteOpen, setFavoriteOpen] = useState(false);
    const [isPlanOpen, setIsPlanOpen] = useState(false);
    const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
    const [isLiensOpen, setIsLiensOpen] = useState(false);
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [isPolitiqueOpen, setIsPolitiqueOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [bannerConfirmOpen, setBannerConfirmOpen] = useState(false);
    const [bannerHidden, setBannerHidden] = useState(() => isDemoBannerHidden());
    const [settingsClickCount, setSettingsClickCount] = useState(0);
    const [accountsOpen, setAccountsOpen] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [accountsLoading, setAccountsLoading] = useState(false);
    const [accountsError, setAccountsError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);

    const formatDateTime = (value) => {
        if (!value) return 'Jamais';
        try {
            return new Date(value).toLocaleString('fr-FR');
        } catch {
            return '-';
        }
    };

    const openAccounts = () => {
        setAccountsOpen(true);
        setAccountsLoading(true);
        setAccountsError(null);
        api.get('/user/accounts')
            .then((response) => {
                setAccounts(response.data || []);
            })
            .catch(() => {
                setAccountsError('Impossible de charger les comptes');
                setAccounts([]);
            })
            .finally(() => setAccountsLoading(false));
    };

    const handleSettingsPhraseClick = () => {
        const next = settingsClickCount + 1;
        if (next >= 11) {
            setSettingsClickCount(0);
            setBannerConfirmOpen(true);
            return;
        }
        setSettingsClickCount(next);
    };

    const confirmBannerToggle = () => {
        const nextHidden = toggleDemoBannerHidden();
        setBannerHidden(nextHidden);
        setBannerConfirmOpen(false);
    };

    useEffect(() => {
        const controller = new AbortController();
        api.get('/user/details', { signal: controller.signal })
            .then((response) => {
                setUserDetails(response.data);
                setIsLoading(false);
            })
            .catch((error) => {
                if (error.name === 'CanceledError') return;
                setLoadError('Impossible de charger le profil');
                setIsLoading(false);
            });
        return () => controller.abort();
    }, []);

    const deleteAllTickets = () => {
        api.delete('/tickets/').catch((error) => {
            console.error('Erreur lors de la suppression du ticket:', error);
        });
    };

    useEffect(() => {
        setTopBarState({ backLink: '', title: 'Menu', isVisible: false, actions: [] });
        return () => setTopBarState({ title: '', isVisible: true });
    }, [setTopBarState]);

    if (isLoading) return <Loading />;

    return (
        <>
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {loadError && <p style={{ color: 'red', textAlign: 'center', padding: '1rem' }}>{loadError}</p>}

                <div style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '1rem 0 1rem', justifyContent: 'center' }}>
                    <img src="/elements/favicon.png" alt="Réseau Mistral" style={{ width: '65px', borderRadius: '25px' }} />
                </div>

                <div style={{ padding: 0, margin: '0 1rem', borderRadius: '10px', backgroundColor: 'white', boxShadow: 'rgba(0, 0, 0, 0.56) 0px 22px 70px 4px', position: 'relative', zIndex: 1 }}>
                    <button onClick={() => setProfileOpen(true)} type={"button"} className="row-card setting_element" style={menuRowStyle}>
                        {userDetails && (
                            <>
                                <img
                                    src="/elements/menu/user.jpg"
                                    alt=""
                                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                                />
                                <div style={{ textAlign: 'left', minWidth: 0, flex: 1 }}>
                                    <div style={{ textTransform: 'capitalize', fontWeight: 600, lineHeight: 1.2 }}>
                                        {userDetails.firstName} {userDetails.lastName}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.75, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {userDetails.email}
                                    </div>
                                </div>
                            </>
                        )}
                        <FaChevronRight style={{ marginLeft: 'auto', flexShrink: 0 }} />
                    </button>

                    <button onClick={() => setServicesOpen(true)} type={"button"} className="row-card setting_element" style={menuRowStyle}>
                        <MenuIconImg src="/elements/menu/services.jpg" alt="" />
                        <span>Services</span>
                        <FaChevronRight style={{ marginLeft: 'auto' }} />
                    </button>

                    <button onClick={() => setTrajetsOpen(true)} type={"button"} className="row-card setting_element" style={menuRowStyle}>
                        <MenuIconImg src="/elements/menu/mes-trajets.jpg" alt="" />
                        <span>Mes Trajets</span>
                        <FaChevronRight style={{ marginLeft: 'auto' }} />
                    </button>

                    <button onClick={() => setFavoriteOpen(true)} type={"button"} className="row-card setting_element" style={menuRowStyle}>
                        <div style={menuIconStyle}>
                            <FaHeart size={'20px'} />
                        </div>
                        <span>Favoris</span>
                        <FaChevronRight style={{ marginLeft: 'auto' }} />
                    </button>

                    <button onClick={() => setIsPlanOpen(true)} type={"button"} className="row-card setting_element" style={menuRowStyle}>
                        <MenuIconImg src="/elements/menu/plans-reseaux.jpg" alt="" />
                        <span>Plan des réseaux</span>
                        <FaChevronRight style={{ marginLeft: 'auto' }} />
                    </button>

                    <button onClick={() => setIsDocumentsOpen(true)} type={"button"} className="row-card setting_element" style={menuRowStyle}>
                        <div style={menuIconStyle}>
                            <FaFile size={'20px'} />
                        </div>
                        <span>Mes justificatifs</span>
                        <FaChevronRight style={{ marginLeft: 'auto' }} />
                    </button>

                    <button onClick={() => setIsLiensOpen(true)} type={"button"} className="row-card setting_element" style={menuRowStyle}>
                        <div style={menuIconStyle}>
                            <FaLink size={'20px'} />
                        </div>
                        <span>Liens utiles</span>
                        <FaChevronRight style={{ marginLeft: 'auto' }} />
                    </button>

                    <button onClick={() => setIsContactOpen(true)} type={"button"} className="row-card setting_element" style={{ ...menuRowStyle, borderBottom: 0 }}>
                        <div style={menuIconStyle}>
                            <FaEnvelope size={'20px'} />
                        </div>
                        <span>Nous contacter</span>
                        <FaChevronRight size={'20px'} style={{ marginLeft: 'auto' }} />
                    </button>
                </div>

                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', zIndex: 1 }}>
                    <button onClick={() => setIsPolitiqueOpen(true)} type={"button"} className="row-card setting_element" style={{ padding: '0rem', backgroundColor: 'transparent', color: 'white', marginRight: 'auto', borderBottom: 0 }}>
                        Politique de confidentialité
                    </button>
                    <hr style={{ border: '1px solid white', margin: 0, opacity: 0.1 }} />
                    <button onClick={() => setIsSettingsOpen(true)} type={"button"} className="row-card setting_element" style={{ padding: '0rem', backgroundColor: 'transparent', color: 'white', marginRight: 'auto', borderBottom: 0 }}>
                        Paramètres
                    </button>
                </div>

                <div className="row-card" style={{ backgroundColor: 'transparent', position: 'absolute', bottom: '10px', right: 0, width: '220px', zIndex: 1 }}>
                    <img src="/elements/images/transports.jpg" style={{ width: '100%' }} alt={"transports"} />
                </div>
                <div style={{ backgroundColor: '#1E21A4', height: '75%', position: 'absolute', width: '100%', zIndex: 0, bottom: 0 }} />
            </div>

            {userDetails && (
                <Modal
                    isOpen={profileOpen}
                    onClose={() => setProfileOpen(false)}
                    title={"Mon profil"}
                    padding={"0"}
                    bgColor={"#F5F5F6"}
                    actions={[
                        { title: 'Se déconnecter', link: '/logout' },
                        { title: 'Supprimer mes données', action: () => deleteAllTickets() },
                    ]}
                >
                    <>
                        <div style={{ backgroundColor: '#1E21A4', color: 'white', paddingBottom: '1rem' }} className={"fc ai-c g0-5"}>
                            <img
                                src="/elements/menu/user.jpg"
                                alt=""
                                style={{ width: '80px', height: '80px', borderRadius: '4rem', objectFit: 'cover', border: '1px solid lightgrey', backgroundColor: '#fff' }}
                            />
                            <p style={{ textTransform: 'capitalize', margin: 0, fontWeight: 600 }}>
                                {userDetails.firstName} {userDetails.lastName}
                            </p>
                            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
                                {userDetails.email}
                            </p>
                            <div style={{ marginTop: '0.5rem' }} className={"fr ai-c jc-c g0-5"}>
                                <FaPerson /> Informations
                            </div>
                        </div>
                        <div className={"fc g1"} style={{ padding: '1rem' }}>
                            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem' }}>
                                <h4>Coordonnées</h4>
                                <div className={"fr g0-5 ai-c"}>
                                    <FaPaperPlane />
                                    <p style={{ color: 'gray' }}>{userDetails.email}</p>
                                </div>
                            </div>
                        </div>
                        <div className={"fc g1"} style={{ padding: '1rem' }}>
                            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem' }}>
                                <h4>Voyageur(s) M-tickets</h4>
                                <div className={"fc g0-5 ai-c"} style={{ marginTop: '0.5rem' }}>
                                    <ProfileSelection fromProfile={true} onProfileSelect={() => {}} onClose={() => {}} />
                                </div>
                            </div>
                        </div>
                    </>
                </Modal>
            )}

            <Modal isOpen={servicesOpen} onClose={() => setServicesOpen(false)} title={"Services"}>
                {userDetails?.userRole === 'superadmin' ? (
                    <div className={"fc g1"}>
                        <button
                            type="button"
                            onClick={openAccounts}
                            style={{ width: '100%', padding: '0.85rem 1rem' }}
                        >
                            Voir les comptes
                        </button>
                    </div>
                ) : (
                    <p>Services à venir.</p>
                )}
            </Modal>

            <Modal
                isOpen={accountsOpen}
                onClose={() => setAccountsOpen(false)}
                title={"Comptes"}
                contentOverflowY={"scroll"}
            >
                {accountsLoading && <p>Chargement…</p>}
                {accountsError && <p style={{ color: 'red' }}>{accountsError}</p>}
                {!accountsLoading && !accountsError && accounts.length === 0 && (
                    <p>Aucun compte.</p>
                )}
                <div className={"fc g1"}>
                    {accounts.map((account) => (
                        <div
                            key={account._id}
                            style={{
                                backgroundColor: 'white',
                                border: '1px solid lightgrey',
                                borderRadius: '0.5rem',
                                padding: '0.85rem 1rem',
                            }}
                        >
                            <p style={{ margin: 0, fontWeight: 600, textTransform: 'capitalize' }}>
                                {account.firstName} {account.lastName}
                            </p>
                            <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem' }}>{account.email}</p>
                            <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', opacity: 0.75 }}>
                                Créé le {formatDateTime(account.creation)}
                            </p>
                            <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', opacity: 0.75 }}>
                                Dernier login : {formatDateTime(account.lastLogin)}
                            </p>
                            {account.userRole === 'superadmin' && (
                                <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: '#1E21A4' }}>
                                    superadmin
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </Modal>

            <Modal isOpen={trajetsOpen} onClose={() => setTrajetsOpen(false)} title={"Mes Trajets"}>
                <p>Aucun trajet enregistré.</p>
            </Modal>

            <Modal isOpen={favoriteOpen} onClose={() => setFavoriteOpen(false)} title={"Favoris"} padding={"0"} bgColor={"#F5F5F6"}>
                <div style={{ backgroundColor: 'white', marginTop: '0.25rem', padding: '0.5rem', borderRadius: '0.5rem', color: 'black' }} className={"fc g1"}>
                    <div className={"fr jc-sb ai-c"}>
                        <div className={"fr ai-c g0-5 jc-c"}>
                            <div style={{ backgroundColor: 'grey', padding: '0.5rem', borderRadius: '4rem', display: 'flex', flexDirection: 'row' }}>
                                <FaHome fill={"white"} />
                            </div>
                            <h4>Maison</h4>
                        </div>
                        <div style={{ border: '1px solid lightgrey', padding: '0.1rem 0.6rem', fontSize: '0.8rem', fontWeight: 'bold', borderRadius: '0.25rem' }}>
                            Définir
                        </div>
                    </div>
                    <div className={"fr jc-sb ai-c"}>
                        <div className={"fr ai-c g0-5 jc-c"}>
                            <div style={{ backgroundColor: 'grey', padding: '0.5rem', borderRadius: '4rem', display: 'flex', flexDirection: 'row' }}>
                                <FaSuitcase fill={"white"} />
                            </div>
                            <h4>Travail</h4>
                        </div>
                        <div style={{ border: '1px solid lightgrey', padding: '0.1rem 0.6rem', fontSize: '0.8rem', fontWeight: 'bold', borderRadius: '0.25rem' }}>
                            Définir
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isPlanOpen} onClose={() => setIsPlanOpen(false)} title={"Plan des réseaux"}>
                <p>Contenu du plan des réseaux ici</p>
            </Modal>

            <Modal isOpen={isDocumentsOpen} onClose={() => setIsDocumentsOpen(false)} title={"Renseignez vos justificatifs"}>
                <div className={"fc g1 ai-c"} style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                    <h2 style={{ fontWeight: 'bold' }}>Aucune pièce justificative trouvée !</h2>
                    <p>Essayez d'envoyer une pièce justificative pour la retrouver ici.</p>
                    <button type={"button"} style={{ width: '100%', margin: 'auto 1rem 1rem 1rem' }}>Réessayer</button>
                </div>
            </Modal>

            <Modal isOpen={isLiensOpen} onClose={() => setIsLiensOpen(false)} title={"Liens utiles"}>
                <div>
                    <div style={{ borderBottom: '1px solid lightgrey', marginTop: '1rem' }}>
                        <h3>Site officiel du réseau Mistral</h3>
                        <p>J'organise mes déplacements sur la Métropole Toulon Provence Méditerranée</p>
                        <button type={"button"} style={{ color: '#1E21A4', padding: 0, backgroundColor: 'transparent', margin: '1rem 1rem 1rem auto' }}>
                            <FaExternalLinkAlt /> En savoir plus
                        </button>
                    </div>
                    <div style={{ borderBottom: '1px solid lightgrey', marginTop: '1rem' }}>
                        <h3>Accueil commerciaux</h3>
                        <button type={"button"} style={{ color: '#1E21A4', padding: 0, backgroundColor: 'transparent', margin: '1rem 1rem 1rem auto' }}>
                            <FaExternalLinkAlt /> En savoir plus
                        </button>
                    </div>
                    <div style={{ borderBottom: '1px solid lightgrey', marginTop: '1rem' }}>
                        <h3>Appel Bus (TAD)</h3>
                        <button type={"button"} style={{ color: '#1E21A4', padding: 0, backgroundColor: 'transparent', margin: '1rem 1rem 1rem auto' }}>
                            <FaExternalLinkAlt /> En savoir plus
                        </button>
                    </div>
                    <div style={{ borderBottom: '1px solid lightgrey', marginTop: '1rem' }}>
                        <h3>Règlement PV</h3>
                        <button type={"button"} style={{ color: '#1E21A4', padding: 0, backgroundColor: 'transparent', margin: '1rem 1rem 1rem auto' }}>
                            <FaExternalLinkAlt /> En savoir plus
                        </button>
                    </div>
                    <div style={{ borderBottom: '1px solid lightgrey', marginTop: '1rem' }}>
                        <h3>Service PMR</h3>
                        <button type={"button"} style={{ color: '#1E21A4', padding: 0, backgroundColor: 'transparent', margin: '1rem 1rem 1rem auto' }}>
                            <FaExternalLinkAlt /> En savoir plus
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} title={"Nous contacter"} />
            <Modal isOpen={isPolitiqueOpen} onClose={() => setIsPolitiqueOpen(false)} title={"Politique de confidentialité"} />
            <Modal
                isOpen={isSettingsOpen}
                onClose={() => {
                    setIsSettingsOpen(false);
                    setSettingsClickCount(0);
                }}
                title={"Paramètres"}
            >
                <p
                    onClick={handleSettingsPhraseClick}
                    style={{ cursor: 'default', userSelect: 'none' }}
                >
                    Cette application est une simulation. L'avertissement de démonstration reste toujours visible.
                </p>
            </Modal>

            <Modal
                isOpen={bannerConfirmOpen}
                onClose={() => setBannerConfirmOpen(false)}
                title={"Confirmation"}
                bgColor={"#FFF"}
            >
                <div className={"fc g1"} style={{ paddingTop: '1rem' }}>
                    <p style={{ fontWeight: 600, color: '#B00020' }}>
                        {bannerHidden
                            ? 'Êtes-vous sûr de vouloir réafficher le bandeau ?'
                            : 'Êtes-vous sûr de vouloir retirer le bandeau ?'}
                    </p>
                    <button
                        type="button"
                        onClick={confirmBannerToggle}
                        style={{
                            width: '100%',
                            backgroundColor: '#B00020',
                            color: 'white',
                            border: 0,
                            padding: '0.85rem 1rem',
                            borderRadius: '0.5rem',
                            fontWeight: 600,
                        }}
                    >
                        Confirmer
                    </button>
                    <button
                        type="button"
                        onClick={() => setBannerConfirmOpen(false)}
                        style={{
                            width: '100%',
                            backgroundColor: 'transparent',
                            color: '#333',
                            border: '1px solid lightgrey',
                            padding: '0.85rem 1rem',
                            borderRadius: '0.5rem',
                        }}
                    >
                        Annuler
                    </button>
                </div>
            </Modal>
        </>
    );
}

export default Menu;
