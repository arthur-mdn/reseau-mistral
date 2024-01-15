import React, {useEffect, useRef, useState} from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {FaBolt} from "react-icons/fa6";
import ProfileSelection from "./ProfileSelection.jsx";
import Modal from "./Modal.jsx";

function Scan({ onScanSuccess, onScanError, onClose }) {
    const qrRef = useRef(null);
    const [isManualScanOpen, setIsManualScanOpen] = useState(false);
    let scanner = null;
    let [code, setCode] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();

        if (code) {
            onScanSuccess(code);
            setIsManualScanOpen(false);
            setCode("");
        }
    };

    useEffect(() => {
        if (qrRef.current) {
            const config = {
                fps: 10,
                qrbox: 250,
                aspectRatio: 1
            };

            scanner = new Html5QrcodeScanner(
                qrRef.current.id,
                config,
                false
            );

            scanner.render(onScanSuccess, onScanError);
            const videoElement = qrRef.current.querySelector('video');
            if (videoElement) {
                videoElement.style.width = '100%';
                videoElement.style.height = '100%';
            }
        }

        // Fonction de nettoyage
        return () => {
            if (scanner) {
                scanner.clear().then(() => {
                    console.log('Scanner cleared');
                }).catch((error) => {
                    console.error('Error clearing scanner:', error);
                });
            }
        };
    }, [onScanSuccess, onScanError]);

    return (
        <>
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <div ref={qrRef} id="qr-code-reader" style={{ width: '100%', height:"100%", backgroundColor:"black", border:"0!important" }} />
                <div style={{position:"absolute", width:"100%", height:"100%", top:0, left:0,display:"flex",justifyContent:"center", alignItems:"center",gap:'1rem', pointerEvents:"none"}}>
                    <button onClick={()=>{setIsManualScanOpen(true)}} style={{backgroundColor:"white", color:"black", width:"50px", height:'50px', display:"flex",alignItems:"center", justifyContent:"center",borderRadius:'2rem',pointerEvents:"all",fontWeight:"bold"}}>
                        123
                    </button>
                    <button style={{backgroundColor:"white", color:"black", width:"50px", height:'50px', display:"flex",alignItems:"center", justifyContent:"center",borderRadius:'2rem',pointerEvents:"all"}}>
                        <FaBolt/>
                    </button>
                </div>
            </div>
            <Modal isOpen={isManualScanOpen} onClose={() => setIsManualScanOpen(false)} title={"Saisir code manuel"}>
                <form onSubmit={handleSubmit}>
                    <input type={"text"}
                           maxLength={7}
                           placeholder={"Code"}
                           style={{padding:"1rem", width:"100%", margin:"1rem 0"}}
                           required
                           value={code}
                           onChange={(e) => setCode(e.target.value)}
                    />
                    <button type={"submit"} style={{width:"100%", margin:"1rem 0"}}>Valider</button>
                </form>
            </Modal>
        </>

    );
}

export default Scan;
