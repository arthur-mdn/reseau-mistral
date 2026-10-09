import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useTopBar } from '../TopBarContext.jsx';
import ProfileSelection from '../components/ProfileSelection';
import Modal from '../components/Modal';
import { useCookies } from 'react-cookie';
import { FaCartShopping } from 'react-icons/fa6';
import TicketSlider from '../components/TicketSlider.jsx';
import { useNavigate } from 'react-router-dom';
import Validations from '../components/Validations.jsx';
import Loading from '../components/Loading.jsx';
import api from '../api';
import { isTicketUsable } from '../utils/duration.js';

const Boutique = lazy(() => import('../components/Boutique.jsx'));
const Scan = lazy(() => import('../components/Scan.jsx'));

function Tickets() {
    const navigate = useNavigate();
    const { setTopBarState } = useTopBar();
    const [cookies, , removeCookie] = useCookies(['selectedProfile']);
    const [isProfileSelectionOpen, setIsProfileSelectionOpen] = useState(false);
    const [isBoutiqueOpen, setIsBoutiqueOpen] = useState(false);
    const [profileSelected, setProfileSelected] = useState(null);
    const [ticketSelected, setTicketSelected] = useState(null);
    const [useTicket, setUseTicket] = useState(null);
    const [validationListOpen, setValidationListOpen] = useState(false);
    const [howUseOpen, setHowUseOpen] = useState(false);
    const [paymentSuccessOpen, setPaymentSuccessOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setTopBarState({
            backLink: '',
            title: 'M-Tickets',
            isVisible: true,
            actions: [
                { title: 'Mes validations', action: () => setValidationListOpen(true) },
                { title: 'Comment utiliser ses titres ?', action: () => setHowUseOpen(true) },
            ],
        });
        return () => setTopBarState({ title: '', isVisible: true });
    }, [setTopBarState]);

    const loadProfile = (profileId, signal) => {
        setIsLoading(true);
        setLoadError(null);
        return api.get(`/user/profiles/${profileId}`, { signal })
            .then((response) => {
                setProfileSelected(response.data);
                setIsLoading(false);
            })
            .catch((error) => {
                if (error.name === 'CanceledError') return;
                setIsLoading(false);
                if (error.response?.status === 404) {
                    removeCookie('selectedProfile', { path: '/' });
                    setProfileSelected(null);
                } else {
                    setLoadError('Impossible de charger les titres');
                }
            });
    };

    useEffect(() => {
        if (!cookies.selectedProfile) {
            setProfileSelected(null);
            setIsLoading(false);
            return undefined;
        }
        const controller = new AbortController();
        loadProfile(cookies.selectedProfile, controller.signal);
        return () => controller.abort();
    }, [cookies.selectedProfile, removeCookie]);

    const handleTicketSelect = (ticket) => {
        if (ticket.usages && ticket.usages.length > 0) {
            navigate('/tickets/' + ticket._id, { replace: true });
        } else {
            setTicketSelected(ticket);
        }
    };

    const onCheckoutConfirmed = () => {
        if (cookies.selectedProfile) {
            loadProfile(cookies.selectedProfile);
        }
    };

    const validateTicket = (scanData) => {
        if (isSubmitting || !ticketSelected) return;
        setIsSubmitting(true);
        setIsLoading(true);

        api.post('/tickets/use', {
            ticketId: ticketSelected._id,
            scanData,
            profileId: cookies.selectedProfile,
        })
            .then(() => {
                navigate('/tickets/' + ticketSelected._id, { replace: true });
            })
            .catch((error) => {
                setIsLoading(false);
                setIsSubmitting(false);
                setLoadError(error.response?.data?.message || 'Erreur lors de la validation');
            });
    };

    if (isSubmitting) return <Loading />;

    const hasUsableTickets = (profileSelected?.tickets || []).some((ticket) => isTicketUsable(ticket));
    const showTicketsSkeleton = Boolean(cookies.selectedProfile) && isLoading;

    return (
        <div className="tickets-page">
            {loadError && (
                <div style={{ padding: '1rem', textAlign: 'center' }}>
                    <p style={{ color: 'red' }}>{loadError}</p>
                    <button type="button" onClick={() => cookies.selectedProfile && loadProfile(cookies.selectedProfile)}>
                        Réessayer
                    </button>
                </div>
            )}

            {!cookies.selectedProfile && !profileSelected && (
                <div className={"no_profile_selected"} style={{ textAlign: 'center' }}>
                    <h3>Aucun voyageur sélectionné</h3>
                    <p>Veuillez sélectionner un voyageur pour visualiser vos titres.</p>
                    <button type={"button"} onClick={() => setIsProfileSelectionOpen(true)}>Choisir un voyageur</button>
                </div>
            )}

            {(profileSelected || showTicketsSkeleton) && (
                <>
                    <div className={"actual_profile_selector"}>
                        <div className={"actual_profile_selector__info"}>
                            <h4>{profileSelected?.prenom || '…'}</h4>
                            <span className={"actual_profile_selector__email"}>{profileSelected?.email || ''}</span>
                        </div>
                        <button
                            type="button"
                            className={"actual_profile_selector__btn"}
                            aria-label="Changer de voyageur"
                            onClick={() => setIsProfileSelectionOpen(true)}
                        >
                            <img src={"/elements/icons/arrows.svg"} style={{ width: '15px' }} alt="" />
                        </button>
                    </div>

                    {showTicketsSkeleton && (
                        <div className="tickets-page__content bg-grey" aria-busy="true" aria-label="Chargement des titres">
                            <h4 className="tickets-page__section-title">SUR MON TÉLÉPHONE</h4>
                            <div className="tickets">
                                <div className="tickets-skeleton">
                                    <div className="tickets-skeleton__time" aria-hidden="true" />
                                    <div className="tickets-skeleton__card" />
                                    <div className="tickets-skeleton__lines">
                                        <div className="tickets-skeleton__line tickets-skeleton__line--short" />
                                        <div className="tickets-skeleton__line tickets-skeleton__line--long" />
                                    </div>
                                </div>
                            </div>
                            <button type="button" className="tickets-buy-btn tickets-buy-btn--disabled" disabled>
                                Acheter
                            </button>
                        </div>
                    )}

                    {!showTicketsSkeleton && profileSelected && !hasUsableTickets && (
                        <div className="no_tickets">
                            <h3>Aucun titre à utiliser</h3>
                            <p>Vous pouvez acheter des titres pour voyager sur le réseau</p>
                            <button type="button" onClick={() => setIsBoutiqueOpen(true)}>
                                Acheter des titres
                            </button>
                        </div>
                    )}

                    {!showTicketsSkeleton && hasUsableTickets && (
                        <div className="tickets-page__content bg-grey">
                            <h4 className="tickets-page__section-title">SUR MON TÉLÉPHONE</h4>
                            <div className={"tickets"}>
                                <TicketSlider
                                    tickets={profileSelected.tickets}
                                    onTicketSelect={handleTicketSelect}
                                />
                            </div>
                            <button
                                type="button"
                                className="tickets-buy-btn"
                                onClick={() => setIsBoutiqueOpen(true)}
                            >
                                <FaCartShopping /> Acheter des titres
                            </button>
                        </div>
                    )}
                </>
            )}

            <Modal isOpen={isProfileSelectionOpen} onClose={() => setIsProfileSelectionOpen(false)} title={"Changer de voyageur"}>
                <ProfileSelection
                    onProfileSelect={(profile) => setProfileSelected(profile)}
                    onClose={() => setIsProfileSelectionOpen(false)}
                />
            </Modal>

            {profileSelected?.tickets && (
                <>
                    <Modal isOpen={validationListOpen} onClose={() => setValidationListOpen(false)} title={"Mes validations"} padding={0} contentOverflowY={"scroll"}>
                        <Validations tickets={profileSelected.tickets} />
                    </Modal>
                    <Modal isOpen={howUseOpen} onClose={() => setHowUseOpen(false)} title={"Comment utiliser ses titres ?"} padding={0}>
                        <div style={{ padding: '0 1rem' }}>
                            {[
                                'Monter dans le bus par la porte avant',
                                'Sélectionner un M-TICKET',
                                'Actionnez le bouton Scanner le QR Code',
                                'Scanner le QR Code à proximité du conducteur',
                            ].map((text, i) => (
                                <div key={text} className={"fr ai-c g1"} style={{ borderBottom: '1px solid lightgrey', padding: '1rem 0' }}>
                                    <div className={"fr jc-c ai-c"} style={{ border: '1px solid grey', width: '40px', height: '40px', borderRadius: '4rem', fontWeight: 'bold' }}>
                                        {i + 1}
                                    </div>
                                    <h3>{text}</h3>
                                </div>
                            ))}
                        </div>
                    </Modal>
                </>
            )}

            <Modal isOpen={isBoutiqueOpen} onClose={() => setIsBoutiqueOpen(false)} title={"Acheter"} padding={"0"}>
                <Suspense fallback={<Loading />}>
                    <Boutique
                        onClose={() => setIsBoutiqueOpen(false)}
                        onCheckoutConfirmed={() => {
                            setIsBoutiqueOpen(false);
                            setPaymentSuccessOpen(true);
                            onCheckoutConfirmed();
                        }}
                    />
                </Suspense>
            </Modal>

            <Modal isOpen={!!ticketSelected} onClose={() => setTicketSelected(null)} title={"Acheter"} padding={"0"} hideBg={true}>
                <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div
                        style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '100%', backgroundColor: 'rgba(0,0,0,0)', zIndex: 9998 }}
                        onClick={() => setTicketSelected(null)}
                        onKeyDown={(e) => e.key === 'Escape' && setTicketSelected(null)}
                        role="button"
                        tabIndex={0}
                        aria-label="Fermer"
                    />
                    <div style={{ backgroundColor: 'white', zIndex: 9999, marginTop: 'auto', padding: '2rem', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
                        <h2 style={{ fontWeight: 'bold' }}>{ticketSelected?.priceId?.title}</h2>
                        <h4><span style={{ fontWeight: 'bold' }}>1</span> Voyage disponible</h4>
                        <button type={"button"} style={{ width: '100%', margin: '6rem 0 2rem 0' }} onClick={() => setUseTicket(ticketSelected)}>
                            Utiliser
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={!!useTicket} onClose={() => setUseTicket(null)} title={"Scanner pour valider"} padding={"0"}>
                <Suspense fallback={<Loading />}>
                    <Scan
                        onScanSuccess={(scanData) => {
                            setUseTicket(null);
                            validateTicket(scanData);
                        }}
                    />
                </Suspense>
            </Modal>

            <Modal isOpen={paymentSuccessOpen} onClose={() => setPaymentSuccessOpen(false)} title={"Paiement validé"} bgColor={"white"}>
                <div className={"fc ai-c jc-c g1"} style={{ textAlign: 'center', padding: '2rem 0', height: '100%' }}>
                    <img src={"/elements/images/pay_success.PNG"} alt={"paiement réussi"} style={{ width: '160px' }} />
                    <h1 style={{ fontWeight: 'bold' }}>Paiement validé</h1>
                    <p>Retrouvez vos titres dans votre espace de voyage et utilisez-les pour vous déplacer facilement</p>
                    <button type={"button"} style={{ width: '100%', marginTop: 'auto' }} onClick={() => setPaymentSuccessOpen(false)}>
                        Fermer
                    </button>
                </div>
            </Modal>
        </div>
    );
}

export default Tickets;
