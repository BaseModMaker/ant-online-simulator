import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import Ant from './Ant';

const CELL_SIZE = 40;
const WALL_THICKNESS = 8;

const ANT_COUNT = 50;
const ANT_SPEED = 1.5; // Increased speed
const ANT_SIZE = 20;
const COLLISION_RADIUS = ANT_SIZE * 0.6; // Smaller collision radius
const ANT_MOVE_INTERVAL = 16; // Smoother movement with faster updates
const DIRECTION_CHANGE_PROBABILITY = 0.01; // Reduced random direction changes

const PINK_MAX_DURATION = 5000; // 5 seconds max allowed in pink state
const PINK_PERCENTAGE_THRESHOLD = 0.9; // 90% threshold for phase changing
const PINK_MONITORING_WINDOW = 6000; // 6 second window for monitoring percentage

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

const Maze = ({ zoom, wallDensity, onPanChange, initialPanX = 0, initialPanY = 0, showCollisionSpheres = false }) => {
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

  const isValidPosition = useCallback((x, y, radius = COLLISION_RADIUS) => {
    const checkPoints = [
      { x, y }, // Center
      { x: x + radius * 0.8, y }, // Right
      { x: x - radius * 0.8, y }, // Left
      { x, y: y + radius * 0.8 }, // Bottom
      { x, y: y - radius * 0.8 }, // Top
    ];
    
    for (const point of checkPoints) {
      const gridX = Math.floor(point.x / CELL_SIZE);
      const gridY = Math.floor(point.y / CELL_SIZE);
      
      if (Math.abs(point.y % CELL_SIZE) < WALL_THICKNESS || 
          Math.abs(point.y % CELL_SIZE - CELL_SIZE) < WALL_THICKNESS) {
        if (gridY >= 0 && gridY < walls.horizontal.length && 
            gridX >= 0 && gridX < walls.horizontal[0].length) {
          if (walls.horizontal[gridY][gridX]) return false;
        }
      }
      
      if (Math.abs(point.x % CELL_SIZE) < WALL_THICKNESS || 
          Math.abs(point.x % CELL_SIZE - CELL_SIZE) < WALL_THICKNESS) {
        if (gridY >= 0 && gridY < walls.vertical.length && 
            gridX >= 0 && gridX < walls.vertical[0].length) {
          if (walls.vertical[gridY][gridX]) return false;
        }
      }
    }
    
    return true;
  }, [walls]);

  const isAntStuck = useCallback((position) => {
    const gridX = Math.floor(position.x / CELL_SIZE);
    const gridY = Math.floor(position.y / CELL_SIZE);
    
    if (position.y % CELL_SIZE < WALL_THICKNESS || 
        position.y % CELL_SIZE > CELL_SIZE - WALL_THICKNESS) {
      if (gridY >= 0 && gridY < walls.horizontal.length && 
          gridX >= 0 && gridX < walls.horizontal[0].length) {
        if (walls.horizontal[gridY][gridX]) return true;
      }
    }
    
    if (position.x % CELL_SIZE < WALL_THICKNESS || 
        position.x % CELL_SIZE > CELL_SIZE - WALL_THICKNESS) {
      if (gridY >= 0 && gridY < walls.vertical.length && 
          gridX >= 0 && gridX < walls.vertical[0].length) {
        if (walls.vertical[gridY][gridX]) return true;
      }
    }
    
    return false;
  }, [walls]);

  const findSafeLocation = useCallback((position) => {
    const cellX = Math.floor(position.x / CELL_SIZE);
    const cellY = Math.floor(position.y / CELL_SIZE);
    
    const centerX = cellX * CELL_SIZE + CELL_SIZE/2;
    const centerY = cellY * CELL_SIZE + CELL_SIZE/2;
    
    if (!isAntStuck({ x: centerX, y: centerY })) {
      return { x: centerX, y: centerY };
    }
    
    for (let offsetX = -10; offsetX <= 10; offsetX += 5) {
      for (let offsetY = -10; offsetY <= 10; ) {
        const testX = centerX + offsetX;
        const testY = centerY + offsetY;
        if (!isAntStuck({ x: testX, y: testY })) {
          return { x: testX, y: testY };
        }
      }
    }
    
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        
        const adjCellX = (cellX + dx) * CELL_SIZE + CELL_SIZE/2;
        const adjCellY = (cellY + dy) * CELL_SIZE + CELL_SIZE/2;
        
        if (!isAntStuck({ x: adjCellX, y: adjCellY })) {
          return { x: adjCellX, y: adjCellY };
        }
      }
    }
    
    return {
      x: Math.floor(Math.random() * width) * CELL_SIZE + CELL_SIZE/2,
      y: Math.floor(Math.random() * height) * CELL_SIZE + CELL_SIZE/2
    };
  }, [isAntStuck, width, height]);

  const checkAntCollision = useCallback((ant, newPosition) => {
    return ants.some(otherAnt => {
      // Skip self-collision check
      if (otherAnt.id === ant.id) return false;
      
      // If the other ant is phasing, it shouldn't block this ant's movement
      if (otherAnt.phasing) return false;
      
      // Calculate distance between ants
      const dx = newPosition.x - otherAnt.position.x;
      const dy = newPosition.y - otherAnt.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Collision detected if distance is less than the combined radii
      return distance < COLLISION_RADIUS * 1.5;
    });
  }, [ants]);

  // Add function to check if a wall crosses between two points
  const isWallBetweenPoints = useCallback((point1, point2) => {
    // Get grid coordinates for both points
    const grid1X = Math.floor(point1.x / CELL_SIZE);
    const grid1Y = Math.floor(point1.y / CELL_SIZE);
    const grid2X = Math.floor(point2.x / CELL_SIZE);
    const grid2Y = Math.floor(point2.y / CELL_SIZE);
    
    // If points are in the same cell, no wall can be between them
    if (grid1X === grid2X && grid1Y === grid2Y) {
      return false;
    }
    
    // Check horizontal walls
    if (grid1Y !== grid2Y) {
      const minY = Math.min(grid1Y, grid2Y);
      const maxY = Math.max(grid1Y, grid2Y);
      
      // Only check walls at the boundary between cells
      for (let y = minY + 1; y <= maxY; y++) {
        const wallX = grid1X; // horizontal wall spans the x-coordinate
        if (y >= 0 && y < walls.horizontal.length && 
            wallX >= 0 && wallX < walls.horizontal[0].length) {
          if (walls.horizontal[y][wallX]) {
            return true;
          }
        }
      }
    }
    
    // Check vertical walls
    if (grid1X !== grid2X) {
      const minX = Math.min(grid1X, grid2X);
      const maxX = Math.max(grid1X, grid2X);
      
      for (let x = minX + 1; x <= maxX; x++) {
        const wallY = grid1Y; // vertical wall spans the y-coordinate
        if (wallY >= 0 && wallY < walls.vertical.length && 
            x >= 0 && x < walls.vertical[0].length) {
          if (walls.vertical[wallY][x]) {
            return true;
          }
        }
      }
    }
    
    return false;
  }, [walls]);

  // Add function to check if ant has a wall between its detection points
  const hasWallBetweenPoints = useCallback((position, radius = COLLISION_RADIUS) => {
    const checkPoints = [
      { x: position.x, y: position.y }, // Center
      { x: position.x + radius * 0.8, y: position.y }, // Right
      { x: position.x - radius * 0.8, y: position.y }, // Left
      { x: position.x, y: position.y + radius * 0.8 }, // Bottom
      { x: position.x, y: position.y - radius * 0.8 }, // Top
    ];
    
    // Check all pairs of points
    for (let i = 0; i < checkPoints.length; i++) {
      for (let j = i + 1; j < checkPoints.length; j++) {
        if (isWallBetweenPoints(checkPoints[i], checkPoints[j])) {
          return true;
        }
      }
    }
    
    return false;
  }, [isWallBetweenPoints]);

  // Add a visual indicator for ants in phasing mode
  useEffect(() => {
    if (ants.length === 0 && walls.horizontal.length > 0) {
      const newAnts = [];
      
      // Define a single starting position (center of the maze)
      const centerCellX = Math.floor(width / 2);
      const centerCellY = Math.floor(height / 2);
      const startX = centerCellX * CELL_SIZE + CELL_SIZE/2;
      const startY = centerCellY * CELL_SIZE + CELL_SIZE/2;
      
      // Check if center position is valid, otherwise find nearest safe spot
      let startPosition;
      if (isValidPosition(startX, startY, COLLISION_RADIUS)) {
        startPosition = { x: startX, y: startY };
      } else {
        // Use findSafeLocation to get a valid position
        startPosition = findSafeLocation({ x: startX, y: startY });
      }
      
      console.log("Spawning all ants at:", startPosition);
      
      // Create all ants at the same position but with different directions
      for (let i = 0; i < ANT_COUNT; i++) {
        // Give each ant a different direction (spread around 360 degrees)
        const direction = (i * (360 / ANT_COUNT)) % 360;
        
        newAnts.push({
          id: i,
          position: { ...startPosition }, // Clone position to avoid reference issues
          direction: direction,
          velocity: { x: 0, y: 0 },
          phasing: false, // Add phasing property to track collision state
          wallBetweenPoints: false,
          insideWall: false,
          pinkSince: null, // Timestamp when ant first entered pink state
          pinkHistory: [], // Array of [timestamp, isPink] entries
        });
      }
      
      setAnts(newAnts);
    }
  }, [walls, width, height, ants.length, isValidPosition, findSafeLocation]);

  // Update the ant movement logic to track wall-between-points
  useEffect(() => {
    if (ants.length === 0) return;
    
    const moveInterval = setInterval(() => {
      const now = Date.now();
      
      setAnts(currentAnts => {
        return currentAnts.map(ant => {
          // Determine if ant is currently stuck or has wall between points
          const isStuck = isAntStuck(ant.position);
          const wallBetweenPoints = hasWallBetweenPoints(ant.position);
          
          // Check if pink state just started
          const justTurnedPink = wallBetweenPoints && !ant.wallBetweenPoints;
          // Check if pink state just ended
          const justEndedPink = !wallBetweenPoints && ant.wallBetweenPoints;
          
          // Update pink tracking
          let pinkSince = ant.pinkSince;
          let pinkHistory = [...ant.pinkHistory];
          
          // Record new pink state in history
          pinkHistory.push([now, wallBetweenPoints]);
          
          // Remove entries older than monitoring window
          const cutoffTime = now - PINK_MONITORING_WINDOW;
          pinkHistory = pinkHistory.filter(entry => entry[0] >= cutoffTime);
          
          // Update pink start time
          if (justTurnedPink) {
            pinkSince = now;
          } else if (justEndedPink) {
            pinkSince = null;
          }
          
          // Calculate pink percentage over monitoring window
          const pinkDuration = pinkHistory.filter(entry => entry[1]).length;
          const pinkPercentage = pinkHistory.length > 0 ? pinkDuration / pinkHistory.length : 0;
          
          // Check if we should force phasing due to pink state
          const pinkTooLong = pinkSince !== null && (now - pinkSince > PINK_MAX_DURATION);
          const pinkTooFrequent = pinkPercentage > PINK_PERCENTAGE_THRESHOLD && pinkHistory.length > 10;
          
          // If pink for too long or too frequent, force phasing mode
          let phasing = ant.phasing || isStuck;
          let direction = ant.direction;
          if ((pinkTooLong || pinkTooFrequent) && wallBetweenPoints) {
            phasing = true;
            // Pick a random direction to help escape
            direction = Math.floor(Math.random() * 360);
          }
          
          if (phasing) {
            if (Math.random() < 0.35) {
              direction = Math.floor(Math.random() * 360);
            }
          } else {
            if (Math.random() < DIRECTION_CHANGE_PROBABILITY) {
              direction = (direction + Math.floor(Math.random() * 40 - 20)) % 360;
              if (direction < 0) direction += 360;
            }
          }
          
          const speedMultiplier = phasing ? 1.5 : 1.0;
          const radians = direction * Math.PI / 180;
          const velocityX = Math.cos(radians) * ANT_SPEED * speedMultiplier;
          const velocityY = Math.sin(radians) * ANT_SPEED * speedMultiplier;
          
          const newPosition = {
            x: ant.position.x + velocityX,
            y: ant.position.y + velocityY
          };
          
          // Check if new position will have wall between points
          const newWallBetweenPoints = hasWallBetweenPoints(newPosition);
          
          // Rest of the collision handling remains the same
          const isValid = phasing ? true : isValidPosition(newPosition.x, newPosition.y, COLLISION_RADIUS);
          const hasAntCollision = phasing ? false : checkAntCollision(ant, newPosition);
          
          if (!phasing && (!isValid || hasAntCollision)) {
            const possibleDirections = [];
            
            for (let angle = 0; angle < 360; angle += 45) {
              const testDirection = (direction + 180 + angle) % 360;
              const testRadians = testDirection * Math.PI / 180;
              const testVelocityX = Math.cos(testRadians) * ANT_SPEED;
              const testVelocityY = Math.sin(testRadians) * ANT_SPEED;
              
              const testPosition = {
                x: ant.position.x + testVelocityX,
                y: ant.position.y + testVelocityY
              };
              
              if (isValidPosition(testPosition.x, testPosition.y, COLLISION_RADIUS) && 
                  !checkAntCollision(ant, testPosition)) {
                possibleDirections.push(testDirection);
              }
            }
            
            if (possibleDirections.length > 0) {
              const newDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
              return {
                ...ant,
                direction: newDirection,
                phasing: false,
                wallBetweenPoints: newWallBetweenPoints,
                pinkSince: newWallBetweenPoints ? (ant.pinkSince || now) : null,
                pinkHistory
              };
            } else {
              const newDirection = Math.floor(Math.random() * 360);
              return {
                ...ant,
                direction: newDirection,
                phasing: true,
                wallBetweenPoints: newWallBetweenPoints,
                pinkSince: newWallBetweenPoints ? (ant.pinkSince || now) : null,
                pinkHistory
              };
            }
          }
          
          if (phasing) {
            const nowValid = isValidPosition(newPosition.x, newPosition.y, COLLISION_RADIUS);
            const nowNoCollision = !checkAntCollision(ant, newPosition);
            
            if (nowValid && nowNoCollision) {
              phasing = false;
            }
          }
          
          return {
            ...ant,
            position: newPosition,
            direction,
            phasing,
            wallBetweenPoints: newWallBetweenPoints,
            pinkSince: newWallBetweenPoints ? (pinkSince || now) : null,
            pinkHistory
          };
        });
      });
    }, ANT_MOVE_INTERVAL);
    
    return () => clearInterval(moveInterval);
  }, [ants.length, isValidPosition, checkAntCollision, isAntStuck, hasWallBetweenPoints]);

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
          width={ANT_SIZE}
          height={ANT_SIZE}
          showCollisionSphere={showCollisionSpheres}
          phasing={ant.phasing}
          insideWall={ant.insideWall}
          wallBetweenPoints={ant.wallBetweenPoints}
        />
      ))}
    </MazeContainer>
  );
};

export default Maze;