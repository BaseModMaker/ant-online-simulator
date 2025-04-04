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
  border: wallBetweenPoints ? '2px solid rgba(255, 105, 180, 0.8)' : // Pink for wall between points
         insideWall ? '2px solid rgba(255, 255, 0, 0.8)' : // Yellow for inside walls
         phasing ? '1px solid rgba(0, 255, 255, 0.8)' : // Cyan for phasing
         '1px solid rgba(255, 0, 0, 0.5)', // Red for normal collision sphere
  backgroundColor: wallBetweenPoints ? 'rgba(255, 105, 180, 0.3)' : // Pink bg
                  insideWall ? 'rgba(255, 255, 0, 0.3)' : // Yellow bg
                  phasing ? 'rgba(0, 255, 255, 0.3)' : // Cyan bg
                  'rgba(255, 0, 0, 0.2)', // Red bg
  pointerEvents: 'none',
}));

const Ant = ({ position, rotation, width, height, id, showCollisionSphere, phasing, insideWall, wallBetweenPoints }) => {
  return (
    <>
      {showCollisionSphere && (
        <CollisionSphere
          phasing={phasing}
          insideWall={insideWall}
          wallBetweenPoints={wallBetweenPoints}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: `${width}px`,
            height: `${width}px`,
            zIndex: 99 + id,
          }}
        />
      )}
      <AntImage
        src={`${process.env.PUBLIC_URL}/ant.png`}
        alt="Ant"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${width}px`,
          height: `${height}px`,
          transform: `translate(-50%, -50%) rotate(${rotation+90}deg)`,
          zIndex: 100 + id,
          opacity: wallBetweenPoints ? 0.7 : (insideWall ? 0.7 : (phasing ? 0.6 : 1)),
          filter: wallBetweenPoints ? 'hue-rotate(320deg) brightness(1.3)' : // Pink tint
                  insideWall ? 'hue-rotate(50deg) brightness(1.3)' : // Yellow tint
                  phasing ? 'hue-rotate(180deg) brightness(1.2)' : 'none', // Blue tint
        }}
      />
    </>
  );
};

export default Ant;