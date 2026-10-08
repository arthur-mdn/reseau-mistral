import React, { useState, useEffect, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Scrollbar } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';
import { FaLock } from 'react-icons/fa6';
import { parseDuration } from '../utils/duration.js';

function calculateRemainingTime(ticketUseDate, maxTime) {
    const useDate = new Date(ticketUseDate);
    const maxDuration = parseDuration(maxTime);
    const expireDate = new Date(useDate.getTime() + maxDuration);
    const remainingTime = expireDate - new Date();
    if (remainingTime <= 0) {
        return '00:00:00';
    }
    const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
    const seconds = Math.floor((remainingTime / 1000) % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function findLatestUseDate(ticket) {
    if (!ticket.usages || ticket.usages.length === 0) return null;
    let latest = ticket.usages[0].date;
    for (let i = 1; i < ticket.usages.length; i++) {
        if (new Date(ticket.usages[i].date) > new Date(latest)) {
            latest = ticket.usages[i].date;
        }
    }
    return latest;
}

function TicketSlider({ tickets, onTicketSelect }) {
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [remainingTimes, setRemainingTimes] = useState({});

    const computeRemainingTimes = (ticketList) => {
        const next = {};
        ticketList.forEach((ticket) => {
            const latestUseDate = findLatestUseDate(ticket);
            if (latestUseDate && ticket.priceId?.maxTime) {
                next[ticket._id] = calculateRemainingTime(latestUseDate, ticket.priceId.maxTime);
            }
        });
        return next;
    };

    useEffect(() => {
        setRemainingTimes(computeRemainingTimes(tickets));
        const intervalId = setInterval(() => {
            setRemainingTimes(computeRemainingTimes(tickets));
        }, 1000);
        return () => clearInterval(intervalId);
    }, [tickets]);

    const validTickets = useMemo(
        () => tickets.filter((ticket) => remainingTimes[ticket._id] !== '00:00:00'),
        [tickets, remainingTimes]
    );

    useEffect(() => {
        if (validTickets.length === 0) {
            setSelectedTicketId(null);
            return;
        }
        if (!validTickets.some((t) => t._id === selectedTicketId)) {
            setSelectedTicketId(validTickets[0]._id);
        }
    }, [validTickets, selectedTicketId]);

    const handleSlideChange = (swiper) => {
        const ticket = validTickets[swiper.activeIndex];
        if (ticket) setSelectedTicketId(ticket._id);
    };

    const handleTicketClick = (ticket) => {
        if (ticket._id === selectedTicketId) {
            onTicketSelect(ticket);
        }
        setSelectedTicketId(ticket._id);
    };

    return (
        <Swiper
            spaceBetween={0}
            slidesPerView={"auto"}
            centeredSlides={true}
            onSlideChange={handleSlideChange}
            modules={[Navigation, Scrollbar]}
            className="mySwiper"
        >
            {validTickets.map((ticket) => (
                <SwiperSlide key={ticket._id} className={`ticket-card`} onClick={() => handleTicketClick(ticket)}>
                    <span className={"time_remaining"}>
                        {remainingTimes[ticket._id] ? (
                            <h4 style={{ fontSize: '0.9rem' }}>
                                Temps restant : {remainingTimes[ticket._id]}
                            </h4>
                        ) : (
                            <>&nbsp;</>
                        )}
                    </span>
                    <div style={{ position: 'relative', margin: '0.5rem 0', display: 'flex' }}>
                        {remainingTimes[ticket._id] && (
                            <div
                                style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '15px', position: 'absolute', top: 0, left: 0, boxSizing: 'border-box', border: '4px solid white' }}
                                className={"fc ai-c jc-c"}
                            >
                                <div style={{ width: '2.5rem', height: '2.5rem', display: 'flex', backgroundColor: 'rgba(255,255,255,1)', justifyContent: 'center', alignItems: 'center', borderRadius: '50%' }}>
                                    <FaLock size={"1.35rem"} fill={"rgb(0,0,0)"} style={{ opacity: 1 }} />
                                </div>
                                <h3 style={{ fontSize: '0.9rem', color: 'white', fontWeight: 'bold', textAlign: 'center', margin: '0 1rem' }}>
                                    Appuyez ici pour voir le Titre en cours
                                </h3>
                            </div>
                        )}
                        <img src={`/elements/tickets/${ticket.priceId.image}`} alt={ticket.priceId.title} style={{ margin: ' 0' }} />
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{ticket.priceId.title}</div>
                </SwiperSlide>
            ))}
        </Swiper>
    );
}

export default TicketSlider;
