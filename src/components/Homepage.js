import React, { useState, useCallback } from 'react';
import { BlueprintBackground } from './styles/BlueprintBackground';
import Maze from './Maze';
import Slider from '@mui/material/Slider';

const Homepage = () => {
  const [zoom, setZoom] = useState(1);
  const [wallDensity, setWallDensity] = useState(70); // 70% walls by default
  const isZoomed = zoom !== 1;

  const handleWheel = useCallback((event) => {
    event.preventDefault();
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prevZoom => {
      const newZoom = prevZoom * zoomFactor;
      return Math.min(Math.max(newZoom, 0.1), 5);
    });
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
  }, []);

  return (
    <BlueprintBackground zoom={zoom} onWheel={handleWheel}>
      <Maze zoom={zoom} wallDensity={wallDensity} />
      <div style={{ 
        position: 'fixed', 
        top: 20, 
        right: 20,
        display: 'flex',
        gap: '20px',
        alignItems: 'center'
      }}>
        {isZoomed && (
          <div style={{ 
            color: 'white',
            background: 'rgba(28, 43, 58, 0.8)',
            padding: '8px 12px',
            borderRadius: '4px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)'
          }}>
            Zoom: {Math.round(zoom * 100)}%
          </div>
        )}
        <div style={{
          color: 'white',
          background: 'rgba(28, 43, 58, 0.8)',
          padding: '8px 12px',
          borderRadius: '4px',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
          width: '200px'
        }}>
          <div>Wall Density: {wallDensity}%</div>
          <Slider
            value={wallDensity}
            onChange={(_, newValue) => setWallDensity(newValue)}
            min={0}
            max={100}
            sx={{
              color: 'rgba(100, 100, 255, 0.6)',
              '& .MuiSlider-thumb': {
                backgroundColor: 'white',
              },
              '& .MuiSlider-track': {
                border: 'none',
              }
            }}
          />
        </div>
        {isZoomed && (
          <button 
            onClick={resetZoom}
            style={{
              background: 'rgba(100, 100, 255, 0.2)',
              border: '1px solid rgba(100, 100, 255, 0.4)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'rgba(100, 100, 255, 0.3)',
              }
            }}
          >
            Reset Zoom
          </button>
        )}
      </div>
    </BlueprintBackground>
  );
};

export default Homepage;