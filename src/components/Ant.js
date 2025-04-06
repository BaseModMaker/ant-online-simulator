import React from 'react';
import { styled } from '@mui/material/styles';

const AntImage = styled('img')({
  position: 'absolute',
  transform: 'translate(-50%, -50%)',
  transition: 'transform 0.1s ease',
});

const CollisionSphere = styled('div')(({ phasing, insideWall, wallBetweenPoints }) => ({
  position: 'absolute',
  transform: 'translate(-50%, -50%)',
  borderRadius: '50%',
  border: wallBetweenPoints ? '2px solid rgba(255, 105, 180, 0.8)' : 
         insideWall ? '2px solid rgba(255, 255, 0, 0.8)' : 
         phasing ? '1px solid rgba(0, 255, 255, 0.8)' : 
         '1px solid rgba(255, 0, 0, 0.5)',
  backgroundColor: wallBetweenPoints ? 'rgba(255, 105, 180, 0.3)' : 
                  insideWall ? 'rgba(255, 255, 0, 0.3)' : 
                  phasing ? 'rgba(0, 255, 255, 0.3)' : 
                  'rgba(255, 0, 0, 0.2)',
  pointerEvents: 'none',
}));

// Flipped vision cone - with point at left side (0%) and base at right side (100%)
const VisionCone = styled('div')({
  position: 'absolute',
  pointerEvents: 'none',
  zIndex: 95,
  // Modified clipPath to have the point on the left side (0%) and base at the right (100%)
  clipPath: 'polygon(0% 50%, 100% 0%, 100% 100%)',
  backgroundColor: 'rgba(0, 255, 0, 0.4)',
  transition: 'transform 0.1s ease',
});

const Ant = ({ 
  radius,
  theta,
  rotation, 
  width, 
  height, 
  id, 
  showCollisionSphere, 
  showVisionCone,
  phasing, 
  insideWall, 
  wallBetweenPoints,
  originX = window.innerWidth / 2,
  originY = window.innerHeight / 2
}) => {
  // Convert polar to Cartesian coordinates
  const x = originX + radius * Math.cos(theta * Math.PI / 180);
  const y = originY + radius * Math.sin(theta * Math.PI / 180);
  
  // Ant image rotation offset
  const actualRotation = rotation + 90; 
  
  // Vision cone dimensions adjusted to better fit the ant
  const visionConeWidth = width * 2;
  const visionConeHeight = width * 1;
  
  return (
    <>
      {showCollisionSphere && (
        <CollisionSphere
          phasing={phasing}
          insideWall={insideWall}
          wallBetweenPoints={wallBetweenPoints}
          style={{
            left: `${x}px`,
            top: `${y}px`,
            width: `${width}px`,
            height: `${width}px`,
            zIndex: 99 + id,
          }}
        />
      )}
      
      {/* Position vision cone with point at ant's center */}
      {showVisionCone && (
        <VisionCone
          style={{
            left: `${x}px`,
            top: `${y}px`,
            width: `${visionConeWidth}px`,
            height: `${visionConeHeight}px`,
            // Transform from the left-center point (0% 50%) which is now the point of the cone
            transform: `translate(0, -50%) rotate(${rotation}deg)`,
            transformOrigin: '0% 50%', // Origin at left center (the point of the cone)
          }}
        />
      )}
      
      <AntImage
        src={`${process.env.PUBLIC_URL}/ant.png`}
        alt="Ant"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: `${width}px`,
          height: `${height}px`,
          transform: `translate(-50%, -50%) rotate(${actualRotation}deg)`,
          zIndex: 100 + id,
          opacity: wallBetweenPoints ? 0.7 : (insideWall ? 0.7 : (phasing ? 0.6 : 1)),
          filter: wallBetweenPoints ? 'hue-rotate(320deg) brightness(1.3)' : 
                  insideWall ? 'hue-rotate(50deg) brightness(1.3)' : 
                  phasing ? 'hue-rotate(180deg) brightness(1.2)' : 'none',
        }}
      />
    </>
  );
};

export default Ant;