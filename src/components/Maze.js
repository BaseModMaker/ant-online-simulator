import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import Ant from './Ant';

const CELL_SIZE = 40;
const WALL_THICKNESS = 8;

const ANT_COUNT = 5;
const ANT_SPEED = 1;
const ANT_SIZE = 20;
const ANT_MOVE_INTERVAL = 50; // ms between movement updates
const DIRECTION_CHANGE_PROBABILITY = 0.05; // chance to change direction randomly

const MazeContainer = styled('div')(({ zoom, panX, panY }) => ({
  position: 'fixed',
  top: '50%',
  left: '50%',
  width: '100vw',
  height: '100vh',
  transform: `translate(calc(-50% + ${panX}px), calc(-50% + ${panY}px)) scale(${zoom})`,
  transformOrigin: 'center center',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  pointerEvents: 'all', // Enable pointer events for dragging
  cursor: 'grab',
  '&:active': {
    cursor: 'grabbing'
  },
  willChange: 'transform',
  backfaceVisibility: 'hidden',
  WebkitFontSmoothing: 'antialiased',
  perspective: 1000,
}));

const Cell = styled('div')({
  position: 'absolute',
  width: CELL_SIZE,
  height: CELL_SIZE,
  border: '1px solid rgba(100, 100, 255, 0.1)',
  backgroundColor: 'rgba(28, 43, 58, 0.3)',
});

const Wall = styled('div')(({ isHorizontal }) => ({
  position: 'absolute',
  backgroundColor: 'rgba(28, 43, 58, 0.9)',
  border: '1px solid rgba(100, 100, 255, 0.6)',
  boxShadow: '0 0 15px rgba(100, 100, 255, 0.3)',
  backgroundImage: `repeating-linear-gradient(
    ${isHorizontal ? '90deg' : '0deg'},
    rgba(100, 100, 255, 0.2) 0px,
    rgba(100, 100, 255, 0.2) 4px,
    transparent 4px,
    transparent 8px
  )`,
  width: isHorizontal ? CELL_SIZE : WALL_THICKNESS,
  height: isHorizontal ? WALL_THICKNESS : CELL_SIZE,
}));

const WallMemo = React.memo(({ isHorizontal, style }) => (
  <Wall isHorizontal={isHorizontal} style={style} />
));

function generateBaseMaze(width, height) {
  const structure = {
    horizontal: Array(height + 1).fill().map(() => Array(width).fill(true)),
    vertical: Array(height).fill().map(() => Array(width + 1).fill(true))
  };
  
  const visited = Array(height).fill().map(() => Array(width).fill(false));
  const remainingWalls = [];

  for (let y = 0; y <= height; y++) {
    for (let x = 0; x < width; x++) {
      if (y > 0 && y < height && x > 0 && x < width - 1) {
        remainingWalls.push({ type: 'horizontal', x, y });
      }
    }
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x <= width; x++) {
      if (x > 0 && x < width && y > 0 && y < height - 1) {
        remainingWalls.push({ type: 'vertical', x, y });
      }
    }
  }

  function generateMaze(x, y) {
    visited[y][x] = true;
    
    const directions = [
      [0, 1, 'horizontal', x, y + 1],
      [1, 0, 'vertical', x + 1, y],
      [0, -1, 'horizontal', x, y],
      [-1, 0, 'vertical', x, y]
    ].sort(() => Math.random() - 0.5);
    
    for (const [dx, dy, wallType, wallX, wallY] of directions) {
      const nextX = x + dx;
      const nextY = y + dy;
      
      if (nextX >= 0 && nextX < width && 
          nextY >= 0 && nextY < height && 
          !visited[nextY][nextX]) {
        if (wallType === 'horizontal') {
          structure.horizontal[wallY][wallX] = false;
        } else {
          structure.vertical[wallY][wallX] = false;
        }
        generateMaze(nextX, nextY);
      }
    }
  }

  const startX = Math.floor(width / 2);
  const startY = Math.floor(height / 2);
  generateMaze(startX, startY);

  remainingWalls.sort(() => Math.random() - 0.5);

  return {
    structure,
    remainingWalls
  };
}

