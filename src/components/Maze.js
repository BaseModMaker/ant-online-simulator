import React from 'react';
import { styled } from '@mui/material/styles';

const CELL_SIZE = 40;
const WALL_THICKNESS = 8;

const MazeContainer = styled('div')(({ zoom }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  transform: `scale(${zoom})`,
  transformOrigin: 'center center',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
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

function generateBaseMaze(width, height) {
  // Initialize walls
  const structure = {
    horizontal: Array(height + 1).fill().map(() => Array(width).fill(true)),
    vertical: Array(height).fill().map(() => Array(width + 1).fill(true))
  };
  
  // Track visited cells and remaining walls
  const visited = Array(height).fill().map(() => Array(width).fill(false));
  const remainingWalls = [];

  // First, collect all internal walls
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
        // Remove wall between current and next cell
        if (wallType === 'horizontal') {
          structure.horizontal[wallY][wallX] = false;
        } else {
          structure.vertical[wallY][wallX] = false;
        }
        generateMaze(nextX, nextY);
      }
    }
  }

  // Start from center for more balanced maze
  const startX = Math.floor(width / 2);
  const startY = Math.floor(height / 2);
  generateMaze(startX, startY);

  // Shuffle remaining walls for random removal
  remainingWalls.sort(() => Math.random() - 0.5);

  return {
    structure,
    remainingWalls
  };
}

const Maze = ({ zoom, wallDensity }) => {
  const width = Math.floor(window.innerWidth / CELL_SIZE);
  const height = Math.floor(window.innerHeight / CELL_SIZE);
  
  const [baseMaze, setBaseMaze] = React.useState(() => generateBaseMaze(width, height));

  React.useEffect(() => {
    setBaseMaze(generateBaseMaze(width, height));
  }, [width, height]);

  const walls = React.useMemo(() => {
    const result = {
      horizontal: baseMaze.structure.horizontal.map(row => [...row]),
      vertical: baseMaze.structure.vertical.map(row => [...row])
    };

    // Calculate number of walls to remove
    const numWallsToRemove = Math.floor(baseMaze.remainingWalls.length * (1 - wallDensity / 100));

    // Remove walls in consistent order
    for (let i = 0; i < numWallsToRemove; i++) {
      const wall = baseMaze.remainingWalls[i];
      if (wall.type === 'horizontal') {
        result.horizontal[wall.y][wall.x] = false;
      } else {
        result.vertical[wall.y][wall.x] = false;
      }
    }

    return result;
  }, [baseMaze, wallDensity]);

  return (
    <MazeContainer zoom={zoom}>
      {/* Render cells */}
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
      
      {/* Render horizontal walls */}
      {walls.horizontal.map((row, y) =>
        row.map((wall, x) => wall && (
          <Wall
            key={`h-${x}-${y}`}
            isHorizontal
            style={{
              left: x * CELL_SIZE,
              top: y * CELL_SIZE - WALL_THICKNESS/2,
            }}
          />
        ))
      )}

      {/* Render vertical walls */}
      {walls.vertical.map((row, y) =>
        row.map((wall, x) => wall && (
          <Wall
            key={`v-${x}-${y}`}
            style={{
              left: x * CELL_SIZE - WALL_THICKNESS/2,
              top: y * CELL_SIZE,
            }}
          />
        ))
      )}
    </MazeContainer>
  );
};

export default Maze;