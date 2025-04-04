import React, { useState, useCallback, useRef, useEffect } from 'react';
import { BlueprintBackground } from './styles/BlueprintBackground';
import Maze from './Maze';
import Sidebar from './Sidebar';

const Homepage = () => {
  const [zoom, setZoom] = useState(1);
  const [wallDensity, setWallDensity] = useState(70);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [showCollisionSpheres, setShowCollisionSpheres] = useState(false);
  const frameRef = useRef();
  const prevTimeRef = useRef(0);

  const handleWheel = useCallback((event) => {
    event.preventDefault();
    const zoomFactor = event.deltaY > 0 ? 0.95 : 1.05;

    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = requestAnimationFrame((timestamp) => {
      // Throttle to 60fps
      if (timestamp - prevTimeRef.current > 16) {
        setZoom(prevZoom => {
          const newZoom = prevZoom * zoomFactor;
          return Math.min(Math.max(newZoom, 0.1), 5);
        });
        prevTimeRef.current = timestamp;
      }
    });
  }, []);

  const handleCenterMap = useCallback(() => {
    console.log("Centering map");
    setPanPosition({ x: 0, y: 0 });
    
    // Dispatch custom event to notify Maze component
    window.dispatchEvent(
      new CustomEvent('centerMap', { 
        detail: { x: 0, y: 0 }
      })
    );
  }, []); // Remove panPosition from the log to avoid the dependency

  const handleToggleCollisionSpheres = useCallback(() => {
    setShowCollisionSpheres(prev => !prev);
  }, []);

  // Set a more reasonable threshold - 5 might be too small
  const isMapCentered = Math.abs(panPosition.x) < 10 && Math.abs(panPosition.y) < 10;

  // Add a useEffect to log position changes
  useEffect(() => {
    console.log("Pan position updated:", panPosition, "Is centered:", isMapCentered);
  }, [panPosition, isMapCentered]);

  // Cleanup animation frame on unmount
  React.useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <BlueprintBackground 
      zoom={zoom} 
      panX={panPosition.x} 
      panY={panPosition.y} 
      onWheel={handleWheel}
    >
      <Maze 
        zoom={zoom} 
        wallDensity={wallDensity}
        onPanChange={setPanPosition}
        showCollisionSpheres={showCollisionSpheres}
      />
      <Sidebar
        zoom={zoom}
        onZoomChange={setZoom}
        wallDensity={wallDensity}
        onWallDensityChange={setWallDensity}
        onCenterMap={handleCenterMap}
        isMapCentered={isMapCentered}
        showCollisionSpheres={showCollisionSpheres}
        onToggleCollisionSpheres={handleToggleCollisionSpheres}
      />
    </BlueprintBackground>
  );
};

export default Homepage;