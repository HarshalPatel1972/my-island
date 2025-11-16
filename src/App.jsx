// src/App.jsx

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';   // ✅ Added this line
import './App.css';

gsap.registerPlugin(Draggable, InertiaPlugin);        // ✅ Register both plugins

function App() {
  const canvasRef = useRef(null);
  const viewportRef = useRef(null);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const canvas = canvasRef.current;
    const islands = gsap.utils.toArray('.island');

    if (!viewport || !canvas || islands.length === 0) return;

    // --- Calculate content bounds ---
    let contentBounds = {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity
    };

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

    // --- Center on island-1 ---
    const welcomeIsland = document.getElementById('island-1');
    const initialX =
      viewport.offsetWidth / 2 -
      (welcomeIsland.offsetLeft + welcomeIsland.offsetWidth / 2);

    const initialY =
      viewport.offsetHeight / 2 -
      (welcomeIsland.offsetTop + welcomeIsland.offsetHeight / 2);

    gsap.set(canvas, { x: initialX, y: initialY });

    // --- Draggable with inertia ---
    const draggableInstance = Draggable.create(canvas, {
      type: "x,y",
      bounds: bounds,
      inertia: true,          // ✅ Now works
      edgeResistance: 0.9,
      force3D: true           // GPU acceleration
    });

    return () => {
      if (draggableInstance[0]) draggableInstance[0].kill();
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
