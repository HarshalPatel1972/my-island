// src/App.jsx

import { useRef, useEffect } from 'react'; // Import React hooks
import gsap from 'gsap';                    // Import GSAP
import { Draggable } from 'gsap/Draggable'; // Import the Draggable plugin
import './App.css';

// Register the Draggable plugin with GSAP
gsap.registerPlugin(Draggable);

function App() {
  // Create a ref to attach to our canvas element
  const canvasRef = useRef(null);

  // This useEffect hook will run once, after the component mounts
  useEffect(() => {
    // We target the ref's "current" property, which is the actual DOM element
    const draggableInstance = Draggable.create(canvasRef.current, {
      type: "x,y", // Allows dragging on both the x and y axis
    });

    // This is a cleanup function. It runs when the component unmounts.
    // It's a best practice to kill GSAP instances to prevent memory leaks.
    return () => {
      if (draggableInstance[0]) {
        draggableInstance[0].kill();
      }
    };
  }, []); // The empty array [] means this effect runs only on mount and unmount

  return (
    <div className="viewport">
      {/* Attach the ref to the canvas div */}
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