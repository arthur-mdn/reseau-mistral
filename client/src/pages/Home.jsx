import React, { useState, useEffect, useRef, useCallback } from 'react';
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

const SHEET_REDUIT = 78;
const SHEET_GRAB = 44;

function nearestSnap(height, snaps) {
    const points = [snaps.reduit, snaps.normal, snaps.etendu];
    let best = points[0];
    let bestDist = Math.abs(points[0] - height);
    for (let i = 1; i < points.length; i += 1) {
        const dist = Math.abs(points[i] - height);
        if (dist < bestDist) {
            best = points[i];
            bestDist = dist;
        }
    }
    return best;
}

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

    const stageRef = useRef(null);
    const sheetRef = useRef(null);
    const contentInnerRef = useRef(null);
    const snapsRef = useRef({ reduit: SHEET_REDUIT, normal: SHEET_REDUIT, etendu: SHEET_REDUIT });
    const dragRef = useRef({ active: false, startY: 0, startH: SHEET_REDUIT });
    const [sheetHeight, setSheetHeight] = useState(SHEET_REDUIT);
    const [dragging, setDragging] = useState(false);

    const measureSnaps = useCallback(() => {
        const stage = stageRef.current;
        const inner = contentInnerRef.current;
        if (!stage || !inner) {
            return { reduit: SHEET_REDUIT, normal: SHEET_REDUIT, etendu: SHEET_REDUIT };
        }
        const stageH = stage.clientHeight;
        const contentH = Math.ceil(inner.getBoundingClientRect().height + SHEET_GRAB + 4);
        const reduit = SHEET_REDUIT;
        const maxNormal = Math.round(stageH * 0.78);
        const normal = Math.max(reduit + 80, Math.min(contentH, maxNormal));
        const etendu = Math.max(normal + 80, Math.round(stageH * 0.94));
        return { reduit, normal, etendu: Math.min(etendu, stageH - 4) };
    }, []);

    useEffect(() => {
        const snaps = measureSnaps();
        snapsRef.current = snaps;
        setSheetHeight(snaps.normal);
    }, [ticketsEnCours, loadError, measureSnaps]);

    useEffect(() => {
        const onResize = () => {
            const snaps = measureSnaps();
            snapsRef.current = snaps;
            setSheetHeight((current) => nearestSnap(current, snaps));
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [measureSnaps]);

    const onSheetPointerDown = (event) => {
        if (event.button != null && event.button !== 0) return;
        const snaps = measureSnaps();
        snapsRef.current = snaps;
        dragRef.current = {
            active: true,
            startY: event.clientY,
            startH: sheetHeight,
        };
        setDragging(true);
        event.currentTarget.setPointerCapture?.(event.pointerId);
    };

    const onSheetPointerMove = (event) => {
        if (!dragRef.current.active) return;
        const delta = dragRef.current.startY - event.clientY;
        const next = Math.min(
            snapsRef.current.etendu,
            Math.max(snapsRef.current.reduit, dragRef.current.startH + delta)
        );
        setSheetHeight(next);
    };

    const onSheetPointerUp = () => {
        if (!dragRef.current.active) return;
        dragRef.current.active = false;
        setDragging(false);
        setSheetHeight((current) => {
            const snaps = measureSnaps();
            snapsRef.current = snaps;
            return nearestSnap(current, snaps);
        });
    };

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
            <div ref={stageRef} className="home-stage">
                <div
                    ref={sheetRef}
                    className={`home-sheet${dragging ? ' is-dragging' : ''}`}
                    style={{ height: sheetHeight }}
                >
                    <div
                        className="home-sheet__grab"
                        onPointerDown={onSheetPointerDown}
                        onPointerMove={onSheetPointerMove}
                        onPointerUp={onSheetPointerUp}
                        onPointerCancel={onSheetPointerUp}
                    >
                        <div className="home-sheet__handle" />
                    </div>
                    <div className="home-sheet__content">
                        <div ref={contentInnerRef} className="home-sheet__inner">
                            {loadError && (
                                <p style={{ color: '#ffb4b4', marginBottom: '1rem' }}>{loadError}</p>
                            )}
                            <button
                                type={"button"}
                                className="home-sheet__search"
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
