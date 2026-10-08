import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FaBolt } from 'react-icons/fa6';
import { FaBackspace } from 'react-icons/fa';
import Modal from './Modal.jsx';
import { CAMERA_ID_KEY } from '../utils/cameraPermission';
import { createQrDetector, getScanEnginePreference } from '../utils/scanEngine';

const QR_BOX_MAX = 250;
const BUTTONS_GAP = 72;
const LABEL_GAP = 80;
const CHEVRON_OUTSET = 10;
const CHEVRON_SIZE = 28;
const CHEVRON_STROKE = 4;
const SCAN_INTERVAL_MS = 120;

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
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return null;
    const size = computeQrBoxSize(width, height);
    return {
        top: (height - size) / 2,
        left: (width - size) / 2,
        width: size,
        height: size,
        containerWidth: width,
        containerHeight: height,
    };
}

function Scan({ onScanSuccess, onScanError }) {
    const rootRef = useRef(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const detectorRef = useRef(null);
    const scanningRef = useRef(false);
    const successLockRef = useRef(false);
    const onScanSuccessRef = useRef(onScanSuccess);
    const onScanErrorRef = useRef(onScanError);
    const [isManualScanOpen, setIsManualScanOpen] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const [torchOn, setTorchOn] = useState(false);
    const [torchSupported, setTorchSupported] = useState(false);
    const [code, setCode] = useState('');
    const [codeError, setCodeError] = useState(null);
    const [scanFrame, setScanFrame] = useState(null);
    const [videoReady, setVideoReady] = useState(false);

    const syncScanFrame = useCallback(() => {
        setScanFrame(measureScanFrame(rootRef.current));
    }, []);

    useEffect(() => {
        onScanSuccessRef.current = onScanSuccess;
        onScanErrorRef.current = onScanError;
    }, [onScanSuccess, onScanError]);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        syncScanFrame();
        const resizeObserver = new ResizeObserver(() => syncScanFrame());
        resizeObserver.observe(root);
        window.addEventListener('resize', syncScanFrame);
        window.addEventListener('orientationchange', syncScanFrame);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', syncScanFrame);
            window.removeEventListener('orientationchange', syncScanFrame);
        };
    }, [syncScanFrame]);

    useEffect(() => {
        let cancelled = false;
        let timerId = null;
        const onApple = isAppleTouchDevice();

        const stopStream = () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        };

        const detectTorch = (stream) => {
            try {
                const track = stream.getVideoTracks?.()?.[0];
                const caps = track?.getCapabilities?.();
                setTorchSupported(Boolean(caps && 'torch' in caps));
            } catch {
                setTorchSupported(false);
            }
        };

        const openCamera = async () => {
            if (!navigator.mediaDevices?.getUserMedia) {
                throw new Error('Caméra non supportée');
            }

            const lastCameraId = onApple ? null : localStorage.getItem(CAMERA_ID_KEY);
            const attempts = [];
            if (lastCameraId) {
                attempts.push({ video: { deviceId: { exact: lastCameraId } }, audio: false });
                attempts.push({ video: { deviceId: { ideal: lastCameraId } }, audio: false });
            }
            attempts.push({ video: { facingMode: { exact: 'environment' } }, audio: false });
            attempts.push({ video: { facingMode: { ideal: 'environment' } }, audio: false });
            attempts.push({ video: true, audio: false });

            let lastError = null;
            for (const constraints of attempts) {
                try {
                    return await navigator.mediaDevices.getUserMedia(constraints);
                } catch (error) {
                    lastError = error;
                }
            }
            throw lastError || new Error('Impossible d\'accéder à la caméra');
        };

        const waitForVideoReady = (video) => new Promise((resolve) => {
            let settled = false;
            const cleanup = () => {
                video.removeEventListener('loadedmetadata', onReady);
                video.removeEventListener('loadeddata', onReady);
                video.removeEventListener('playing', onReady);
            };
            const finish = () => {
                if (settled || cancelled) return;
                if (!video.videoWidth || !video.videoHeight) return;
                settled = true;
                cleanup();
                window.setTimeout(resolve, onApple ? 180 : 80);
            };
            const onReady = () => {
                requestAnimationFrame(() => requestAnimationFrame(finish));
            };
            video.addEventListener('loadedmetadata', onReady);
            video.addEventListener('loadeddata', onReady);
            video.addEventListener('playing', onReady);
            if (video.readyState >= 2 && video.videoWidth) onReady();
        });

        const tick = async () => {
            if (cancelled || successLockRef.current || scanningRef.current) return;
            const video = videoRef.current;
            const detector = detectorRef.current;
            if (!video || !detector || video.readyState < 2) return;

            scanningRef.current = true;
            try {
                const value = await detector.detect(video);
                if (value && !cancelled && !successLockRef.current) {
                    successLockRef.current = true;
                    onScanSuccessRef.current?.(value);
                    return;
                }
            } catch (error) {
                onScanErrorRef.current?.(error);
            } finally {
                scanningRef.current = false;
            }
        };

        const start = async () => {
            try {
                setVideoReady(false);
                syncScanFrame();

                // Laisse finir l'anim d'ouverture de la modale avant d'attacher le flux.
                await new Promise((resolve) => window.setTimeout(resolve, 420));
                if (cancelled) return;

                const detectorPromise = createQrDetector(getScanEnginePreference());
                const stream = await openCamera();
                if (cancelled) {
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }

                streamRef.current = stream;
                const video = videoRef.current;
                if (!video) return;

                video.setAttribute('playsinline', 'true');
                video.setAttribute('webkit-playsinline', 'true');
                video.muted = true;
                video.defaultMuted = true;
                video.playsInline = true;
                video.srcObject = stream;

                const playPromise = video.play();
                const detector = await detectorPromise;
                if (cancelled) {
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }
                detectorRef.current = detector;

                await playPromise.catch(() => {});
                await waitForVideoReady(video);
                if (cancelled) return;

                const deviceId = stream.getVideoTracks?.()?.[0]?.getSettings?.()?.deviceId;
                if (deviceId && !onApple) {
                    localStorage.setItem(CAMERA_ID_KEY, deviceId);
                }

                detectTorch(stream);
                setCameraError(null);
                syncScanFrame();
                setVideoReady(true);
                timerId = window.setInterval(tick, SCAN_INTERVAL_MS);
            } catch (error) {
                if (cancelled) return;
                setVideoReady(false);
                setCameraError(
                    error?.name === 'NotAllowedError' || /permission|denied|NotAllowed/i.test(String(error))
                        ? 'Accès à la caméra refusé. Autorise la caméra dans les réglages du navigateur, puis réouvre le scanner.'
                        : (error?.message || 'Impossible d\'accéder à la caméra.')
                );
            }
        };

        start();

        return () => {
            cancelled = true;
            if (timerId) window.clearInterval(timerId);
            stopStream();
            detectorRef.current = null;
        };
    }, [syncScanFrame]);

    const toggleTorch = async () => {
        const track = streamRef.current?.getVideoTracks?.()?.[0];
        if (!track) return;
        try {
            const next = !torchOn;
            await track.applyConstraints({ advanced: [{ torch: next }] });
            setTorchOn(next);
        } catch {
            setTorchSupported(false);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const formatRegex = /^[0-9]{3}\+[0-9]{3}$/;

        if (formatRegex.test(code)) {
            onScanSuccess(code);
            setIsManualScanOpen(false);
            setCode('');
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
        return keys.map((key) => (
            <button
                type="button"
                key={key}
                onClick={() => handleButtonClick(key)}
                style={{
                    flex: '1 1 25%',
                    margin: 'auto',
                    flexGrow: 0,
                    padding: 0,
                    backgroundColor: 'white',
                    color: 'black',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '2rem',
                    pointerEvents: 'all',
                    fontWeight: 'bold',
                    boxShadow: 'rgba(67, 71, 85, 0.27) 0px 0px 0.25em, rgba(90, 125, 188, 0.05) 0px 0.25em 1em',
                }}
            >
                {key === 'effacer' ? <FaBackspace /> : key}
            </button>
        ));
    };

    const shadedBorders = scanFrame
        ? {
            borderTop: `${scanFrame.top}px solid rgba(0, 0, 0, 0.48)`,
            borderBottom: `${Math.max(0, scanFrame.containerHeight - scanFrame.top - scanFrame.height)}px solid rgba(0, 0, 0, 0.48)`,
            borderLeft: `${scanFrame.left}px solid rgba(0, 0, 0, 0.48)`,
            borderRight: `${Math.max(0, scanFrame.containerWidth - scanFrame.left - scanFrame.width)}px solid rgba(0, 0, 0, 0.48)`,
        }
        : null;

    return (
        <>
            <div ref={rootRef} style={{ position: 'relative', width: '100%', height: '100%', minHeight: 0, backgroundColor: '#000', overflow: 'hidden' }}>
                <div className="scan-video-shell" aria-hidden={!videoReady}>
                    <video
                        ref={videoRef}
                        className="scan-video"
                        muted
                        playsInline
                        disablePictureInPicture
                        style={{ opacity: videoReady ? 1 : 0 }}
                    />
                </div>
                {scanFrame && shadedBorders && (
                    <div
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            boxSizing: 'border-box',
                            pointerEvents: 'none',
                            zIndex: 2,
                            ...shadedBorders,
                        }}
                    />
                )}
                {cameraError && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', textAlign: 'center', color: 'white', backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 4 }}>
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
            <Modal isOpen={isManualScanOpen} onClose={() => setIsManualScanOpen(false)} title="Saisir code manuel">
                <form onSubmit={handleSubmit}>
                    {codeError && (
                        <div style={{ color: 'red', textAlign: 'center', margin: '1rem 0' }}>
                            {codeError}
                        </div>
                    )}
                    <input
                        type="text"
                        maxLength={7}
                        placeholder="Code"
                        style={{ padding: '1rem', width: '100%', margin: '1rem 0' }}
                        required
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.8rem' }}>
                        {renderVirtualKeyboard()}
                    </div>
                    <br />
                    <br />
                    <button type="submit" style={{ width: '100%', margin: '1rem 0' }}>Valider</button>
                </form>
            </Modal>
        </>
    );
}

export default Scan;
