import React from 'react';
import { styled } from '@mui/material/styles';

const AntImage = styled('img')({
  position: 'absolute',
  width: '20px',
  height: '20px',
  transform: 'translate(-50%, -50%)',
  transition: 'transform 0.3s ease',
});

const Ant = ({ position, rotation, id }) => {
  return (
    <AntImage
      src={`${process.env.PUBLIC_URL}/ant.png`}
      alt="Ant"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        zIndex: 100 + id,
      }}
    />
  );
};

export default Ant;