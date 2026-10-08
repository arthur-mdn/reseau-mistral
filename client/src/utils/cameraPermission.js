export const CAMERA_ID_KEY = 'rm-last-camera-id';

export async function requestCameraPermission() {
    if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Caméra non supportée');
    }

    const lastCameraId = localStorage.getItem(CAMERA_ID_KEY);
    const constraints = {
        audio: false,
        video: lastCameraId
            ? { deviceId: { ideal: lastCameraId } }
            : { facingMode: { ideal: 'environment' } },
    };

    let stream;
    try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch {
        stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: { facingMode: { ideal: 'environment' } },
        });
    }

    const deviceId = stream.getVideoTracks()?.[0]?.getSettings?.()?.deviceId;
    if (deviceId) {
        localStorage.setItem(CAMERA_ID_KEY, deviceId);
    }

    stream.getTracks().forEach((track) => track.stop());
}
