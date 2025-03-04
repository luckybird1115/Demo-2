import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import Image2D from './Image2D';
import { useState } from 'react';

import './Canvas.css';

const ThreeCanvas = ({ selectedImage, rectangleDimensions }) => {
  const [cameraParams, setCameraParams] = useState({
    // fov: 65.5,
    // near: 0.1,
    // far: 1000,
    // position: [-45, -1.5, 40],
    // rotation: [0, -Math.PI /7, 0]
    fov: 70,
    near: 0.1,
    far: 1000,
    position: [0, 0, 40],
    rotation: [0, 0, 0]
  });


  return (
    <div
      className="canvas-container"
    // style={{ backgroundImage: selectedImage ? `url(${selectedImage})` : 'none' }}
    >
      <Canvas
        style={{
          backgroundImage: selectedImage ? `url(${selectedImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          width: '100%',
          height: '100%'
        }}

      >
        {/* <OrbitControls /> */}
        <PerspectiveCamera
          makeDefault
          position={cameraParams.position}
          rotation={cameraParams.rotation}
          fov={cameraParams.fov}
          near={cameraParams.near}
          far={cameraParams.far}
        />
        {/* ... other scene elements ... */}
        {selectedImage && (
          <Image2D
            imageUrl={selectedImage}
            rectangleDimensions={rectangleDimensions}
            setCameraParams={setCameraParams}
          />
        )}
      </Canvas>
    </div>
  );
};

export default ThreeCanvas; 