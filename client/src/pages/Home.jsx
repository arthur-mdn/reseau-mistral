import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTopBar } from '../TopBarContext.jsx';
import { FaHome, FaSearch } from 'react-icons/fa';
import { FaLocationArrow, FaSuitcase } from 'react-icons/fa6';
import { useCookies } from 'react-cookie';
import Modal from '../components/Modal.jsx';
import Loading from '../components/Loading.jsx';
import api from '../api';
import { isTicketActive } from '../utils/duration.js';
import { requestCameraPermission } from '../utils/cameraPermission';

function Home() {
    const { setTopBarState } = useTopBar();
    const [cookies, , removeCookie] = useCookies(['selectedProfile']);
    const [ticketsEnCours, setTicketsEnCours] = useState([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [logoClickCount, setLogoClickCount] = useState(0);
    const logoClickTimerRef = useRef(null);
    const cameraWarmupBusyRef = useRef(false);

    const handleLogoClick = () => {
        if (logoClickTimerRef.current) {
            clearTimeout(logoClickTimerRef.current);
        }

        const next = logoClickCount + 1;
        if (next >= 3) {
            setLogoClickCount(0);
            if (cameraWarmupBusyRef.current) return;
            cameraWarmupBusyRef.current = true;
            requestCameraPermission()
                .catch(() => {})
                .finally(() => {
                    cameraWarmupBusyRef.current = false;
                });
            return;
        }

        setLogoClickCount(next);
        logoClickTimerRef.current = setTimeout(() => {
            setLogoClickCount(0);
            logoClickTimerRef.current = null;
        }, 1500);
    };

    useEffect(() => () => {
        if (logoClickTimerRef.current) {
            clearTimeout(logoClickTimerRef.current);
        }
    }, []);

    useEffect(() => {
        if (!cookies.selectedProfile) {
            setIsLoading(false);
            setTicketsEnCours([]);
            return undefined;
        }

        const controller = new AbortController();
        setIsLoading(true);
        setLoadError(null);

        api.get(`/user/profiles/${cookies.selectedProfile}`, { signal: controller.signal })
            .then((response) => {
                const actifs = (response.data.tickets || []).filter((ticket) => isTicketActive(ticket));
                setTicketsEnCours(actifs);
                setIsLoading(false);
            })
            .catch((error) => {
                if (error.name === 'CanceledError') return;
                if (error.response?.status === 404) {
                    removeCookie('selectedProfile', { path: '/' });
                } else {
                    setLoadError('Impossible de charger les titres en cours');
                }
                setIsLoading(false);
            });

        return () => controller.abort();
    }, [cookies.selectedProfile, removeCookie]);

    useEffect(() => {
        setTopBarState({ isVisible: false });
        return () => setTopBarState({ title: '', isVisible: true });
    }, [setTopBarState]);

    if (isLoading) return <Loading />;

    return (
        <div className="page-lock-scroll">
            <img
                src={"/elements/images/plan.jpg"}
                alt={"plan du réseau"}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}
            />
            <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', color: 'white', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 2, backgroundColor: '#1e22aa', marginTop: 'auto', padding: '0.5rem 1rem 2rem 1rem', borderRadius: '0.5rem 0.5rem 0 0' }}>
                    <div style={{ backgroundColor: 'lightgrey', width: '30px', height: '4px', margin: 'auto', borderRadius: '1rem', marginBottom: '1rem' }} />
                    {loadError && (
                        <p style={{ color: '#ffb4b4', marginBottom: '1rem' }}>{loadError}</p>
                    )}
                    <button
                        type={"button"}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: 'none', outline: 'none', marginBottom: '1rem', backgroundColor: '#001269', color: 'white', justifyContent: 'flex-start' }}
                        onClick={() => setIsSearchOpen(true)}
                    >
                        <FaSearch /> Rechercher un itinéraire
                    </button>
                    {ticketsEnCours.length > 0 && (
                        <div>
                            <div className={"fr jc-sb ai-c"}>
                                <h4 style={{ fontWeight: 'bold' }}>Titre(s) en cours</h4>
                                <img
                                    src={"/elements/images/reseau_mistral.jpg"}
                                    alt={"logo"}
                                    onClick={handleLogoClick}
                                    style={{ width: '170px', cursor: 'default', userSelect: 'none' }}
                                />
                            </div>
                            <div>
                                {ticketsEnCours.map((ticket) => (
                                    <Link
                                        key={ticket._id}
                                        to={`/tickets/${ticket._id}`}
                                        style={{ backgroundColor: 'white', marginTop: '0.25rem', padding: '0.5rem', borderRadius: '0.5rem', color: 'black' }}
                                        className={"fr ai-c g0-5"}
                                    >
                                        <div style={{ backgroundColor: '#1E21A4', padding: '0.5rem', borderRadius: '4rem', display: 'flex', flexDirection: 'row', position: 'relative' }}>
                                            <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'red', borderRadius: '4rem', width: '10px', height: '10px' }} />
                                            <img
                                                src={"/elements/icons/ticket.svg"}
                                                style={{ width: '15px', filter: 'invert(100%) sepia(100%) saturate(0%) hue-rotate(288deg) brightness(102%) contrast(102%)' }}
                                                alt=""
                                            />
                                        </div>
                                        <div className={"fr g0-5"}>
                                            <h4 style={{ fontWeight: 'bold' }}>1 titre</h4>
                                            <h4>{ticket.priceId?.title || 'Titre'}</h4>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={"fr jc-sb ai-c"} style={{ marginTop: '2rem' }}>
                        <h4 style={{ fontWeight: 'bold' }}>On y va ?</h4>
                        {ticketsEnCours.length <= 0 && (
                            <img
                                src={"/elements/images/reseau_mistral.jpg"}
                                alt={"logo"}
                                onClick={handleLogoClick}
                                style={{ width: '160px', cursor: 'default', userSelect: 'none' }}
                            />
                        )}
                    </div>
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
                </div>
            </div>
            <Modal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} title={"Rechercher"}>
                <div>
                    <label htmlFor="search-arrival">Arrivée</label>
                    <input id="search-arrival" type={"text"} placeholder={"Arrivée"} style={{ padding: '1rem', width: '100%', margin: '1rem 0' }} />
                    <div className={"fr ai-c g1"} style={{ padding: '0.8rem 0 0.8rem 0', borderBottom: '1px solid lightgrey' }}>
                        <div style={{ backgroundColor: '#0761ad', width: '40px', height: '40px', borderRadius: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FaLocationArrow fill={"white"} size={"20px"} />
                        </div>
                        <h4 style={{ fontWeight: 'bold' }}>Ma position</h4>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default Home;