const Maze = ({ zoom, wallDensity, onPanChange, initialPanX = 0, initialPanY = 0 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [panPosition, setPanPosition] = useState({ x: initialPanX, y: initialPanY });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const width = Math.floor(window.innerWidth / CELL_SIZE);
  const height = Math.floor(window.innerHeight / CELL_SIZE);
  const [ants, setAnts] = useState([]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ 
      x: e.clientX - panPosition.x, 
      y: e.clientY - panPosition.y 
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      const newPos = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      };
      
      setPanPosition(newPos);
      if (onPanChange) {
        onPanChange(newPos);
      }
    }
  }, [isDragging, dragStart, onPanChange]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove]);

  useEffect(() => {
    const handleExternalPanChange = (e) => {
      const { x, y } = e.detail;
      setPanPosition({ x, y });
    };
    
    window.addEventListener('centerMap', handleExternalPanChange);
    return () => {
      window.removeEventListener('centerMap', handleExternalPanChange);
    };
  }, []);

  const [baseMaze, setBaseMaze] = useState(() => generateBaseMaze(width, height));

  useEffect(() => {
    setBaseMaze(generateBaseMaze(width, height));
  }, [width, height]);

  const walls = useMemo(() => {
    const result = {
      horizontal: baseMaze.structure.horizontal.map((row, y) => 
        row.map((_, x) => y === 0 || y === height)),
      vertical: baseMaze.structure.vertical.map((row, y) => 
        row.map((_, x) => x === 0 || x === width))
    };

    if (wallDensity > 0) {
      result.horizontal = baseMaze.structure.horizontal.map(row => [...row]);
      result.vertical = baseMaze.structure.vertical.map(row => [...row]);

      const numWallsToRemove = Math.floor(baseMaze.remainingWalls.length * (1 - wallDensity / 100));

      for (let i = 0; i < numWallsToRemove; i++) {
        const wall = baseMaze.remainingWalls[i];
        if (wall.type === 'horizontal') {
          result.horizontal[wall.y][wall.x] = false;
        } else {
          result.vertical[wall.y][wall.x] = false;
        }
      }
    }

    return result;
  }, [baseMaze, wallDensity, width, height]);

  const isValidPosition = useCallback((x, y) => {
    const gridX = Math.floor(x / CELL_SIZE);
    const gridY = Math.floor(y / CELL_SIZE);
    
    if (y % CELL_SIZE < WALL_THICKNESS || y % CELL_SIZE > CELL_SIZE - WALL_THICKNESS) {
      if (gridY >= 0 && gridY < walls.horizontal.length && 
          gridX >= 0 && gridX < walls.horizontal[0].length) {
        if (walls.horizontal[gridY][gridX]) return false;
      }
    }
    
    if (x % CELL_SIZE < WALL_THICKNESS || x % CELL_SIZE > CELL_SIZE - WALL_THICKNESS) {
      if (gridY >= 0 && gridY < walls.vertical.length && 
          gridX >= 0 && gridX < walls.vertical[0].length) {
        if (walls.vertical[gridY][gridX]) return false;
      }
    }
    
    return true;
  }, [walls]);

  const checkAntCollision = useCallback((ant, newPosition) => {
    return ants.some(otherAnt => 
      otherAnt.id !== ant.id && 
      Math.hypot(newPosition.x - otherAnt.position.x, newPosition.y - otherAnt.position.y) < ANT_SIZE
    );
  }, [ants]);

  useEffect(() => {
    if (ants.length === 0 && walls.horizontal.length > 0) {
      const newAnts = [];
      
      for (let i = 0; i < ANT_COUNT; i++) {
        let validPosition = false;
        let position;
        let attempts = 0;
        
        while (!validPosition && attempts < 100) {
          attempts++;
          const x = Math.floor(Math.random() * width * CELL_SIZE);
          const y = Math.floor(Math.random() * height * CELL_SIZE);
          position = { x, y };
          
          validPosition = isValidPosition(x, y) && 
            !newAnts.some(ant => 
              Math.hypot(x - ant.position.x, y - ant.position.y) < ANT_SIZE * 2);
        }
        
        if (validPosition) {
          newAnts.push({
            id: i,
            position,
            direction: Math.floor(Math.random() * 360),
            velocity: { x: 0, y: 0 }
          });
        }
      }
      
      setAnts(newAnts);
    }
  }, [walls, width, height, ants.length, isValidPosition]);

  useEffect(() => {
    if (ants.length === 0) return;
    
    const moveInterval = setInterval(() => {
      setAnts(currentAnts => {
        return currentAnts.map(ant => {
          let direction = ant.direction;
          if (Math.random() < DIRECTION_CHANGE_PROBABILITY) {
            direction = (direction + Math.floor(Math.random() * 60 - 30)) % 360;
            if (direction < 0) direction += 360;
          }
          
          const radians = direction * Math.PI / 180;
          const velocityX = Math.cos(radians) * ANT_SPEED;
          const velocityY = Math.sin(radians) * ANT_SPEED;
          
          const newPosition = {
            x: ant.position.x + velocityX,
            y: ant.position.y + velocityY
          };
          
          const isValid = isValidPosition(newPosition.x, newPosition.y);
          const hasAntCollision = checkAntCollision(ant, newPosition);
          
          if (!isValid || hasAntCollision) {
            const newDirection = (direction + 180 + Math.floor(Math.random() * 60 - 30)) % 360;
            return {
              ...ant,
              direction: newDirection,
            };
          }
          
          return {
            ...ant,
            position: newPosition,
            direction,
          };
        });
      });
    }, ANT_MOVE_INTERVAL);
    
    return () => clearInterval(moveInterval);
  }, [ants.length, isValidPosition, checkAntCollision]);

  return (
    <MazeContainer 
      zoom={zoom} 
      panX={panPosition.x} 
      panY={panPosition.y}
      onMouseDown={handleMouseDown}
    >
      {Array(height).fill().map((_, y) =>
        Array(width).fill().map((_, x) => (
          <Cell
            key={`cell-${x}-${y}`}
            style={{
              left: x * CELL_SIZE,
              top: y * CELL_SIZE,
            }}
          />
        ))
      )}
      
      {walls.horizontal.map((row, y) =>
        row.map((wall, x) => wall && (
          <WallMemo
            key={`h-${x}-${y}`}
            isHorizontal
            style={{
              left: x * CELL_SIZE,
              top: y * CELL_SIZE - WALL_THICKNESS/2,
            }}
          />
        ))
      )}

      {walls.vertical.map((row, y) =>
        row.map((wall, x) => wall && (
          <WallMemo
            key={`v-${x}-${y}`}
            style={{
              left: x * CELL_SIZE - WALL_THICKNESS/2,
              top: y * CELL_SIZE,
            }}
          />
        ))
      )}
      
      {ants.map(ant => (
        <Ant
          key={`ant-${ant.id}`}
          id={ant.id}
          position={ant.position}
          rotation={ant.direction}
        />
      ))}
    </MazeContainer>
  );
};

export default Maze;