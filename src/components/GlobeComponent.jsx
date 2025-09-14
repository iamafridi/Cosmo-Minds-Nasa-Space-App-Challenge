import React, { useRef, useCallback } from 'react';
import Globe from 'react-globe.gl';
import { colors, generateArcsData, locations } from '../constants/locationsData';
import StarsEffect from './StarsEffect';
import { globeConfig } from '../constants/globeConfig';

const GlobeComponent = ({
    dimensions,
    starsData,
    onLocationClick
}) => {
    const globeRef = useRef();
    const arcsData = generateArcsData();

    // Handle point click with enhanced interaction
    const handlePointClick = useCallback((point, event) => {
        if (onLocationClick && point) {
            // Add some visual feedback
            const globe = globeRef.current;
            if (globe) {
                // Animate to the clicked point
                globe.pointOfView({
                    lat: point.lat,
                    lng: point.lng,
                    altitude: 2
                }, 1000);
            }

            onLocationClick(point, event);
        }
    }, [onLocationClick]);

    // Handle label click as well
    const handleLabelClick = useCallback((label, event) => {
        console.log('Label clicked:', label); // Debug log
        if (onLocationClick && label) {
            // Add some visual feedback
            const globe = globeRef.current;
            if (globe) {
                // Animate to the clicked point
                globe.pointOfView({
                    lat: label.lat,
                    lng: label.lng,
                    altitude: 2
                }, 1000);
            }

            onLocationClick(label, event);
        }
    }, [onLocationClick]);

    // Enhanced point hover effects
    const handlePointHover = useCallback((point, prevPoint) => {
        const globe = globeRef.current;
        if (!globe) return;

        // Change cursor style
        globe.controls().domElement.style.cursor = point ? 'pointer' : 'grab';
    }, []);

    return (
        <>
            <Globe
                ref={globeRef}
                width={dimensions.width}
                height={dimensions.height}

                // Globe settings
                globeImageUrl={globeConfig.globeImageUrl}
                backgroundColor={globeConfig.backgroundColor}
                enablePointerInteraction={globeConfig.enablePointerInteraction}

                // Animated arcs
                arcsData={arcsData}
                arcStartLat={d => d.startLat}
                arcStartLng={d => d.startLng}
                arcEndLat={d => d.endLat}
                arcEndLng={d => d.endLng}
                arcColor={d => d.color}
                arcStroke={globeConfig.arcStroke}
                arcDashLength={globeConfig.arcDashLength}
                arcDashGap={globeConfig.arcDashGap}
                arcDashAnimateTime={globeConfig.arcDashAnimateTime}
                arcDashInitialGap={() => Math.random()}

                // Interactive points
                pointsData={locations}
                pointLat={d => d.lat}
                pointLng={d => d.lng}
                pointColor={() => colors[Math.floor(Math.random() * colors.length)]}
                pointRadius={globeConfig.pointRadius}
                pointAltitude={globeConfig.pointAltitude}
                onPointClick={handlePointClick}
                onPointHover={handlePointHover}

                // Pulsing rings
                ringsData={locations}
                ringLat={d => d.lat}
                ringLng={d => d.lng}
                ringMaxRadius={globeConfig.ringMaxRadius}
                ringPropagationSpeed={globeConfig.ringPropagationSpeed}
                ringRepeatPeriod={globeConfig.ringRepeatPeriod}
                ringColor={() => colors[Math.floor(Math.random() * colors.length)]}

                // Location labels (also clickable)
                labelsData={locations}
                labelLat={d => d.lat}
                labelLng={d => d.lng}
                labelText={d => d.name}
                labelSize={globeConfig.labelSize}
                labelColor={() => globeConfig.labelColor}
                labelAltitude={globeConfig.labelAltitude}
                labelDotRadius={0.3}
                labelResolution={2}
                onLabelClick={handleLabelClick}
                onLabelHover={handlePointHover}

                // Atmosphere
                showAtmosphere={globeConfig.showAtmosphere}
                atmosphereColor={globeConfig.atmosphereColor}
                atmosphereAltitude={globeConfig.atmosphereAltitude}

                // Camera controls
                cameraMinDistance={globeConfig.cameraMinDistance}
                cameraMaxDistance={globeConfig.cameraMaxDistance}
            />

            {/* Stars effect component */}
            <StarsEffect
                globeRef={globeRef}
                starsData={starsData}
            />
        </>
    );
};

export default GlobeComponent;