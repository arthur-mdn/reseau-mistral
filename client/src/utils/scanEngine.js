export const SCAN_ENGINE_STORAGE_KEY = 'rm-scan-engine';
export const SCAN_ENGINES = {
    AUTO: 'auto',
    NATIVE: 'native',
    ZXING: 'zxing',
};

const VALID_ENGINES = new Set(Object.values(SCAN_ENGINES));

export function getScanEnginePreference() {
    try {
        const value = localStorage.getItem(SCAN_ENGINE_STORAGE_KEY);
        if (VALID_ENGINES.has(value)) return value;
    } catch {
        /* ignore */
    }
    return SCAN_ENGINES.AUTO;
}

export function setScanEnginePreference(engine) {
    const next = VALID_ENGINES.has(engine) ? engine : SCAN_ENGINES.AUTO;
    try {
        localStorage.setItem(SCAN_ENGINE_STORAGE_KEY, next);
    } catch {
        /* ignore */
    }
    return next;
}

export async function isNativeBarcodeSupported() {
    if (typeof window === 'undefined' || typeof window.BarcodeDetector !== 'function') {
        return false;
    }
    try {
        if (typeof window.BarcodeDetector.getSupportedFormats === 'function') {
            const formats = await window.BarcodeDetector.getSupportedFormats();
            return formats.includes('qr_code');
        }
        return true;
    } catch {
        return false;
    }
}

let zxingReadyPromise = null;

async function ensureZxingReady() {
    if (!zxingReadyPromise) {
        zxingReadyPromise = (async () => {
            const [{ prepareZXingModule }, wasmModule] = await Promise.all([
                import('zxing-wasm/reader'),
                import('zxing-wasm/reader/zxing_reader.wasm?url'),
            ]);
            const wasmUrl = wasmModule.default;
            await prepareZXingModule({
                overrides: {
                    locateFile: (path, prefix) => {
                        if (path.endsWith('.wasm')) return wasmUrl;
                        return `${prefix}${path}`;
                    },
                },
            });
            return import('zxing-wasm/reader');
        })();
    }
    return zxingReadyPromise;
}

export async function createQrDetector(preferredEngine = getScanEnginePreference()) {
    const preference = VALID_ENGINES.has(preferredEngine) ? preferredEngine : SCAN_ENGINES.AUTO;
    const nativeOk = await isNativeBarcodeSupported();

    const useNative = preference === SCAN_ENGINES.NATIVE
        || (preference === SCAN_ENGINES.AUTO && nativeOk);

    if (preference === SCAN_ENGINES.NATIVE && !nativeOk) {
        throw new Error('BarcodeDetector non disponible sur cet appareil');
    }

    if (useNative && nativeOk) {
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        return {
            engine: SCAN_ENGINES.NATIVE,
            async detect(video) {
                const codes = await detector.detect(video);
                return codes?.[0]?.rawValue || null;
            },
        };
    }

    const { readBarcodes } = await ensureZxingReady();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    return {
        engine: SCAN_ENGINES.ZXING,
        async detect(video) {
            if (!video?.videoWidth || !video?.videoHeight || !ctx) return null;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const results = await readBarcodes(imageData, {
                tryHarder: true,
                formats: ['QRCode'],
                maxNumberOfSymbols: 1,
            });
            return results?.[0]?.text || null;
        },
    };
}
