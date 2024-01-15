// DemoBanner.jsx
import React, {useEffect, useState} from 'react';
import { useCookies } from 'react-cookie';

const DemoBanner = () => {
    const [showBanner, setShowBanner] = useState(true);
    const [cookies] = useCookies(['hideDemoBanner']);

    useEffect(() => {
        if (cookies.hideDemoBanner === true) {
            setShowBanner(false);
        }else{
            setShowBanner(true)
        }
    }, [cookies]);


    return (
        <>
            {showBanner && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    textAlign: 'center',
                    padding: '10px',
                    pointerEvents: 'none',
                    zIndex: 1000000000000
                }}>
                    <h3 style={{backgroundColor: 'rgba(0, 0, 0, 0.5)', padding:'0.5rem', borderRadius:'1rem'}}>
                        Application factice, ne pas utiliser en production
                    </h3>
                </div>
                )
            }
        </>
    );
};

export default DemoBanner;
