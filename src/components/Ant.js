import React from 'react';
import { styled } from '@mui/material/styles';

const AntImage = styled('img')({
  position: 'absolute',
  transform: 'translate(-50%, -50%)',
  transition: 'transform 0.1s ease',
});

const CollisionSphere = styled('div')(({ phasing }) => ({
  position: 'absolute',
  transform: 'translate(-50%, -50%)',
  borderRadius: '50%',
  border: phasing ? '1px solid rgba(0, 255, 255, 0.8)' : '1px solid rgba(255, 0, 0, 0.5)',
  backgroundColor: phasing ? 'rgba(0, 255, 255, 0.3)' : 'rgba(255, 0, 0, 0.2)',
  pointerEvents: 'none',
}));

const Ant = ({ position, rotation, width, height, id, showCollisionSphere, phasing }) => {
  return (
    <>
      {showCollisionSphere && (
        <CollisionSphere
          phasing={phasing}
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
          opacity: phasing ? 0.6 : 1, // Make phasing ants semi-transparent
          filter: phasing ? 'hue-rotate(180deg) brightness(1.2)' : 'none', // Blue tint when phasing
        }}
      />
    </>
  );
};

export default Ant;