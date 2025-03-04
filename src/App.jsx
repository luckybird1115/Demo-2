import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import ThreeCanvas from './components/Canvas';
import DimensionsModal from './components/Modal';

const App = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rectangleDimensions, setRectangleDimensions] = useState({
    width: 0,
    length: 0
  });

  const handleDimensionsConfirm = (dimensions) => {
    // Here you'll add the logic to create and place the rectangle
    console.log('Rectangle dimensions:', dimensions);
    setRectangleDimensions(dimensions);
    // Add your rectangle creation logic here
    // This should integrate with your existing perspective transformation code
  };


  return (
    <div className="app">
      <div className="headerbar">
        <Header onImageSelect={setSelectedImage} setIsModalOpen={setIsModalOpen} />
      </div>
      <DimensionsModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDimensionsConfirm}
      />
      <div className="canvas-container">
        <ThreeCanvas selectedImage={selectedImage} rectangleDimensions={rectangleDimensions} />
      </div>

    </div>
  );
};

export default App;
