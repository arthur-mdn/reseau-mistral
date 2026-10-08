import React, {useCallback, useEffect, useRef, useState} from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import {FaBolt} from "react-icons/fa6";
import Modal from "./Modal.jsx";
import {FaBackspace} from "react-icons/fa";
import { CAMERA_ID_KEY } from '../utils/cameraPermission';

const QR_BOX_MAX = 250;
const BUTTONS_GAP = 72;
const LABEL_GAP = 80;
const CHEVRON_OUTSET = 10;
const CHEVRON_SIZE = 28;
const CHEVRON_STROKE = 4;

function isAppleTouchDevice() {
    if (typeof navigator === 'undefined') return false;
    return /iPad|iPhone|iPod/i.test(navigator.userAgent)
        || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function ScanChevron() {
    const s = CHEVRON_STROKE;
    const c = s;
    const tip = CHEVRON_SIZE - s;
    return (
        <svg width={CHEVRON_SIZE} height={CHEVRON_SIZE} viewBox={`0 0 ${CHEVRON_SIZE} ${CHEVRON_SIZE}`} aria-hidden="true">
            <rect x={c - s / 2} y={c - s / 2} width={s} height={s} fill="#fff" />
            <line
                x1={c}
                y1={tip}
                x2={c}
                y2={c + s / 2}
                stroke="#fff"
                strokeWidth={s}
                strokeLinecap="round"
            />
            <line
                x1={c + s / 2}
                y1={c}
                x2={tip}
                y2={c}
                stroke="#fff"
                strokeWidth={s}
                strokeLinecap="round"
            />
        </svg>
    );
}

const actionBtnStyle = {
    backgroundColor: '#fff',
    color: '#111',
    width: '56px',
    height: '56px',
    minWidth: '56px',
    minHeight: '56px',
    maxWidth: '56px',
    maxHeight: '56px',
    padding: 0,
    aspectRatio: '1 / 1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    border: '1px solid #ddd',
    fontWeight: 'bold',
    flexShrink: 0,
    boxSizing: 'border-box',
    lineHeight: 1,
};

function computeQrBoxSize(viewfinderWidth, viewfinderHeight) {
    const side = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.7);
    return Math.max(120, Math.min(QR_BOX_MAX, side));
}

function measureScanFrame(container) {
    if (!container) return null;

    const shaded = container.querySelector('#qr-shaded-region');
    if (shaded) {
        const containerRect = container.getBoundingClientRect();
        const shadedRect = shaded.getBoundingClientRect();
        const style = window.getComputedStyle(shaded);
        const borderTop = parseFloat(style.borderTopWidth) || 0;
        const borderBottom = parseFloat(style.borderBottomWidth) || 0;
        const borderLeft = parseFloat(style.borderLeftWidth) || 0;
        const borderRight = parseFloat(style.borderRightWidth) || 0;

        const frameTop = shadedRect.top - containerRect.top + borderTop;
        const frameLeft = shadedRect.left - containerRect.left + borderLeft;
        const frameWidth = Math.max(0, shadedRect.width - borderLeft - borderRight);
        const frameHeight = Math.max(0, shadedRect.height - borderTop - borderBottom);

        if (frameWidth > 0 && frameHeight > 0) {
            return {
                top: frameTop,
                left: frameLeft,
                width: frameWidth,
                height: frameHeight,
            };
        }
    }

    const size = computeQrBoxSize(container.clientWidth, container.clientHeight);
    return {
        top: (container.clientHeight - size) / 2,
        left: (container.clientWidth - size) / 2,
        width: size,
        height: size,
    };
}

