import React, { useRef, useState } from 'react';

const THRESHOLD = 64;
const MAX_PULL = 96;

function PullToRefresh({ children, className = '', style }) {
    const scrollerRef = useRef(null);
    const startYRef = useRef(0);
    const pullingRef = useRef(false);
    const [pull, setPull] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    const onTouchStart = (event) => {
        if (refreshing) return;
        const scroller = scrollerRef.current;
        if (!scroller || scroller.scrollTop > 0) return;
        startYRef.current = event.touches[0].clientY;
        pullingRef.current = true;
    };

    const onTouchMove = (event) => {
        if (!pullingRef.current || refreshing) return;
        const scroller = scrollerRef.current;
        if (!scroller || scroller.scrollTop > 0) {
            pullingRef.current = false;
            setPull(0);
            return;
        }
        const delta = event.touches[0].clientY - startYRef.current;
        if (delta <= 0) {
            setPull(0);
            return;
        }
        const next = Math.min(MAX_PULL, delta * 0.45);
        setPull(next);
        if (next > 8) {
            event.preventDefault();
        }
    };

    const onTouchEnd = () => {
        if (!pullingRef.current) return;
        pullingRef.current = false;
        if (pull >= THRESHOLD) {
            setRefreshing(true);
            setPull(THRESHOLD * 0.7);
            window.setTimeout(() => {
                setRefreshing(false);
                setPull(0);
            }, 850);
            return;
        }
        setPull(0);
    };

    return (
        <div
            ref={scrollerRef}
            className={className}
            style={{
                ...style,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                overscrollBehaviorY: 'contain',
                position: 'relative',
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onTouchCancel={onTouchEnd}
        >
            <div
                aria-hidden="true"
                className="pull-to-refresh-indicator"
                style={{
                    height: pull || (refreshing ? 48 : 0),
                    opacity: pull > 8 || refreshing ? 1 : 0,
                }}
            >
                <div className={`pull-to-refresh-spinner${refreshing ? ' is-spinning' : ''}`} />
            </div>
            {children}
        </div>
    );
}

export default PullToRefresh;
