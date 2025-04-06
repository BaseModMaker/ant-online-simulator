import React, { useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { GlobalStyles } from '@mui/material';
import Slider from '@mui/material/Slider';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import SettingsIcon from '@mui/icons-material/Settings';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

// Replace with MUI GlobalStyles
const globalStyles = {
  body: {
    overflow: 'hidden',
    position: 'fixed',
    width: '100%',
    height: '100%'
  },
  '.MuiSlider-root, .MuiButton-root': {
    touchAction: 'none !important',
    overscrollBehavior: 'none !important'
  }
};

const SidebarContainer = styled('div')(({ open }) => ({
  position: 'fixed',
  left: open ? 0 : -280,
  top: 0,
  bottom: 0,
  width: 240,
  backgroundColor: 'rgba(28, 43, 58, 0.95)',
  transition: 'all 0.3s ease',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  padding: '20px',
  boxShadow: open ? '2px 0 15px rgba(0, 0, 0, 0.3)' : 'none',
  overflow: 'hidden !important',
  maxHeight: '100vh',
  boxSizing: 'border-box',
  touchAction: 'none',
  WebkitOverflowScrolling: 'none',
  overscrollBehavior: 'none',
  userSelect: 'none',
}));

const ToggleButton = styled(IconButton)(({ open }) => ({
  position: 'fixed',
  right: open ? 20 : 20, // Remove right positioning
  left: open ? 250 : 20, // Keep on left side always
  top: 20,
  backgroundColor: 'rgba(28, 43, 58, 0.95)',
  color: 'white',
  width: 48,
  height: 48,
  transition: 'all 0.3s ease',
  boxShadow: '0 0 15px rgba(0, 0, 0, 0.3)',
  zIndex: 1001,
  '&:hover': {
    backgroundColor: 'rgba(28, 43, 58, 0.8)',
  },
}));

const SliderContainer = styled('div')({
  color: 'white',
  marginBottom: '20px',
  '& .MuiSlider-root': {
    color: 'rgba(100, 100, 255, 0.6)',
  },
  '& .MuiSlider-thumb': {
    backgroundColor: 'white',
  },
  '& .MuiSlider-track': {
    border: 'none',
  },
});

const Controls = styled('div')(({ open }) => ({
  opacity: open ? 1 : 0,
  transition: 'opacity 0.2s ease',
  visibility: open ? 'visible' : 'hidden',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  height: 'auto',
  maxHeight: 'calc(100vh - 40px)',
  touchAction: 'none', 
  pointerEvents: 'auto', // Ensure clicks are registered
}));

const ResetButton = styled(Button)(({ disabled }) => ({
  color: 'white',
  backgroundColor: disabled ? 'rgba(28, 43, 58, 0.4)' : 'rgba(28, 43, 58, 0.95)',
  marginTop: '10px',
  width: '100%',
  opacity: disabled ? 0.5 : 1,
  pointerEvents: disabled ? 'none' : 'auto', // Let disabled state control pointer events
  '&:hover': {
    backgroundColor: disabled ? 'rgba(28, 43, 58, 0.4)' : 'rgba(28, 43, 58, 0.8)',
  },
  '& .MuiButton-startIcon': {
    marginRight: '8px',
  }
}));

const Sidebar = ({ 
  zoom, 
  onZoomChange, 
  wallDensity, 
  onWallDensityChange, 
  onCenterMap,
  isMapCentered,
  showCollisionSpheres,
  onToggleCollisionSpheres,
  showVisionCones,
  onToggleVisionCones
}) => {
  const [open, setOpen] = React.useState(false);
  const isZoomed = zoom !== 1;

  const handleResetZoom = () => {
    if (isZoomed) {
      onZoomChange(1);
    }
  };

  const handleCenterMapClick = () => {
    console.log("Center map button clicked, isMapCentered:", isMapCentered);
    if (onCenterMap && !isMapCentered) {
      onCenterMap();
    }
  };

  // Prevent wheel events on the sidebar
  useEffect(() => {
    const preventScroll = (e) => {
      if (open) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    
    const sidebar = document.querySelector('.sidebar-container');
    if (sidebar) {
      sidebar.addEventListener('wheel', preventScroll, { passive: false });
      sidebar.addEventListener('touchmove', preventScroll, { passive: false });
      sidebar.addEventListener('scroll', preventScroll, { passive: false });
    }
    
    return () => {
      if (sidebar) {
        sidebar.removeEventListener('wheel', preventScroll);
        sidebar.removeEventListener('touchmove', preventScroll);
        sidebar.removeEventListener('scroll', preventScroll);
      }
    };
  }, [open]);

  return (
    <>
      <GlobalStyles styles={globalStyles} />
      <SidebarContainer open={open} className="sidebar-container">
        <Controls open={open}>
          <SliderContainer>
            <div>Wall Density: {wallDensity}%</div>
            <Slider
              value={wallDensity}
              onChange={(_, value) => onWallDensityChange(value)}
              min={0}
              max={100}
            />
          </SliderContainer>

          <SliderContainer>
            <div>Zoom: {Math.round(zoom * 100)}%</div>
            <Slider
              value={zoom * 100}
              onChange={(_, value) => onZoomChange(value / 100)}
              min={10}
              max={500}
            />
            <ResetButton
              variant="contained"
              disabled={!isZoomed}
              onClick={handleResetZoom}
              startIcon={<ZoomOutMapIcon />}
            >
              Reset Zoom
            </ResetButton>
            <ResetButton
              variant="contained"
              disabled={isMapCentered}
              onClick={handleCenterMapClick}
              startIcon={<CenterFocusStrongIcon />}
              style={{ pointerEvents: isMapCentered ? 'none' : 'auto' }} // Additional style to ensure clickability
            >
              Center Map
            </ResetButton>
            <ResetButton
              variant="contained"
              onClick={onToggleCollisionSpheres}
              startIcon={showCollisionSpheres ? <VisibilityOffIcon /> : <VisibilityIcon />}
            >
              {showCollisionSpheres ? "Hide" : "Show"} Collision Spheres
            </ResetButton>
            <ResetButton
              variant="contained"
              onClick={onToggleVisionCones}
              startIcon={showVisionCones ? <VisibilityOffIcon /> : <RemoveRedEyeIcon />}
            >
              {showVisionCones ? "Hide" : "Show"} Vision Cones
            </ResetButton>
          </SliderContainer>
        </Controls>
      </SidebarContainer>
      <ToggleButton open={open} onClick={() => setOpen(!open)}>
        {open ? <ChevronLeftIcon /> : <SettingsIcon />}
      </ToggleButton>
    </>
  );
};

export default Sidebar;