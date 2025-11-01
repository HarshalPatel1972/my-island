// src/App.jsx

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import './App.css';

gsap.registerPlugin(Draggable);

function App() {
  const canvasRef = useRef(null);
  const viewportRef = useRef(null); // --- NEW: Create a ref for the viewport ---

  useEffect(() => {
    // We pass the viewportRef to the Draggable instance
    const draggableInstance = Draggable.create(canvasRef.current, {
      type: "x,y",
      inertia: true,
      // --- UPDATED: Define the boundaries for the drag ---
      bounds: viewportRef.current, 
      edgeResistance: 0.85, // I've increased this a bit for a more noticeable effect
    });

    return () => {
      if (draggableInstance[0]) {
        draggableInstance[0].kill();
      }
    };
  }, []);

  return (
    // --- UPDATED: Attach the new ref to the viewport div ---
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