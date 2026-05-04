import { useRef, useCallback, useMemo, useEffect, useState } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import { colors, generateArcsData, locations } from '../constants/locationsData';

export default function GlobeComponent({ dimensions, starsData = [], onLocationClick, orbitalPeriodMs = 14000, orbitInclinationDeg = 35, orbitAltitudeRatio = 2.4 }) {
  const globeRef = useRef(null);
  const arcsRef = useRef(generateArcsData());
  const [arcsData, setArcsData] = useState(() => generateArcsData());
  const [ready, setReady] = useState(false);
  const satRef = useRef(null);
  const satAngle = useRef(0);
  const rafRef = useRef(null);
  const hoveredRef = useRef(null);
  const [hoveredId, setHoveredId] = useState(null);

  const isMobile = dimensions.width < 768;
  const size = isMobile ? Math.min(dimensions.width * 0.9, 360) : Math.min(dimensions.width * 0.5, 520);

  // Arc refresh — low frequency, no cascade
  useEffect(() => {
    const id = setInterval(() => setArcsData(generateArcsData()), 5000);
    return () => clearInterval(id);
  }, []);

  const handleReady = useCallback(() => {
    setReady(true);
    const g = globeRef.current;
    if (!g) return;

    const ctrl = g.controls();
    ctrl.autoRotate = true;
    ctrl.autoRotateSpeed = 0.28;
    ctrl.enableDamping = true;
    ctrl.dampingFactor = 0.06;
    ctrl.minDistance = 140;
    ctrl.maxDistance = 550;
    ctrl.enableZoom = true;

    const cam = g.camera();
    cam.position.set(0, 0, 270);
    cam.fov = 48;
    cam.updateProjectionMatrix();

    const scene = g.scene();

    // Rich atmosphere shell
    const atmoGeo = new THREE.SphereGeometry(102, 64, 64);
    const atmoMat = new THREE.ShaderMaterial({
      uniforms: {},
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0,0,1.0)), 3.0);
          gl_FragColor = vec4(0.2, 0.55, 1.0, 1.0) * intensity * 0.7;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      transparent: true,
    });
    scene.add(new THREE.Mesh(atmoGeo, atmoMat));

    // Satellite
    const sat = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xccddee, metalness: 0.8, roughness: 0.2 });
    sat.add(new THREE.Mesh(new THREE.BoxGeometry(5, 3, 2), bodyMat));
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x1a4fa8, metalness: 0.4, roughness: 0.5, emissive: 0x0a2050, emissiveIntensity: 0.5 });
    const lp = new THREE.Mesh(new THREE.BoxGeometry(10, 3.5, 0.25), panelMat);
    lp.position.set(-10, 0, 0);
    const rp = lp.clone(); rp.position.set(10, 0, 0);
    const antMat = new THREE.MeshStandardMaterial({ color: 0xddeeff, metalness: 0.95 });
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4, 6), antMat);
    ant.position.set(0, 3, 0);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x44aaff, transparent: true, opacity: 0.15 });
    sat.add(lp, rp, ant, new THREE.Mesh(new THREE.SphereGeometry(3.5, 12, 12), glowMat));
    satRef.current = sat;
    scene.add(sat);

    // Orbit ring
    const R = 100 * orbitAltitudeRatio;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(R, 0.18, 6, 200),
      new THREE.MeshBasicMaterial({ color: 0x4488ff, transparent: true, opacity: 0.14 })
    );
    ring.rotation.x = THREE.MathUtils.degToRad(orbitInclinationDeg);
    scene.add(ring);

    // Lights
    scene.add(new THREE.AmbientLight(0x223355, 1.2));
    const sun = new THREE.DirectionalLight(0xfff5dd, 2.0);
    sun.position.set(500, 200, 300);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0x335577, 0.4);
    fill.position.set(-300, -100, -200);
    scene.add(fill);
  }, [orbitAltitudeRatio, orbitInclinationDeg]);

  // Satellite animation
  useEffect(() => {
    if (!ready || !satRef.current) return;
    const R = 100 * orbitAltitudeRatio;
    const inc = THREE.MathUtils.degToRad(orbitInclinationDeg);
    const tick = () => {
      satAngle.current += (Math.PI * 2) / (orbitalPeriodMs / 16.67);
      const a = satAngle.current;
      satRef.current.position.set(R * Math.cos(a), R * Math.sin(a) * Math.sin(inc), R * Math.sin(a) * Math.cos(inc));
      satRef.current.lookAt(0, 0, 0);
      satRef.current.rotateY(Math.PI / 2);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [ready, orbitalPeriodMs, orbitAltitudeRatio, orbitInclinationDeg]);

  const pts = useMemo(() => locations.map(l => ({
    ...l,
    size: hoveredId === l.id ? 1.8 : 1.1,
    color: hoveredId === l.id ? '#ffffff' : colors[l.id % colors.length],
  })), [hoveredId]);

  const handleHover = useCallback((p) => {
    const newId = p ? p.id : null;
    if (hoveredRef.current !== newId) {
      hoveredRef.current = newId;
      setHoveredId(newId);
    }
  }, []);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size + 60, height: size + 60 }}>
      {/* Layered glow */}
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle, rgba(68,140,255,0.18) 30%, rgba(20,60,180,0.08) 60%, transparent 80%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: -20, borderRadius: '50%', boxShadow: '0 0 80px 30px rgba(50,120,255,0.12), 0 0 160px 60px rgba(20,60,180,0.07)', pointerEvents: 'none' }} />
      <div className="animate-globeGlow" style={{ position: 'relative', zIndex: 2 }}>
        <Globe
          ref={globeRef}
          width={size} height={size}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          showAtmosphere={true}
          atmosphereColor="#3a8fff"
          atmosphereAltitude={0.22}
          arcsData={arcsData}
          arcColor="color"
          arcDashLength={() => 0.35}
          arcDashGap={() => 0.2}
          arcDashAnimateTime={() => 1800}
          arcStroke={() => 0.5}
          arcAltitude={() => 0.15}
          pointsData={pts}
          pointAltitude={0.008}
          pointRadius="size"
          pointColor="color"
          pointLabel={d => `<div style="background:rgba(3,12,40,.96);border:1px solid rgba(100,180,255,.45);border-radius:12px;padding:8px 14px;font-family:Nunito,sans-serif;font-size:13px;color:#e8f4ff;font-weight:700;white-space:nowrap;box-shadow:0 4px 24px rgba(0,40,120,.5)">${d.name}<br><span style="font-size:10px;color:rgba(140,190,255,.65);font-weight:500">${d.region || ''}</span></div>`}
          onPointClick={onLocationClick}
          onPointHover={handleHover}
          onGlobeReady={handleReady}
          rendererConfig={{ antialias: true, alpha: true, powerPreference: 'high-performance', precision: 'mediump' }}
        />
      </div>
    </div>
  );
}
