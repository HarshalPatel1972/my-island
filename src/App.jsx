// src/App.jsx

import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import './App.css';

import ProjectIsland from './components/ProjectIsland';
import ProjectDetail from './components/ProjectDetail';

gsap.registerPlugin(Draggable, InertiaPlugin);

// ⭐ PROJECT DATA (added description field)
const projectsData = [
  {
    id: "project-1",
    title: "AI Research Portal",
    imageSrc: "https://picsum.photos/seed/ai123/400/300",
    position: { top: "2100px", left: "1900px" },
    description:
      "AI Research Portal centralizes machine learning models, datasets, and research papers into an interactive environment."
  },
  {
    id: "project-2",
    title: "Blockchain Health System",
    imageSrc: "https://picsum.photos/seed/blockchain456/400/300",
    position: { top: "2750px", left: "2200px" },
    description:
      "A decentralized medical records system designed using blockchain for secure storage and transparent verification."
  },
  {
    id: "project-3",
    title: "Portfolio Universe",
    imageSrc: "https://picsum.photos/seed/portfolio789/400/300",
    position: { top: "2300px", left: "2800px" },
    description:
      "An immersive, interactive 3D portfolio world that showcases projects as floating islands."
  }
];

function App() {
  const canvasRef = useRef(null);
  const viewportRef = useRef(null);

  // ⭐ NEW: state for selected project detail view
  const [selectedProject, setSelectedProject] = useState(null);

  const isZoomedRef = useRef(false);
  const homeStateRef = useRef({ x: 0, y: 0, scale: 1 });

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const canvas = canvasRef.current;

    const islands = gsap.utils.toArray('.island');

    if (!viewport || !canvas || islands.length === 0) return;

    // --------- BOUNDARY CALC ---------
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

    const initialX = viewport.offsetWidth / 2 -
      (welcomeIsland.offsetLeft + welcomeIsland.offsetWidth / 2);

    const initialY = viewport.offsetHeight / 2 -
      (welcomeIsland.offsetTop + welcomeIsland.offsetHeight / 2);

    homeStateRef.current = { x: initialX, y: initialY, scale: 1 };

    gsap.set(canvas, { 
      x: homeStateRef.current.x,
      y: homeStateRef.current.y,
      scale: 1,
      transformOrigin: "0 0"
    });

    const draggable = Draggable.create(canvas, {
      type: "x,y",
      bounds: bounds,
      inertia: true,
      edgeResistance: 0.9
    })[0];

    // --------- ZOOM OUT ---------
    const handleZoomOut = () => {
      setSelectedProject(null); // ⭐ new: hide detail view

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
    const handleZoomIn = (islandElement, projectData) => {
      if (isZoomedRef.current) return;

      isZoomedRef.current = true;
      draggable.disable();
      viewport.classList.add('zoomed-in');

      const islandCenterX = islandElement.offsetLeft + islandElement.offsetWidth / 2;
      const islandCenterY = islandElement.offsetTop + islandElement.offsetHeight / 2;

      const vpWidth = viewport.offsetWidth;
      const vpHeight = viewport.offsetHeight;

      const paddingRatio = 0.8;
      const scaleX = (vpWidth * paddingRatio) / islandElement.offsetWidth;
      const scaleY = (vpHeight * paddingRatio) / islandElement.offsetHeight;
      const newScale = Math.min(scaleX, scaleY, 3);

      const newX = vpWidth / 2 - islandCenterX * newScale;
      const newY = vpHeight / 2 - islandCenterY * newScale;

      gsap.to(canvas, {
        x: newX,
        y: newY,
        scale: newScale,
        duration: 0.9,
        ease: 'power3.inOut',
        onComplete: () => {
          setSelectedProject(projectData); // ⭐ open project detail
        }
      });
    };

    // --------- CLICK HANDLERS ---------
    const islandHandlers = [];

    islands.forEach(island => {
      // find project data for this island
      const projectData = projectsData.find(p => p.id === island.id);

      const clickHandler = (e) => {
        e.stopPropagation();
        if (projectData) {
          handleZoomIn(island, projectData);
        }
      };

      island.addEventListener('click', clickHandler);
      islandHandlers.push({ island, clickHandler });
    });

    const viewportClick = (e) => {
      if (e.target.classList.contains('island')) return;
      handleZoomOut();
    };

    viewport.addEventListener('click', viewportClick);

    return () => {
      draggable.kill();
      islandHandlers.forEach(({ island, clickHandler }) => {
        island.removeEventListener('click', clickHandler);
      });
      viewport.removeEventListener('click', viewportClick);
    };

  }, []);

  return (
    <>
      <div className="viewport" ref={viewportRef}>
        <div className="canvas" ref={canvasRef}>
          
          {/* ORIGINAL WELCOME ISLAND */}
          <div className="island" id="island-1" style={{ top: "2400px", left: "2350px" }}>
            Welcome
          </div>

          {/* PROJECT ISLANDS */}
          {projectsData.map((project) => (
            <ProjectIsland
              key={project.id}
              id={project.id}
              project={project}
            />
          ))}
        </div>
      </div>

      {/* ⭐ DETAIL VIEW OVERLAY */}
      {selectedProject && (
        <ProjectDetail 
          project={selectedProject} 
          onClose={() => {
            const viewport = viewportRef.current;
            viewport.click(); // triggers zoomOut logic
          }}
        />
      )}
    </>
  );
}

export default App;
