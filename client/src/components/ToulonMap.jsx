import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { AttributionControl, Map } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const EMPTY_STYLE = {
    version: 8,
    sources: {},
    layers: [
        {
            id: 'background',
            type: 'background',
            paint: { 'background-color': '#e8e8e8' },
        },
    ],
};

function padBounds(bounds, pad = 0.002) {
    return [
        [bounds.west - pad, bounds.south - pad],
        [bounds.east + pad, bounds.north + pad],
    ];
}

const DEFAULT_ZOOM = 15;

function goHomeView(map, meta) {
    const zoom = Math.min(Math.max(DEFAULT_ZOOM, meta.minzoom), meta.maxzoom);
    const height = map.getContainer().clientHeight;
    map.easeTo({
        center: [meta.center.longitude, meta.center.latitude],
        zoom,
        duration: 600,
        padding: {
            top: 24,
            right: 24,
            bottom: Math.round(height * 0.55),
            left: 24,
        },
    });
}

const ToulonMap = forwardRef(function ToulonMap({ onUserInteract }, ref) {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const metaRef = useRef(null);
    const onUserInteractRef = useRef(onUserInteract);
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        onUserInteractRef.current = onUserInteract;
    }, [onUserInteract]);

    useImperativeHandle(ref, () => ({
        recenter() {
            const map = mapRef.current;
            const meta = metaRef.current;
            if (!map || !meta) return;
            goHomeView(map, meta);
        },
        zoomIn() {
            mapRef.current?.zoomIn({ duration: 200 });
        },
        zoomOut() {
            mapRef.current?.zoomOut({ duration: 200 });
        },
    }), []);

    useEffect(() => {
        let cancelled = false;
        let map = null;
        let resizeObserver = null;

        const onWindowResize = () => {
            map?.resize();
        };

        const notifyUserInteract = (event) => {
            if (event && event.originalEvent == null) return;
            onUserInteractRef.current?.();
        };

        async function init() {
            try {
                const response = await fetch('/map/metadata.json');
                if (!response.ok) {
                    throw new Error('Métadonnées carte introuvables');
                }
                const meta = await response.json();
                if (cancelled || !containerRef.current) return;

                metaRef.current = meta;

                map = new Map({
                    container: containerRef.current,
                    style: EMPTY_STYLE,
                    center: [meta.center.longitude, meta.center.latitude],
                    zoom: Math.min(Math.max(DEFAULT_ZOOM, meta.minzoom), meta.maxzoom),
                    minZoom: meta.minzoom,
                    maxZoom: meta.maxzoom,
                    maxBounds: padBounds(meta.bounds),
                    attributionControl: false,
                    dragRotate: false,
                    pitchWithRotate: false,
                });

                map.addControl(new AttributionControl({ compact: true }), 'bottom-right');

                map.on('dragstart', notifyUserInteract);
                map.on('zoomstart', notifyUserInteract);
                map.on('rotatestart', notifyUserInteract);
                map.on('pitchstart', notifyUserInteract);
                map.on('boxzoomstart', notifyUserInteract);

                map.on('load', () => {
                    if (cancelled) return;
                    map.addSource('toulon', {
                        type: 'raster',
                        tiles: ['/map/{z}/{x}/{y}.png'],
                        tileSize: meta.tileSize || 256,
                        minzoom: meta.minzoom,
                        maxzoom: meta.maxzoom,
                        attribution: meta.attribution || '',
                    });
                    map.addLayer({
                        id: 'toulon-raster',
                        type: 'raster',
                        source: 'toulon',
                    });
                    goHomeView(map, meta);
                    setStatus('ready');
                });

                mapRef.current = map;

                window.addEventListener('resize', onWindowResize);
                resizeObserver = new ResizeObserver(() => {
                    map?.resize();
                });
                resizeObserver.observe(containerRef.current);
            } catch {
                if (!cancelled) {
                    setStatus('error');
                }
            }
        }

        init();

        return () => {
            cancelled = true;
            window.removeEventListener('resize', onWindowResize);
            resizeObserver?.disconnect();
            if (map) {
                map.remove();
            }
            mapRef.current = null;
            metaRef.current = null;
        };
    }, []);

    if (status === 'error') {
        return (
            <div className="toulon-map toulon-map--fallback" aria-label="Plan du réseau">
                <img
                    className="toulon-map__fallback"
                    src="/elements/images/plan.webp"
                    alt="Plan du réseau"
                />
            </div>
        );
    }

    return (
        <div className="toulon-map" aria-label="Carte de Toulon">
            <div ref={containerRef} className="toulon-map__canvas" />
        </div>
    );
});

export default ToulonMap;
