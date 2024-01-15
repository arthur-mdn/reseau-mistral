import React, { useEffect } from 'react';

function ControlTouch() {
    useEffect(() => {
        const container = document.getElementById('container');
        const parentContainer = document.getElementById('parent-container');

        let totalContainerWidth, totalContainerHeight;

        function updateContainerDimensions() {
            const containerRect = container.getBoundingClientRect();
            totalContainerWidth = containerRect.width;
            totalContainerHeight = containerRect.height;
            recenterContainer();
        }

        function setPosition(x, y) {
            container.style.left = `${x - totalContainerWidth / 2}px`;
            container.style.top = `${y - totalContainerHeight / 2}px`;
        }

        function onMouseDown(event) {
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }

        function onMouseMove(event) {
            setPosition(event.clientX, event.clientY);
            container.classList.add('accelerated');
        }

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            container.classList.add('smooth-transition');
            setTimeout(() => {
                container.classList.remove('smooth-transition');
            }, 400);
            container.classList.remove('accelerated');
            recenterContainer();
        }

        function onTouchStart(event) {
            event.preventDefault();
            document.addEventListener('touchmove', onTouchMove, { passive: false });
            document.addEventListener('touchend', onTouchEnd, { passive: false });
        }

        function onTouchMove(event) {
            const touch = event.touches[0];
            setPosition(touch.clientX, touch.clientY);
            container.classList.add('accelerated');
        }

        function onTouchEnd() {
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);
            container.classList.add('smooth-transition');
            setTimeout(() => {
                container.classList.remove('smooth-transition');
            }, 400);
            container.classList.remove('accelerated');
            recenterContainer();
        }

        function recenterContainer() {
            const parentContainerRect = parentContainer.getBoundingClientRect();
            const centerX = parentContainerRect.width / 2;
            const centerY = parentContainerRect.height / 3;
            setPosition(centerX, centerY);
        }

        updateContainerDimensions();
        parentContainer.addEventListener('mousedown', onMouseDown);
        parentContainer.addEventListener('touchstart', onTouchStart, { passive: false });
        window.addEventListener('resize', updateContainerDimensions);

        return () => {
            parentContainer.removeEventListener('mousedown', onMouseDown);
            parentContainer.removeEventListener('touchstart', onTouchStart);
            window.removeEventListener('resize', updateContainerDimensions);
        };
    }, []);

    return (
        <div id="parent-container">
            <div id="container" className="">
                <div className="spinner initial">
                    <div className="circle green"></div>
                    <div className="circle red"></div>
                </div>
            </div>
        </div>
    );
}

export default ControlTouch;
