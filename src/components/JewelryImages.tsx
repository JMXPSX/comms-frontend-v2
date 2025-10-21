import React from 'react';
import { JewelryImage } from '../services/apiService';
import './JewelryImages.css';

interface JewelryImagesProps {
  images: JewelryImage[];
  loading?: boolean;
}

const JewelryImages: React.FC<JewelryImagesProps> = ({ images, loading = false }) => {
  if (loading) {
    return (
      <div className="jewelry-images-container">
        <div className="jewelry-images-loading">
          <div className="loading-spinner"></div>
          <p>Loading jewelry images...</p>
        </div>
      </div>
    );
  }

  if (!images || images.length === 0) {
    return null;
  }

  const getImageSrc = (imagePath: string): string => {
    // Handle null/undefined/empty image path
    if (!imagePath || typeof imagePath !== 'string') {
      console.warn('Invalid image path:', imagePath);
      return '';
    }

    // Extract filename from the path (e.g., "images/filename.jpeg" -> "filename.jpeg")
    const filename = imagePath.split('/').pop();

    if (!filename) {
      console.warn('Could not extract filename from path:', imagePath);
      return '';
    }

    // Construct the full URL using the backend base URL
    return `http://localhost:8000/api/images/${filename}`;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('Failed to load jewelry image:', e.currentTarget.src);
    e.currentTarget.style.display = 'none';
  };

  return (
    <div className="jewelry-images-container">
      <h4 className="jewelry-images-title">Jewelry Images</h4>
      <div className="jewelry-images-grid">
        {images.map((item) => {
          const imageSrc = getImageSrc(item.image_data);
          // Only render if we have valid image path
          if (!imageSrc) {
            return null;
          }

          return (
            <div key={item.jewelry_item_id} className="jewelry-image-item">
              <img
                src={imageSrc}
                alt={`${item.weight}${item.unit_of_measure} ${item.purity} ${item.metal_type}`}
                title={`${item.weight}${item.unit_of_measure} ${item.purity} ${item.metal_type} - $${item.estimated_value.toFixed(2)}`}
                className="jewelry-image"
                loading="lazy"
                onError={handleImageError}
              />
              <div className="jewelry-image-description">
                <p><strong>{item.weight}{item.unit_of_measure}</strong> {item.purity} {item.metal_type}</p>
                <p>Est. Value: <strong>${item.estimated_value.toFixed(2)}</strong></p>
                <p>After Fees: <strong>${item.after_fees_value.toFixed(2)}</strong></p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JewelryImages;