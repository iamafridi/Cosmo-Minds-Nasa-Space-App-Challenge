import { useEffect } from 'react';
import * as THREE from 'three';
import { starConfig } from '../constants/globeConfig';

const StarsEffect = ({ globeRef, starsData }) => {
    useEffect(() => {
        if (!globeRef.current || !starsData.length) return;

        const scene = globeRef.current.scene();

        // Create star geometry
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starsData.length * 3);

        starsData.forEach((star, i) => {
            positions[i * 3] = star.x;
            positions[i * 3 + 1] = star.y;
            positions[i * 3 + 2] = star.z;
        });

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Create star material
        const material = new THREE.PointsMaterial({
            color: starConfig.color,
            size: starConfig.size,
            sizeAttenuation: starConfig.sizeAttenuation,
            transparent: starConfig.transparent,
            opacity: starConfig.opacity,
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);

        // Animation loop
        const animate = () => {
            points.rotation.y += starConfig.rotationSpeed;
            requestAnimationFrame(animate);
        };
        animate();

        // Cleanup
        return () => {
            scene.remove(points);
            geometry.dispose();
            material.dispose();
        };
    }, [globeRef, starsData]);

    return null; // This component doesn't render anything directly
};

export default StarsEffect;