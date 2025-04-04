import { styled } from '@mui/material/styles';

export const BlueprintBackground = styled('div')(({ zoom, panX = 0, panY = 0 }) => ({
  width: '100vw',
  height: '100vh',
  backgroundColor: '#1c2b3a',
  position: 'fixed',
  top: 0,
  left: 0,
  overflow: 'hidden',
}));