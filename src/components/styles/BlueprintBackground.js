import { styled } from '@mui/material/styles';

export const BlueprintBackground = styled('div')(({ zoom }) => ({
  width: '100vw',
  height: '100vh',
  backgroundColor: '#1c2b3a',
  backgroundImage: `
    linear-gradient(rgba(100, 100, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(100, 100, 255, 0.1) 1px, transparent 1px)
  `,
  backgroundSize: `${40 * zoom}px ${40 * zoom}px`,
  position: 'fixed',
  top: 0,
  left: 0,
  transition: 'background-size 0.1s ease-out',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at center, transparent 0%, rgba(28, 43, 58, 0.8) 100%)',
    pointerEvents: 'none'
  }
}));