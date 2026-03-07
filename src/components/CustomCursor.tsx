'use client';

import { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
    const cursorRef = useRef<HTMLDivElement>(null);
    const [isHovering, setIsHovering] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(true); // Default true to avoid flash on mobile

    useEffect(() => {
        // Detect touch device
        const checkTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        setIsTouchDevice(checkTouch);

        if (checkTouch) return;

        // Hide default cursor on body
        document.body.style.cursor = 'none';

        const onMouseMove = (e: MouseEvent) => {
            if (cursorRef.current) {
                // Use transform for performant smooth movement
                cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
            }
        };

        const onMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // Because standard DOM elements use CSS cursor: pointer, we can check computed style 
            // AND check for ThreeJS pointer changes we made to body.style.cursor in Tower.tsx
            const isInteractive =
                window.getComputedStyle(target).cursor === 'pointer' ||
                target.tagName.toLowerCase() === 'a' ||
                target.tagName.toLowerCase() === 'button' ||
                document.body.style.cursor === 'pointer';

            if (isInteractive) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        // We also need a mutation observer to catch when React Three Fiber changes body cursor style
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'style') {
                    if (document.body.style.cursor === 'pointer') {
                        setIsHovering(true);
                    } else if (document.body.style.cursor === 'auto' || document.body.style.cursor === 'none') {
                        setIsHovering(false);
                    }
                }
            });
        });

        observer.observe(document.body, { attributes: true });

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseover', onMouseOver, true); // Use capture phase

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseover', onMouseOver, true);
            observer.disconnect();
            document.body.style.cursor = ''; // Reset on unmount
        };
    }, []);

    if (isTouchDevice) return null;

    return (
        <div
            ref={cursorRef}
            className={`custom-cursor ${isHovering ? 'hovering' : ''}`}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#d4af37',
                pointerEvents: 'none',
                zIndex: 9999,
                mixBlendMode: 'difference',
                transition: 'width 0.2s, height 0.2s, background-color 0.2s',
                transform: 'translate(-50%, -50%)' // initial state, updated by JS
            }}
        />
    );
}
