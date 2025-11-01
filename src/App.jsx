// src/App.jsx

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import './App.css';

gsap.registerPlugin(Draggable, InertiaPlugin);

function App() {
  const canvasRef = useRef(null);
  const viewportRef = useRef(null);
  const scaleRef = useRef(1); // ✅ NEW: Ref to track the current scale

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const canvas = canvasRef.current;
    // ... (the bounds calculation and centering code remains the same) ...
    
    // Previous code for bounds and initial centering
    const islands = gsap.utils.toArray('.island');
    if (!viewport || !canvas || islands.length === 0) return;
    let contentBounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    islands.forEach(island => {
      contentBounds.minX = Math.min(contentBounds.minX, island.offsetLeft);
      contentBounds.minY = Math.min(contentBounds.minY, island.offsetTop);
      contentBounds.maxX = Math.max(contentBounds.maxX, island.offsetLeft + island.offsetWidth);
      contentBounds.maxY = Math.max(contentBounds.maxY, island.offsetTop + island.offsetHeight);
    });
    const padding = 100;
    const bounds = {
      minX: viewport.offsetWidth - contentBounds.maxX - padding,
      maxX: -contentBounds.minX + padding,
      minY: viewport.offsetHeight - contentBounds.maxY - padding,
      maxY: -contentBounds.minY + padding
    };
    const welcomeIsland = document.getElementById('island-1');
    const initialX = viewport.offsetWidth / 2 - (welcomeIsland.offsetLeft + welcomeIsland.offsetWidth / 2);
    const initialY = viewport.offsetHeight / 2 - (welcomeIsland.offsetTop + welcomeIsland.offsetHeight / 2);
    gsap.set(canvas, { x: initialX, y: initialY });
    
    const draggableInstance = Draggable.create(canvas, {
      type: "x,y",
      bounds: bounds,
      inertia: true,
      edgeResistance: 0.9,
      force3D: true
    });

    // --- ✅ NEW ZOOM LOGIC ---
    const handleWheel = (e) => {
      e.preventDefault(); // Prevent page from scrolling

      const zoomFactor = 1.2;
      let newScale = scaleRef.current;

      if (e.deltaY < 0) { // Scrolling up -> Zoom In
        newScale *= zoomFactor;
      } else { // Scrolling down -> Zoom Out
        newScale /= zoomFactor;
      }
      
      scaleRef.current = newScale;

      // Animate the scale with GSAP for a smooth effect
      gsap.to(canvas, {
        scale: newScale,
        duration: 0.5,
        ease: 'power2.out'
      });
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    // --- END OF NEW ZOOM LOGIC ---

    // Updated cleanup function
    return () => {
      if (draggableInstance[0]) draggableInstance[0].kill();
      viewport.removeEventListener('wheel', handleWheel); // ✅ NEW: Clean up the event listener
    };
  }, []);

  return (
    <div className="viewport" ref={viewportRef}>
      <div className="canvas" ref={canvasRef}>
        <div className="island" id="island-1">Welcome</div>
        <div className="island" id="island-2">Project 1</div>
        <div className="island" id="island-3">About</div>
        <div className="island" id="island-4">Contact</div>
      </div>
    </div>
  );
}

export default App;