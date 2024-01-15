import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';
import {FaBan} from "react-icons/fa6";


function calculateRemainingTime(ticketUseDate, maxTime) {
    const useDate = new Date(ticketUseDate);
    const maxDuration = parseDuration(maxTime);
    const expireDate = new Date(useDate.getTime() + maxDuration);
    const currentDate = new Date();

    const remainingTime = expireDate - currentDate;
    if (remainingTime <= 0) {
        return '00:00:00'; // Temps expiré
    }

    const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
    const seconds = Math.floor((remainingTime / 1000) % 60);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function parseDuration(durationString) {
    const [amount, unit] = durationString.split(' ');
    switch (unit) {
        case 'hour':
        case 'hours':
            return amount * 60 * 60 * 1000;
        case 'day':
        case 'days':
            return amount * 24 * 60 * 60 * 1000;
        default:
            return 0;
    }
}


function TicketSlider({ tickets, onTicketSelect }) {
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [remainingTimes, setRemainingTimes] = useState({});

    const findLatestUseDate = (ticket) => {
        if (!ticket.usages || ticket.usages.length === 0) return null;
        const sortedUsages = [...ticket.usages].sort((a, b) => new Date(b.date) - new Date(a.date));
        return sortedUsages[0].date; // Retourne la date du dernier usage
    };

    const isTicketExpired = (ticketId) => {
        return remainingTimes[ticketId] === '00:00:00';
    };
    const validTickets = tickets.filter(ticket => !isTicketExpired(ticket._id));

    // Mise à jour du ticket sélectionné lorsque la liste des tickets valides change
    useEffect(() => {
        if (validTickets.length > 0 && (!selectedTicket || !validTickets.includes(selectedTicket))) {
            setSelectedTicket(validTickets[0]);
        }
    }, [validTickets]);

    useEffect(() => {
        const newRemainingTimes = {};
        tickets.forEach(ticket => {
            const latestUseDate = findLatestUseDate(ticket);
            if (latestUseDate) {
                newRemainingTimes[ticket._id] = calculateRemainingTime(latestUseDate, ticket.priceId.maxTime);
            }
        });
        setRemainingTimes(newRemainingTimes);
    }, [tickets]);

    useEffect(() => {
        if (tickets.length > 0) {
            setSelectedTicket(tickets[0]);
        }
    }, [tickets, onTicketSelect]);


    useEffect(() => {
        const initializeRemainingTimes = () => {
            const initialRemainingTimes = {};
            tickets.forEach(ticket => {
                const latestUseDate = findLatestUseDate(ticket);
                if (latestUseDate) {
                    initialRemainingTimes[ticket._id] = calculateRemainingTime(latestUseDate, ticket.priceId.maxTime);
                }
            });
            return initialRemainingTimes;
        };

        const newRemainingTimes = initializeRemainingTimes();
        setRemainingTimes(newRemainingTimes);

        const intervalId = setInterval(() => {
            const updatedRemainingTimes = {};
            tickets.forEach(ticket => {
                const latestUseDate = findLatestUseDate(ticket);
                if (latestUseDate) {
                    updatedRemainingTimes[ticket._id] = calculateRemainingTime(latestUseDate, ticket.priceId.maxTime);
                }
            });
            setRemainingTimes(updatedRemainingTimes);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [tickets]);


    const handleSlideChange = (swiper) => {
        const index = swiper.activeIndex;
        setSelectedTicket(validTickets[index]);
    };

    const handleTicketClick = (ticket) => {
        if (ticket === selectedTicket) {
            onTicketSelect(ticket);
        }
        handleSlideChange({ activeIndex: validTickets.indexOf(ticket) });
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
            {validTickets.map(ticket => (
                <SwiperSlide key={ticket._id} className={`ticket-card`} onClick={() => handleTicketClick(ticket)}>
                   <span className={"time_remaining"}>
                       {
                           remainingTimes[ticket._id] && (
                               <>
                                Temps restant : {remainingTimes[ticket._id] || 'N/A'}
                               </>
                           )

                       }
                       {
                           !remainingTimes[ticket._id] && (
                               <>
                                   &nbsp;
                               </>
                           )

                       }

                    </span>
                    <div style={{position:"relative", margin:'0.5rem 0', display:"flex"}}>
                        {
                            remainingTimes[ticket._id] && (
                                <div style={{width:'100%', height:'100%', backgroundColor:'rgba(52,52,52,0.2)',borderRadius:'15px', position:"absolute",top:0,left:0, boxSizing:"border-box", border:"4px solid white" }} className={"fc ai-c jc-c"}>
                                    <FaBan size={"4rem"} fill={"rgb(80,80,80)"} style={{rotate:"90deg", opacity:0.6}}/>
                                </div>
                            )
                        }
                        <img src={`/elements/tickets/${ticket.priceId.image}`} alt={ticket.priceId.title} style={{margin:' 0'}}/>
                    </div>
                    <div>{ticket.priceId.title}</div>
                </SwiperSlide>
            ))}
        </Swiper>
    );
}

export default TicketSlider;
