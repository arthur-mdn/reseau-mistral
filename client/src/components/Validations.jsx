import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function formatDate(dateString) {
    const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

    const date = new Date(dateString);
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
}

function formatTime(timeString) {
    const time = new Date(timeString);
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function groupTicketsByDate(tickets) {
    const grouped = {};
    tickets.forEach(ticket => {
        ticket.usages.forEach(usage => {
            const dateKey = formatDate(usage.date);
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(usage);
        });
    });
    return grouped;
}

function Validations({tickets}) {
    const navigate = useNavigate();
    const [groupedUsages, setGroupedUsages] = useState({});

    useEffect(() => {
        setGroupedUsages(groupTicketsByDate(tickets));
    }, [tickets]);

    return (
        <>
            {Object.entries(groupedUsages).map(([date, usages]) => (
                <div key={date}>
                    <h4 style={{padding: '1rem 1rem',fontWeight:"bold", backgroundColor:'#ebebef',boxShadow:"rgba(0, 0, 0, 0.05) 0px 1px 2px 0px"}}>{date}</h4>
                    <div className={"usages"}>
                        {usages.map((usage, index) => (
                            <div key={index} className={"usage fr jc-sb"} >
                                <div className={"fr ai-c g0-5"}>
                                    <img src={"/elements/icons/ticket.svg"} style={{width:'25px'}}/>
                                    <p><span style={{fontWeight:"bold"}}>1</span> x 1 voyage</p>
                                </div>
                                <p>Validé à <span style={{fontWeight:"bold"}}>{formatTime(usage.date)}</span></p>
                            </div>
                        ))}
                        <div style={{height:'20px',backgroundColor:"#f3f5f5"}}>

                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}
export default Validations;