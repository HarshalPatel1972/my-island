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

  const isZoomedRef = useRef(false);
  const homeStateRef = useRef({ x: 0, y: 0, scale: 1 });

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const canvas = canvasRef.current;
    const islands = gsap.utils.toArray('.island');

    if (!viewport || !canvas || islands.length === 0) return;

    // --------- CALCULATE CONTENT BOUNDS ---------
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

    // --------- INITIAL CENTER ON island-1 ---------
    const welcomeIsland = document.getElementById('island-1');

    const initialX = viewport.offsetWidth / 2 -
      (welcomeIsland.offsetLeft + welcomeIsland.offsetWidth / 2);

    const initialY = viewport.offsetHeight / 2 -
      (welcomeIsland.offsetTop + welcomeIsland.offsetHeight / 2);

    homeStateRef.current = { x: initialX, y: initialY, scale: 1 };

    // Ensure transform-origin is set for GSAP and the computed math (top-left anchor)
    gsap.set(canvas, { x: homeStateRef.current.x, y: homeStateRef.current.y, scale: 1, transformOrigin: '0 0' });

    // --------- DRAGGABLE SETUP ---------
    const draggable = Draggable.create(canvas, {
      type: 'x,y',
      bounds: bounds,
      inertia: true,
      edgeResistance: 0.9
    })[0];

    // --------- ZOOM OUT ---------
    const handleZoomOut = () => {
      if (!isZoomedRef.current) return;

      isZoomedRef.current = false;
      viewport.classList.remove('zoomed-in');

      gsap.to(canvas, {
        x: homeStateRef.current.x,
        y: homeStateRef.current.y,
        scale: 1,
        duration: 0.9,
        ease: 'power3.inOut',
        onComplete: () => draggable.enable()
      });
    };

    // --------- ZOOM IN ---------
    const handleZoomIn = (island) => {
      if (isZoomedRef.current) return;

      isZoomedRef.current = true;
      draggable.disable();
      viewport.classList.add('zoomed-in');

      // island.offsetLeft/Top are relative to the canvas top-left (we anchor transforms to 0 0)
      const islandCenterX = island.offsetLeft + island.offsetWidth / 2;
      const islandCenterY = island.offsetTop + island.offsetHeight / 2;

      const vpWidth = viewport.offsetWidth;
      const vpHeight = viewport.offsetHeight;

      // Make island occupy ~80% of the smaller viewport axis
      const paddingRatio = 0.8;
      const scaleX = (vpWidth * paddingRatio) / island.offsetWidth;
      const scaleY = (vpHeight * paddingRatio) / island.offsetHeight;
      const newScale = Math.min(scaleX, scaleY, 3); // optional max scale

      // To center island: viewportCenter - islandCenter * scale
      const newX = vpWidth / 2 - islandCenterX * newScale;
      const newY = vpHeight / 2 - islandCenterY * newScale;

      gsap.to(canvas, {
        x: newX,
        y: newY,
        scale: newScale,
        duration: 0.9,
        ease: 'power3.inOut'
      });
    };

    // --------- CLICK HANDLERS ---------
    const islandHandlers = [];

    islands.forEach(island => {
      const clickHandler = (e) => {
        e.stopPropagation(); // prevent viewport click from firing
        handleZoomIn(island);
      };

      island.addEventListener('click', clickHandler);
      islandHandlers.push({ island, clickHandler });
    });

    const viewportClick = (e) => {
      if (e.target.classList.contains('island')) return;
      handleZoomOut();
    };

    viewport.addEventListener('click', viewportClick);

    // --------- CLEANUP ---------
    return () => {
      draggable.kill();
      islandHandlers.forEach(({ island, clickHandler }) => {
        island.removeEventListener('click', clickHandler);
      });
      viewport.removeEventListener('click', viewportClick);
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
