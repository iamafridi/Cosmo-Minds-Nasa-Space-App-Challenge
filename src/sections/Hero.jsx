import React, { useEffect, useState, useCallback } from 'react';
import LocationModal from '../components/LocationModal';
import GlobeComponent from '../components/GlobeComponent';
import { generateStarsData } from '../constants/locationsData';

const Hero = () => {
  // State management
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [starsData, setStarsData] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generate stars data
  useEffect(() => {
    const stars = generateStarsData(1000);
    setStarsData(stars);

    // Simulate loading completion
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Handle location click
  const handleLocationClick = useCallback((location, event) => {
    setSelectedLocation(location);
    setIsModalOpen(true);
  }, []);

  // Handle modal close
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedLocation(null), 300); // Delay to allow animation
  }, []);

  // Loading state
  if (isLoading || dimensions.width === 0 || dimensions.height === 0) {
    return (
      <section className="fixed inset-0 w-screen h-screen flex justify-center items-center bg-[#0c0f1b] overflow-hidden">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg font-medium italic font-mono">Loading Global Network...</p>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Main Hero Section */}
      <section className="fixed inset-0 w-screen h-screen flex justify-center items-center bg-[#0c0f1b] overflow-hidden">
        {/* Background Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none z-10" />

        {/* Interactive Globe */}
        <GlobeComponent
          dimensions={dimensions}
          starsData={starsData}
          onLocationClick={handleLocationClick}
        />



        {/* Interactive Instructions */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center pointer-events-none z-20">
          <div className="bg-black/40 backdrop-blur-sm rounded-full px-6 py-3 border border-slate-600">
            <p className="text-slate-300 text-sm">
              🌍 Click on locations or labels • 🖱️ Drag to rotate • 📌 Scroll to zoom
            </p>
          </div>
        </div>
      </section>

      {/* Location Modal */}
      <LocationModal
        location={selectedLocation}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default Hero;