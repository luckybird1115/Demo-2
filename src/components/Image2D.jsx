import { useTexture, Line } from '@react-three/drei';
import { useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

const Image2D = ({ imageUrl, rectangleDimensions, setCameraParams }) => {
  const texture = useTexture(imageUrl);
  const [scale, setScale] = useState([1, 1, 1]);
  const [lines, setLines] = useState({ x: [], y: [], z: [] });
  const [drawingMode, setDrawingMode] = useState(null); // 'x', 'y', or 'z'
  const [currentLine, setCurrentLine] = useState(null);

  const [currentTempLine, setCurrentTempLine] = useState(null);
  const [tempLines, setTempLines] = useState({ x: [], y: [], z: [] });
  const { size, gl, camera } = useThree();
  const ratio = 1;

  useEffect(() => {
    if (texture) {
      const aspectRatio = texture.image.width / texture.image.height;
      // If image is wider than tall, scale width by aspect ratio
      // If image is taller than wide, scale height by inverse aspect ratio
      if (aspectRatio > 1) {
        setScale([ratio * aspectRatio, ratio, 1]);
      } else {
        setScale([ratio, ratio / aspectRatio, 1]);
      }
    }
  }, [texture]);

  // Calculate rectangle dimensions relative to the image scale
  const rectangleWidth = rectangleDimensions.width / scale[0];
  const rectangleHeight = rectangleDimensions.length / scale[1];

  const handlePointerDown = useCallback((e) => {

    if (!drawingMode) return;

    // Get canvas bounds
    const canvas = gl.domElement;
    const rect = canvas.getBoundingClientRect();

    console.log(e.clientX,  e.clientY, "testtttttt");
    // Calculate coordinates relative to canvas
    const x1 = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y1 = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const x = e.point.x;
    const y = e.point.y;

    setCurrentLine({ start: { x, y }, end: { x, y } });
    setCurrentTempLine({ start: { x1, y1 }, end: { x1, y1 } });
  }, [drawingMode, gl]);

  const handlePointerMove = useCallback((e) => {
    if (!currentLine) return;

    // Get canvas bounds
    const canvas = gl.domElement;
    const rect = canvas.getBoundingClientRect();

    // Calculate coordinates relative to canvas
    const x1 = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y1 = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const x = e.point.x;
    const y = e.point.y;

    setCurrentLine(prev => ({ ...prev, end: { x, y } }));
    setCurrentTempLine(prev => ({ ...prev, end: { x1, y1 } }));
  }, [currentLine, gl]);

  const handlePointerUp = useCallback(() => {
    if (!currentLine || !drawingMode) return;

    setLines(prev => ({
      ...prev,
      [drawingMode]: [...prev[drawingMode], currentLine]
    }));
    setCurrentLine(null);

    // Use screen coordinates (tempLines) for vanishing point calculations
    if (currentTempLine) {
      const prevTempLines = { ...tempLines };
      prevTempLines[drawingMode].push(currentTempLine);
      setTempLines(prevTempLines);
      
      // Calculate vanishing points if we have enough lines
      if (prevTempLines.x.length >= 2 || prevTempLines.y.length >= 2) {
        calculateVanishingPoints(prevTempLines);
      }
    }
  }, [currentLine, drawingMode, tempLines, currentTempLine]);

  const calculateVanishingPoints = useCallback((lines) => {
    // Convert normalized device coordinates to pixel coordinates
    const screenLines = {
      x: lines.x.map(line => ({
        start: { x: line.start.x1 * size.width/2, y: line.start.y1 * size.height/2 },
        end: { x: line.end.x1 * size.width/2, y: line.end.y1 * size.height/2 }
      })),
      y: lines.y.map(line => ({
        start: { x: line.start.x1 * size.width/2, y: line.start.y1 * size.height/2 },
        end: { x: line.end.x1 * size.width/2, y: line.end.y1 * size.height/2 }
      })),
      z: lines.z.map(line => ({
        start: { x: line.start.x1 * size.width/2, y: line.start.y1 * size.height/2 },
        end: { x: line.end.x1 * size.width/2, y: line.end.y1 * size.height/2 }
      }))
    };

    const xVanishingPoint = findVanishingPoint(screenLines.x);
    const yVanishingPoint = findVanishingPoint(screenLines.y);
    const zVanishingPoint = findVanishingPoint(screenLines.z);

    // Check if y lines are parallel (no vanishing point)
    if (xVanishingPoint && (!yVanishingPoint || isInfiniteVanishingPoint(yVanishingPoint))) {
      // Use z vanishing point instead if available
      if (zVanishingPoint) {
        const xVP = {
          x: xVanishingPoint.x / (size.width/2),
          y: xVanishingPoint.y / (size.height/2)
        };
        const zVP = {
          x: zVanishingPoint.x / (size.width/2),
          y: zVanishingPoint.y / (size.height/2)
        };

        // Calculate camera parameters using x and z vanishing points
        const fov = calculateFOV(xVP, zVP);
        const cameraRotation = calculateCameraRotationXZ(xVP, zVP);
        const cameraPosition = estimateCameraPosition(fov, cameraRotation);

        setCameraParams({
          fov,
          position: cameraPosition,
          rotation: cameraRotation,
          far: 1000
        });
      }
    } else if (xVanishingPoint && yVanishingPoint) {
      // Original case with x and y vanishing points
      const xVP = {
        x: xVanishingPoint.x / (size.width/2),
        y: xVanishingPoint.y / (size.height/2)
      };
      const yVP = {
        x: yVanishingPoint.x / (size.width/2),
        y: yVanishingPoint.y / (size.height/2)
      };

      const fov = calculateFOV(xVP, yVP);
      const cameraRotation = calculateCameraRotation(xVP, yVP);
      const cameraPosition = estimateCameraPosition(fov, cameraRotation);

      setCameraParams({
        fov,
        position: cameraPosition,
        rotation: cameraRotation,
        far: 1000
      });
    }
  }, [size.width, size.height, setCameraParams]);

  // Add keyboard controls for switching modes
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key.toLowerCase()) {
        case 'x':
          setDrawingMode('x');
          break;
        case 'y':
          setDrawingMode('y');
          break;
        case 'z':
          setDrawingMode('z');
          break;
        case 'escape':
          setDrawingMode(null);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);



  // Helper functions
  function findVanishingPoint(lines) {
    if (lines.length < 2) return null;

    // We'll use least squares method to find the best intersection point
    let intersections = [];
    
    // Find all possible intersections between pairs of lines
    for (let i = 0; i < lines.length - 1; i++) {
      for (let j = i + 1; j < lines.length; j++) {
        const line1 = lines[i];
        const line2 = lines[j];

        // Convert to vector form: ax + by + c = 0
        const a1 = line1.end.y - line1.start.y;
        const b1 = line1.start.x - line1.end.x;
        const c1 = line1.end.x * line1.start.y - line1.start.x * line1.end.y;

        const a2 = line2.end.y - line2.start.y;
        const b2 = line2.start.x - line2.end.x;
        const c2 = line2.end.x * line2.start.y - line2.start.x * line2.end.y;

        // Find intersection
        const determinant = a1 * b2 - a2 * b1;
        
        if (Math.abs(determinant) > 0.0001) { // Check if lines are not parallel
          const x = (b1 * c2 - b2 * c1) / determinant;
          const y = (c1 * a2 - c2 * a1) / determinant;
          intersections.push({ x, y });
        }
      }
    }

    if (intersections.length === 0) return null;

    // Calculate the average intersection point
    const avgPoint = intersections.reduce(
      (acc, point) => ({
        x: acc.x + point.x / intersections.length,
        y: acc.y + point.y / intersections.length
      }),
      { x: 0, y: 0 }
    );

    return avgPoint;
  }

  function calculateFOV(xVP, yVP) {
    // Calculate the angle between vanishing points
    const vpDistance = Math.sqrt(
      Math.pow(xVP.x - yVP.x, 2) + Math.pow(xVP.y - yVP.y, 2)
    );

    // Estimate FOV based on vanishing point positions
    // Assuming 90-degree angle between actual 3D directions
    const angle = Math.atan2(vpDistance, 2) * 2;
    return THREE.MathUtils.radToDeg(angle * 1.2); // Adjust multiplier as needed
  }

  function calculateCameraRotation(xVP, yVP) {
    // Calculate rotation based on vanishing point positions
    const yaw = Math.atan2(xVP.x, 2); // Use 2 as reference distance
    const pitch = Math.atan2(yVP.y, 2);

    return new THREE.Euler(
      -pitch, // Negative pitch because Y is up in Three.js
      yaw,
      0,
      'XYZ'
    );
  }

  function estimateCameraPosition(fov, rotation) {
    // Convert FOV to radians
    const fovRad = THREE.MathUtils.degToRad(fov);

    // Estimate distance based on FOV
    // We want the image plane to fill most of the view
    const distance = 1 / Math.tan(fovRad / 4);

    // Create position vector
    const position = new THREE.Vector3(0, 0, distance);

    // Apply rotation to position
    position.applyEuler(rotation);

    return position;
  }

  // Helper function to check if vanishing point is effectively at infinity
  function isInfiniteVanishingPoint(point) {
    const threshold = 1e6; // Adjust this threshold as needed
    return Math.abs(point.x) > threshold || Math.abs(point.y) > threshold;
  }

  // New function to calculate camera rotation using X and Z vanishing points
  function calculateCameraRotationXZ(xVP, zVP) {
    const yaw = Math.atan2(xVP.x, 2);
    const roll = Math.atan2(zVP.x, 2);
    
    // Assuming camera is level (no pitch) when using X and Z vanishing points
    return new THREE.Euler(
      0, // No pitch
      yaw,
      roll,
      'XYZ'
    );
  }

  return (
    <group
    >
      {/* Original image plane */}
      <mesh position={[0, 0, 0]} scale={scale}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <planeGeometry args={[size.width, size.height]} />
        <meshBasicMaterial color="grey" transparent={true} opacity={0.5} />
      </mesh>

      <mesh position={[0, 0, 0]} >
        <planeGeometry args={[20, 10]} />
        <meshBasicMaterial color="green" transparent={true} opacity={0.5} />
      </mesh>

      {/* Draw lines */}
      {Object.entries(lines).map(([axis, axisLines]) =>
        axisLines.map((line, i) => (
          <Line
            key={`${axis}-${i}`}
            points={[
              [line.start.x, line.start.y, 0.01],
              [line.end.x, line.end.y, 0.01]
            ]}
            color={axis === 'x' ? 'red' : axis === 'y' ? 'green' : 'blue'}
            lineWidth={2}
          />
        ))
      )}

      {/* Draw current line */}
      {currentLine && currentLine.start && currentLine.end && drawingMode && (
        <Line
          points={[
            [currentLine.start.x, currentLine.start.y, 0.01],
            [currentLine.end.x, currentLine.end.y, 0.01]
          ]}
          color={drawingMode === 'x' ? 'red' : drawingMode === 'y' ? 'green' : 'blue'}
          lineWidth={2}
        />
      )}
    </group>
  );
};


export default Image2D; 