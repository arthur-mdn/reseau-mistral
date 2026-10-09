import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { isTicketUsable, parseDuration, sortTicketsActiveFirst } from '../utils/duration.js';

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

function computeRemainingTimes(ticketList) {
    const next = {};
    ticketList.forEach((ticket) => {
        const latestUseDate = findLatestUseDate(ticket);
        if (latestUseDate && ticket.priceId?.maxTime) {
            next[ticket._id] = calculateRemainingTime(latestUseDate, ticket.priceId.maxTime);
        }
    });
    return next;
}

function TicketSlider({ tickets, onTicketSelect }) {
    const swiperRef = useRef(null);
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [remainingTimes, setRemainingTimes] = useState(() => computeRemainingTimes(tickets || []));

    useEffect(() => {
        setRemainingTimes(computeRemainingTimes(tickets || []));
        const intervalId = setInterval(() => {
            setRemainingTimes(computeRemainingTimes(tickets || []));
        }, 1000);
        return () => clearInterval(intervalId);
    }, [tickets]);

    const validTickets = useMemo(() => {
        const sorted = sortTicketsActiveFirst(tickets || []);
        return sorted.filter((ticket) => isTicketUsable(ticket));
    }, [tickets, remainingTimes]);

    useEffect(() => {
        if (validTickets.length === 0) {
            setSelectedTicketId(null);
            return;
        }
        if (!validTickets.some((t) => t._id === selectedTicketId)) {
            setSelectedTicketId(validTickets[0]._id);
            swiperRef.current?.slideTo(0, 0);
        }
    }, [validTickets, selectedTicketId]);

    useEffect(() => {
        const swiper = swiperRef.current;
        if (!swiper) return;
        swiper.update();
        requestAnimationFrame(() => {
            swiper.slideTo(swiper.activeIndex, 0);
        });
    }, [validTickets.length]);

    const handleSlideChange = (swiper) => {
        const ticket = validTickets[swiper.activeIndex];
        if (ticket) setSelectedTicketId(ticket._id);
    };

    const handleTicketClick = (ticket, index) => {
        if (ticket._id === selectedTicketId) {
            onTicketSelect(ticket);
            return;
        }
        setSelectedTicketId(ticket._id);
        swiperRef.current?.slideTo(index);
    };

    if (validTickets.length === 0) {
        return null;
    }

    return (
        <div className={"tickets-slider"}>
            <Swiper
                slidesPerView={"auto"}
                centeredSlides={true}
                spaceBetween={16}
                slideToClickedSlide={true}
                watchSlidesProgress={true}
                onSwiper={(swiper) => {
                    swiperRef.current = swiper;
                    requestAnimationFrame(() => swiper.update());
                }}
                onSlideChange={handleSlideChange}
                className="mySwiper"
            >
                {validTickets.map((ticket, index) => (
                    <SwiperSlide key={ticket._id} className={"ticket-card"}>
                        <button
                            type="button"
                            className={"ticket-card__btn"}
                            onClick={() => handleTicketClick(ticket, index)}
                        >
                            <span className={"time_remaining"}>
                                {remainingTimes[ticket._id] ? (
                                    <h4 style={{ fontSize: '0.9rem' }}>
                                        Temps restant : {remainingTimes[ticket._id]}
                                    </h4>
                                ) : (
                                    <>&nbsp;</>
                                )}
                            </span>
                            <div className={"ticket-card__image-wrap"}>
                                {remainingTimes[ticket._id] && (
                                    <div className={"ticket-card__lock fc ai-c jc-c"}>
                                        <img
                                            className={"ticket-card__lock-icon"}
                                            src={"/elements/icons/lock.png"}
                                            alt=""
                                        />
                                        <h3>
                                            Appuyez ici pour voir le Titre en cours
                                        </h3>
                                    </div>
                                )}
                                <img
                                    src={`/elements/tickets/${ticket.priceId.image}`}
                                    alt={ticket.priceId.title}
                                />
                            </div>
                            <div className={"ticket-card__title"}>{ticket.priceId.title}</div>
                        </button>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}

export default TicketSlider;
