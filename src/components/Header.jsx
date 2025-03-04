import React  from 'react';

const Header = ({onImageSelect, setIsModalOpen}) => {

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      onImageSelect(imageUrl);
      setIsModalOpen(true);
    }
  };

  return (
    <header className="header">
      {/* ... other header items ... */}
      <div className="toolbar-item">
        <input
          type="file"
          accept="image/*"
          id="imageUpload"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => document.getElementById('imageUpload').click()}
          className="upload-btn"
        >
          Import 2D Photo
        </button>
      </div>
    </header>
  );
};

export default Header; 