import { CAMERA_ID_KEY } from './cameraPermission.js';

export function buildCameraAttempts({ lastCameraId = null, preferEnvironment = true } = {}) {
    const attempts = [];
    const baseVideo = {
        width: { ideal: 1280 },
        height: { ideal: 720 },
    };

    if (lastCameraId) {
        attempts.push({ video: { ...baseVideo, deviceId: { exact: lastCameraId } }, audio: false });
        attempts.push({ video: { ...baseVideo, deviceId: { ideal: lastCameraId } }, audio: false });
    }

    if (preferEnvironment) {
        attempts.push({ video: { ...baseVideo, facingMode: { ideal: 'environment' } }, audio: false });
        attempts.push({ video: { facingMode: { ideal: 'environment' } }, audio: false });
    }

    attempts.push({ video: true, audio: false });
    return attempts;
}

export async function openCameraStream({
    getUserMedia,
    lastCameraId = null,
    skipDeviceId = false,
} = {}) {
    const media = getUserMedia || navigator.mediaDevices?.getUserMedia?.bind(navigator.mediaDevices);
    if (!media) {
        throw new Error('Caméra non supportée');
    }

    const attempts = buildCameraAttempts({
        lastCameraId: skipDeviceId ? null : lastCameraId,
    });

    let lastError = null;
    for (const constraints of attempts) {
        try {
            return await media(constraints);
        } catch (error) {
            lastError = error;
        }
    }
    throw lastError || new Error('Impossible d\'accéder à la caméra');
}

export async function attachStreamToVideo(video, stream, { play = true } = {}) {
    if (!video) {
        throw new Error('Élément vidéo manquant');
    }

    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');
    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;

    if (play && typeof video.play === 'function') {
        await video.play().catch(() => {});
    }

    return video;
}

/**
 * Opens the camera immediately, without waiting for the QR detector.
 * Detector init runs in parallel and is returned separately.
 */
export async function startCameraSession({
    openCamera,
    createDetector,
    attachStream,
    onCameraReady,
    onDetectorReady,
    onError,
}) {
    const cameraPromise = openCamera();
    const detectorPromise = Promise.resolve().then(() => createDetector());

    try {
        const stream = await cameraPromise;
        await attachStream(stream);
        onCameraReady?.(stream);

        try {
            const detector = await detectorPromise;
            onDetectorReady?.(detector);
            return { stream, detector };
        } catch (detectorError) {
            onError?.(detectorError);
            return { stream, detector: null, detectorError };
        }
    } catch (cameraError) {
        detectorPromise.catch(() => {});
        onError?.(cameraError);
        throw cameraError;
    }
}

export function rememberCameraDeviceId(stream, { enabled = true, storageKey = CAMERA_ID_KEY } = {}) {
    if (!enabled || !stream) return null;
    const deviceId = stream.getVideoTracks?.()?.[0]?.getSettings?.()?.deviceId || null;
    if (deviceId) {
        try {
            localStorage.setItem(storageKey, deviceId);
        } catch {
            /* ignore */
        }
    }
    return deviceId;
}
