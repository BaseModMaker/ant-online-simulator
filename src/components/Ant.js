import React from 'react';
import { styled } from '@mui/material/styles';

const AntImage = styled('img')({
  position: 'absolute',
  transform: 'translate(-50%, -50%)',
  transition: 'transform 0.1s ease',
});

const CollisionSphere = styled('div')({
  position: 'absolute',
  transform: 'translate(-50%, -50%)',
  borderRadius: '50%',
  border: '1px solid rgba(255, 0, 0, 0.5)',
  backgroundColor: 'rgba(255, 0, 0, 0.2)',
  pointerEvents: 'none',
});

const Ant = ({ position, rotation, width, height, id, showCollisionSphere }) => {
  return (
    <>
      {showCollisionSphere && (
        <CollisionSphere
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: `${width}px`,
            height: `${width}px`, // Using width for both to ensure perfect circle
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
        }}
      />
    </>
  );
};

export default Ant;