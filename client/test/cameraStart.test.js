import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
    buildCameraAttempts,
    attachStreamToVideo,
    startCameraSession,
    rememberCameraDeviceId,
} from '../src/utils/cameraStart.js';

describe('cameraStart', () => {
    it('builds fallback camera constraint attempts', () => {
        const withId = buildCameraAttempts({ lastCameraId: 'cam-1' });
        assert.ok(withId.length >= 4);
        assert.equal(withId[0].video.deviceId.exact, 'cam-1');
        assert.equal(withId.at(-1).video, true);

        const withoutId = buildCameraAttempts({ lastCameraId: null });
        assert.equal(withoutId.some((item) => item.video?.deviceId), false);
        assert.ok(withoutId.some((item) => item.video?.facingMode?.ideal === 'environment'));
    });

    it('attaches stream and plays without waiting for metadata', async () => {
        const events = [];
        const video = {
            muted: false,
            playsInline: false,
            srcObject: null,
            setAttribute(name, value) {
                events.push(['attr', name, value]);
            },
            async play() {
                events.push(['play']);
            },
        };
        const stream = { id: 'stream-1' };

        await attachStreamToVideo(video, stream);

        assert.equal(video.srcObject, stream);
        assert.equal(video.muted, true);
        assert.equal(video.playsInline, true);
        assert.deepEqual(events, [
            ['attr', 'playsinline', 'true'],
            ['attr', 'webkit-playsinline', 'true'],
            ['play'],
        ]);
    });

    it('opens camera without waiting for detector readiness', async () => {
        const order = [];
        let releaseDetector;
        let cameraReadyResolve;
        const cameraReadyPromise = new Promise((resolve) => {
            cameraReadyResolve = resolve;
        });
        const detectorPromise = new Promise((resolve) => {
            releaseDetector = () => {
                order.push('detector-ready');
                resolve({ engine: 'zxing' });
            };
        });

        const stream = {
            id: 'stream',
            getVideoTracks: () => [{ getSettings: () => ({ deviceId: 'abc' }) }],
        };

        const sessionPromise = startCameraSession({
            openCamera: async () => {
                order.push('camera-open');
                return stream;
            },
            createDetector: () => detectorPromise,
            attachStream: async () => {
                order.push('camera-attached');
            },
            onCameraReady: () => {
                order.push('camera-ready');
                cameraReadyResolve();
            },
            onDetectorReady: () => {
                order.push('detector-callback');
            },
        });

        await cameraReadyPromise;
        assert.ok(order.includes('camera-open'));
        assert.ok(order.includes('camera-attached'));
        assert.ok(order.includes('camera-ready'));
        assert.equal(order.includes('detector-ready'), false);

        releaseDetector();
        const result = await sessionPromise;

        assert.equal(result.stream, stream);
        assert.equal(result.detector.engine, 'zxing');
        assert.deepEqual(order, [
            'camera-open',
            'camera-attached',
            'camera-ready',
            'detector-ready',
            'detector-callback',
        ]);
    });

    it('still exposes the stream if detector fails after camera opened', async () => {
        const stream = { id: 'stream' };
        const result = await startCameraSession({
            openCamera: async () => stream,
            createDetector: async () => {
                throw new Error('detector down');
            },
            attachStream: async () => {},
        });

        assert.equal(result.stream, stream);
        assert.equal(result.detector, null);
        assert.match(result.detectorError.message, /detector down/);
    });

    it('remembers device id only when enabled', () => {
        const store = new Map();
        const original = globalThis.localStorage;
        globalThis.localStorage = {
            setItem(key, value) {
                store.set(key, value);
            },
            getItem(key) {
                return store.get(key) ?? null;
            },
        };

        const stream = {
            getVideoTracks: () => [{ getSettings: () => ({ deviceId: 'device-9' }) }],
        };

        assert.equal(rememberCameraDeviceId(stream, { enabled: false }), null);
        assert.equal(store.size, 0);

        assert.equal(rememberCameraDeviceId(stream, { enabled: true }), 'device-9');
        assert.equal(store.get('rm-last-camera-id'), 'device-9');

        globalThis.localStorage = original;
    });
});
