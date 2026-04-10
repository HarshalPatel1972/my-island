// src/components/BackgroundElements.jsx
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const BackgroundElements = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const bubbles = gsap.utils.toArray('.bubble');
        
        bubbles.forEach((bubble) => {
            // Randomize duration and delayed start
            const duration = 15 + Math.random() * 20;
            const delay = -Math.random() * 20;

            gsap.to(bubble, {
                y: '-200vh',
                x: '+=100',
                rotation: 360,
                duration: duration,
                delay: delay,
                repeat: -1,
                ease: 'none',
                opacity: 0.1,
            });
        });
    }, []);

    const bubbleData = Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        size: 50 + Math.random() * 150,
        left: `${Math.random() * 100}%`,
        bottom: '-10%',
        opacity: 0.05 + Math.random() * 0.1,
    }));

    return (
        <div className="background-container" ref={containerRef}>
            {bubbleData.map((b) => (
                <div
                    key={b.id}
                    className="bubble"
                    style={{
                        width: b.size,
                        height: b.size,
                        left: b.left,
                        bottom: b.bottom,
                        opacity: b.opacity,
                    }}
                />
            ))}
        </div>
    );
};

export default BackgroundElements;