function Scan({ onScanSuccess, onScanError }) {
    const rootRef = useRef(null);
    const qrRef = useRef(null);
    const scannerRef = useRef(null);
    const onScanSuccessRef = useRef(onScanSuccess);
    const onScanErrorRef = useRef(onScanError);
    const [isManualScanOpen, setIsManualScanOpen] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const [torchOn, setTorchOn] = useState(false);
    const [torchSupported, setTorchSupported] = useState(false);
    const [code, setCode] = useState("");
    const [codeError, setCodeError] = useState(null);
    const [scanFrame, setScanFrame] = useState(null);

    const syncButtonsPosition = useCallback(() => {
        const frame = measureScanFrame(rootRef.current);
        setScanFrame(frame);
    }, []);

    useEffect(() => {
        onScanSuccessRef.current = onScanSuccess;
        onScanErrorRef.current = onScanError;
    }, [onScanSuccess, onScanError]);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        syncButtonsPosition();

        const resizeObserver = new ResizeObserver(() => {
            syncButtonsPosition();
        });
        resizeObserver.observe(root);

        const mutationObserver = new MutationObserver(() => {
            syncButtonsPosition();
        });
        mutationObserver.observe(root, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class'],
        });

        window.addEventListener('resize', syncButtonsPosition);
        window.addEventListener('orientationchange', syncButtonsPosition);

        return () => {
            resizeObserver.disconnect();
            mutationObserver.disconnect();
            window.removeEventListener('resize', syncButtonsPosition);
            window.removeEventListener('orientationchange', syncButtonsPosition);
        };
    }, [syncButtonsPosition]);

    useEffect(() => {
        if (!qrRef.current) return;

        let cancelled = false;
        const elementId = qrRef.current.id;
        const scanner = new Html5Qrcode(elementId);
        scannerRef.current = scanner;

        const onApple = isAppleTouchDevice();
        const config = {
            fps: onApple ? 10 : 15,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
                const size = computeQrBoxSize(viewfinderWidth, viewfinderHeight);
                return { width: size, height: size };
            },
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
            experimentalFeatures: {
                useBarCodeDetectorIfSupported: true,
            },
            disableFlip: false,
        };

        const handleSuccess = (decodedText, decodedResult) => {
            onScanSuccessRef.current?.(decodedText, decodedResult);
        };

        const handleError = (error) => {
            onScanErrorRef.current?.(error);
        };

        const detectTorch = async () => {
            try {
                const track = scanner.getRunningTrackCameraCapabilities?.();
                const supported = Boolean(track?.torchFeature?.()?.isSupported?.());
                if (!cancelled) setTorchSupported(supported);
            } catch {
                if (!cancelled) setTorchSupported(false);
            }
        };

        const prepareVideoElement = () => {
            const videoElement = qrRef.current?.querySelector('video');
            if (!videoElement) return;
            videoElement.setAttribute('playsinline', 'true');
            videoElement.setAttribute('webkit-playsinline', 'true');
            videoElement.muted = true;
            videoElement.playsInline = true;
            videoElement.style.width = '100%';
            videoElement.style.height = '100%';
            videoElement.style.objectFit = 'contain';
            videoElement.style.objectPosition = 'center center';
            videoElement.play?.().catch(() => {});
        };

        const afterStart = async () => {
            const deviceId = scanner.getRunningTrackSettings?.()?.deviceId;
            if (deviceId && !onApple) {
                localStorage.setItem(CAMERA_ID_KEY, deviceId);
            }

            prepareVideoElement();
            await detectTorch();
            requestAnimationFrame(() => {
                syncButtonsPosition();
                setTimeout(syncButtonsPosition, 50);
                setTimeout(syncButtonsPosition, 200);
            });
        };

        const startCamera = async () => {
            const lastCameraId = onApple ? null : localStorage.getItem(CAMERA_ID_KEY);
            const cameraConfig = lastCameraId || { facingMode: 'environment' };

            try {
                await scanner.start(cameraConfig, config, handleSuccess, handleError);
                if (cancelled) {
                    await scanner.stop().catch(() => {});
                    return;
                }
                await afterStart();
            } catch (firstError) {
                if (cancelled) return;

                if (lastCameraId) {
                    try {
                        await scanner.start({ facingMode: 'environment' }, config, handleSuccess, handleError);
                        if (cancelled) {
                            await scanner.stop().catch(() => {});
                            return;
                        }
                        setCameraError(null);
                        await afterStart();
                        return;
                    } catch {
                        localStorage.removeItem(CAMERA_ID_KEY);
                    }
                }

                setCameraError(
                    firstError?.name === 'NotAllowedError' || /permission|denied|NotAllowed/i.test(String(firstError))
                        ? "Accès à la caméra refusé. Autorise la caméra dans les réglages du navigateur, puis réouvre le scanner."
                        : "Impossible d'accéder à la caméra."
                );
            }
        };

        startCamera();

        return () => {
            cancelled = true;
            const clearScanner = () => {
                try {
                    scanner.clear();
                } catch {
                    // clear() is synchronous in html5-qrcode
                }
            };
            if (scanner.isScanning) {
                scanner.stop().then(clearScanner).catch(clearScanner);
            } else {
                clearScanner();
            }
            scannerRef.current = null;
        };
    }, [syncButtonsPosition]);

    const toggleTorch = async () => {
        const scanner = scannerRef.current;
        if (!scanner) return;
        try {
            const next = !torchOn;
            await scanner.applyVideoConstraints({
                advanced: [{ torch: next }],
            });
            setTorchOn(next);
        } catch {
            try {
                const caps = scanner.getRunningTrackCameraCapabilities?.();
                const torchFeature = caps?.torchFeature?.();
                if (torchFeature?.isSupported?.()) {
                    const next = !torchOn;
                    await torchFeature.apply(next);
                    setTorchOn(next);
                }
            } catch {
                setTorchSupported(false);
            }
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const formatRegex = /^[0-9]{3}\+[0-9]{3}$/;

        if (formatRegex.test(code)) {
            onScanSuccess(code);
            setIsManualScanOpen(false);
            setCode("");
            setCodeError(null);
        } else {
            setCodeError("Le format du code doit être 'XXX+XXX'.");
        }
    };

    const handleButtonClick = (value) => {
        if (value === 'effacer') {
            setCode(code.slice(0, -1));
        } else {
            setCode(code + value);
        }
    };

    const renderVirtualKeyboard = () => {
        const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '+', 'effacer'];
        return keys.map(key => (
            <button type={"button"} key={key} onClick={() => handleButtonClick(key)} style={{flex:'1 1 25%',margin:"auto",flexGrow:0,padding:0,backgroundColor:"white", color:"black", width:"50px", height:'50px', display:"flex",alignItems:"center", justifyContent:"center",borderRadius:'2rem',pointerEvents:"all",fontWeight:"bold", boxShadow:"rgba(67, 71, 85, 0.27) 0px 0px 0.25em, rgba(90, 125, 188, 0.05) 0px 0.25em 1em"}}>
                {key === 'effacer' ? <FaBackspace/> : key}
            </button>
        ));
    };

    return (
        <>
            <div ref={rootRef} style={{ position: 'relative', width: '100%', height: '100%', minHeight: 0, backgroundColor: '#000', overflow: 'hidden' }}>
                <div ref={qrRef} id="qr-code-reader" style={{ width: '100%', height: '100%', backgroundColor: 'black', border: '0!important' }} />
                {cameraError && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', textAlign: 'center', color: 'white', backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 2 }}>
                        <p>{cameraError}</p>
                    </div>
                )}
                {scanFrame && (
                    <>
                        <p
                            style={{
                                position: 'absolute',
                                top: scanFrame.top - LABEL_GAP,
                                left: scanFrame.left + scanFrame.width / 2,
                                transform: 'translate(-50%, -100%)',
                                width: 'min(90vw, 320px)',
                                margin: 0,
                                padding: '0 0.75rem',
                                color: '#fff',
                                textAlign: 'center',
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                lineHeight: 1.35,
                                textShadow: '0 1px 3px rgba(0,0,0,0.65)',
                                zIndex: 3,
                                pointerEvents: 'none',
                            }}
                        >
                            Scannez le QR code pour l'utiliser ou saisissez le texte
                        </p>
                        <div
                            className="scan-frame-chevrons"
                            aria-hidden="true"
                            style={{
                                top: scanFrame.top - CHEVRON_OUTSET,
                                left: scanFrame.left - CHEVRON_OUTSET,
                                width: scanFrame.width + CHEVRON_OUTSET * 2,
                                height: scanFrame.height + CHEVRON_OUTSET * 2,
                            }}
                        >
                            <span className="scan-frame-chevrons__corner scan-frame-chevrons__corner--tl">
                                <ScanChevron />
                            </span>
                            <span className="scan-frame-chevrons__corner scan-frame-chevrons__corner--tr">
                                <ScanChevron />
                            </span>
                            <span className="scan-frame-chevrons__corner scan-frame-chevrons__corner--br">
                                <ScanChevron />
                            </span>
                            <span className="scan-frame-chevrons__corner scan-frame-chevrons__corner--bl">
                                <ScanChevron />
                            </span>
                        </div>
                        <div
                            style={{
                                position: 'absolute',
                                top: scanFrame.top + scanFrame.height + BUTTONS_GAP,
                                left: scanFrame.left + scanFrame.width / 2,
                                transform: 'translateX(-50%)',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '1.25rem',
                                zIndex: 3,
                                pointerEvents: 'all',
                            }}
                        >
                            <button
                                type="button"
                                aria-label="Saisie manuelle du code"
                                onClick={() => setIsManualScanOpen(true)}
                                style={actionBtnStyle}
                            >
                                123
                            </button>
                            <button
                                type="button"
                                aria-label="Lampe torche"
                                aria-pressed={torchOn}
                                onClick={toggleTorch}
                                title={torchSupported ? 'Lampe torche' : 'Lampe torche (selon appareil)'}
                                style={{
                                    ...actionBtnStyle,
                                    backgroundColor: torchOn ? '#FFD400' : '#fff',
                                }}
                            >
                                <FaBolt size={22} color="#111" style={{ display: 'block', flexShrink: 0 }} />
                            </button>
                        </div>
                    </>
                )}
            </div>
            <Modal isOpen={isManualScanOpen} onClose={() => setIsManualScanOpen(false)} title={"Saisir code manuel"}>
                <form onSubmit={handleSubmit}>
                    {codeError && (
                        <div style={{color:"red", textAlign:"center", margin:"1rem 0"}}>
                            {codeError}
                        </div>
                    )}
                    <input type={"text"}
                           maxLength={7}
                           placeholder={"Code"}
                           style={{padding:"1rem", width:"100%", margin:"1rem 0"}}
                           required
                           value={code}
                           onChange={(e) => setCode(e.target.value)}
                    />
                    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap:'0.8rem'}}>
                        {renderVirtualKeyboard()}
                    </div>
                    <br/>
                    <br/>
                    <button type={"submit"} style={{width:"100%", margin:"1rem 0"}}>Valider</button>
                </form>
            </Modal>
        </>
    );
}

export default Scan;
