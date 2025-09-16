import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, RotateCcw, Info, Thermometer, Zap, Building2, Menu } from 'lucide-react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const TerraEarthGame = () => {
    const globeEl = useRef();
    const controlRef = useRef();
    const climatePanelRef = useRef();

    const [selectedCountry, setSelectedCountry] = useState(null);
    const [activePanel, setActivePanel] = useState('climate');
    const [yearIndex, setYearIndex] = useState(0);
    const [showInfo, setShowInfo] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);
    const [showControlPanel, setShowControlPanel] = useState(true);

    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    const [panelPosition, setPanelPosition] = useState({
        x: Math.max(0, window.innerWidth / 2 - 170), // Centered (340px wide panel → half is 170)
        y: window.innerHeight - 220, // Near bottom
    });

    const [climatePanelPosition, setClimatePanelPosition] = useState({
        x: 40,
        y: 40,
    });

    const draggingRef = useRef(false);
    const draggingClimateRef = useRef(false);
    const lastPosRef = useRef({ x: 0, y: 0 });

    const years = Array.from({ length: 25 }, (_, i) => 2000 + i);

    const countryData = useMemo(
        () => ({
            'United Kingdom': {
                lat: 55.3781,
                lng: -3.436,
                emoji: '🇬🇧',
                climate: {
                    temperature: Array(25).fill().map(() => 10 + Math.random() * 5),
                    co2: Array(25).fill().map(() => 500 + Math.random() * 50),
                },
                disasters: {
                    earthquakes: Array(25).fill().map(() => Math.floor(Math.random() * 5)),
                    floods: Array(25).fill().map(() => Math.floor(Math.random() * 3)),
                },
                urban: { population: Array(25).fill().map(() => 80 + Math.random() * 5) },
            },
            Bangladesh: {
                lat: 23.685,
                lng: 90.3563,
                emoji: '🇧🇩',
                climate: {
                    temperature: Array(25).fill().map(() => 25 + Math.random() * 3),
                    co2: Array(25).fill().map(() => 100 + Math.random() * 30),
                },
                disasters: {
                    earthquakes: Array(25).fill().map(() => Math.floor(Math.random() * 2)),
                    floods: Array(25).fill().map(() => Math.floor(Math.random() * 10)),
                },
                urban: { population: Array(25).fill().map(() => 35 + Math.random() * 5) },
            },
            Australia: {
                lat: -25.2744,
                lng: 133.7751,
                emoji: '🇦🇺',
                climate: {
                    temperature: Array(25).fill().map(() => 22 + Math.random() * 5),
                    co2: Array(25).fill().map(() => 300 + Math.random() * 50),
                },
                disasters: {
                    earthquakes: Array(25).fill().map(() => Math.floor(Math.random() * 3)),
                    floods: Array(25).fill().map(() => Math.floor(Math.random() * 2)),
                },
                urban: { population: Array(25).fill().map(() => 85 + Math.random() * 5) },
            },
            Brazil: {
                lat: -14.235,
                lng: -51.9253,
                emoji: '🇧🇷',
                climate: {
                    temperature: Array(25).fill().map(() => 27 + Math.random() * 3),
                    co2: Array(25).fill().map(() => 400 + Math.random() * 50),
                },
                disasters: {
                    earthquakes: Array(25).fill().map(() => 0),
                    floods: Array(25).fill().map(() => Math.floor(Math.random() * 5)),
                },
                urban: { population: Array(25).fill().map(() => 90 + Math.random() * 5) },
            },
            Canada: {
                lat: 56.1304,
                lng: -106.3468,
                emoji: '🇨🇦',
                climate: {
                    temperature: Array(25).fill().map(() => -5 + Math.random() * 5),
                    co2: Array(25).fill().map(() => 600 + Math.random() * 50),
                },
                disasters: {
                    earthquakes: Array(25).fill().map(() => 1),
                    floods: Array(25).fill().map(() => Math.floor(Math.random() * 3)),
                },
                urban: { population: Array(25).fill().map(() => 70 + Math.random() * 5) },
            },
        }),
        []
    );

    const markerData = useMemo(
        () =>
            Object.entries(countryData).map(([name, data]) => ({
                name,
                lat: data.lat,
                lng: data.lng,
                emoji: data.emoji,
                climate: data.climate,
                disasters: data.disasters,
                urban: data.urban,
            })),
        [countryData]
    );

    const createMarker = (d) => {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 256, 64);
        ctx.font = '48px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'yellow';
        ctx.fillText(`📍 ${d.name}`, 128, 32);
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture, depthTest: false });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(14, 4, 1);
        sprite.userData = d;
        sprite.raycast = THREE.Sprite.prototype.raycast;
        return sprite;
    };

    useEffect(() => {
        if (!globeEl.current) return;
        const controls = globeEl.current.controls();
        controls.autoRotate = isPlaying;
        controls.autoRotateSpeed = 0.5;
    }, [isPlaying]);

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
            // Reposition control panel on resize
            setPanelPosition(prev => ({
                ...prev,
                x: Math.max(0, window.innerWidth / 2 - 170),
            }));
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleMarkerClick = (d) => {
        setSelectedCountry(d);
        globeEl.current.pointOfView({ lat: d.lat, lng: d.lng, altitude: 2.2 }, 1000);
    };

    const startDrag = (clientX, clientY, type = "control") => {
        if (type === "control") draggingRef.current = true;
        if (type === "climate") draggingClimateRef.current = true;
        lastPosRef.current = { x: clientX, y: clientY };
        document.body.style.userSelect = 'none';
        document.body.style.touchAction = 'none';
    };

    const stopDrag = () => {
        draggingRef.current = false;
        draggingClimateRef.current = false;
        document.body.style.userSelect = '';
        document.body.style.touchAction = '';
    };

    const onWindowPointerMove = (e) => {
        let clientX, clientY;

        if (e.type.startsWith('touch')) {
            if (!e.touches || e.touches.length === 0) return;
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const dx = clientX - lastPosRef.current.x;
        const dy = clientY - lastPosRef.current.y;
        lastPosRef.current = { x: clientX, y: clientY };

        if (draggingRef.current) {
            setPanelPosition((prev) => ({
                x: Math.min(windowSize.width - 340, Math.max(0, prev.x + dx)),
                y: Math.min(windowSize.height - 200, Math.max(0, prev.y + dy)),
            }));
        }
        if (draggingClimateRef.current) {
            setClimatePanelPosition((prev) => ({
                x: Math.min(windowSize.width - 320, Math.max(0, prev.x + dx)),
                y: Math.min(windowSize.height - 400, Math.max(0, prev.y + dy)),
            }));
        }

        if (e.cancelable) {
            e.preventDefault();
        }
    };

    useEffect(() => {
        window.addEventListener('mousemove', onWindowPointerMove);
        window.addEventListener('touchmove', onWindowPointerMove, { passive: false });
        window.addEventListener('mouseup', stopDrag);
        window.addEventListener('touchend', stopDrag);
        window.addEventListener('touchcancel', stopDrag);

        return () => {
            window.removeEventListener('mousemove', onWindowPointerMove);
            window.removeEventListener('touchmove', onWindowPointerMove);
            window.removeEventListener('mouseup', stopDrag);
            window.removeEventListener('touchend', stopDrag);
            window.removeEventListener('touchcancel', stopDrag);
        };
    }, [windowSize]);

    const scrollPanel = (direction) => {
        if (!climatePanelRef.current) return;
        const scrollAmount = direction === 'up' ? -100 : 100;
        climatePanelRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    };

    const renderDataPanel = () => {
        if (!selectedCountry) return null;
        const { name, emoji, climate, disasters, urban } = selectedCountry;

        const panels = {
            climate: {
                title: 'Climate',
                icon: <Thermometer className="w-4 h-4" />,
                color: 'from-red-500 to-yellow-400',
                data: [
                    { label: 'Temperature (°C)', value: climate.temperature[yearIndex], trend: climate.temperature },
                    { label: 'CO₂ Emissions (Mt)', value: climate.co2[yearIndex], trend: climate.co2 },
                ],
            },
            disasters: {
                title: 'Disasters',
                icon: <Zap className="w-4 h-4" />,
                color: 'from-purple-500 to-pink-500',
                data: [
                    { label: 'Earthquakes', value: disasters.earthquakes[yearIndex], trend: disasters.earthquakes },
                    { label: 'Floods', value: disasters.floods[yearIndex], trend: disasters.floods },
                ],
            },
            urban: {
                title: 'Urbanization',
                icon: <Building2 className="w-4 h-4" />,
                color: 'from-green-400 to-teal-400',
                data: [{ label: 'Urban Population (%)', value: urban.population[yearIndex], trend: urban.population }],
            },
        };

        const currentPanel = panels[activePanel];
        const chartData = {
            labels: years,
            datasets: currentPanel.data.map((item, idx) => ({
                label: item.label,
                data: item.trend,
                fill: false,
                borderColor: ['#F87171', '#8B5CF6', '#10B981'][idx % 3],
                tension: 0.3,
            })),
        };
        const chartOptions = {
            responsive: true,
            plugins: {
                legend: { labels: { color: 'white' } },
                title: { display: true, text: currentPanel.title + ' Trends', color: 'white', font: { size: 14 } },
            },
            scales: { x: { ticks: { color: 'white' } }, y: { ticks: { color: 'white' } } },
        };

        const isMobile = windowSize.width < 640;

        return (
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{
                    ...(isMobile
                        ? {
                            left: 0,
                            bottom: 0,
                            top: 'auto',
                            right: 'auto',
                            position: 'fixed',
                        }
                        : {
                            left: `${climatePanelPosition.x}px`,
                            top: `${climatePanelPosition.y}px`,
                            position: 'absolute',
                        }
                    ),
                }}
                className={`${isMobile ? 'w-full rounded-t-lg max-h-[80vh] overflow-y-auto relative' : 'w-[320px] rounded-xl'}
                    bg-blue-950/80 p-4 backdrop-blur-sm z-50`}
                ref={climatePanelRef}
            >
                <div
                    className="w-full mb-2 pt-3 pb-2 flex justify-center cursor-grab active:cursor-grabbing"
                    onMouseDown={(e) => {
                        startDrag(e.clientX, e.clientY, "climate");
                    }}
                    onTouchStart={(e) => {
                        if (e.touches && e.touches.length > 0) {
                            const touch = e.touches[0];
                            startDrag(touch.clientX, touch.clientY, "climate");
                        }
                    }}
                >
                    <div className="w-16 h-2 bg-gray-500 rounded-full" />
                </div>

                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-white font-bold text-lg">
                        {emoji} {name} - {years[yearIndex]}
                    </h3>
                    <button onClick={() => setSelectedCountry(null)} className="text-gray-400 hover:text-white text-xl">
                        ×
                    </button>
                </div>

                <div className="flex mb-4 flex-wrap gap-1 bg-gray-800 rounded-lg p-1">
                    {Object.entries(panels).map(([key, panel]) => (
                        <button
                            key={key}
                            onClick={() => setActivePanel(key)}
                            className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${activePanel === key
                                ? `bg-gradient-to-r ${panel.color} text-white`
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {panel.icon}
                            <span className="hidden sm:inline">{panel.title}</span>
                        </button>
                    ))}
                </div>

                <div className="h-48 mb-4">
                    <Line data={chartData} options={chartOptions} />
                </div>

                {currentPanel.data.map((item, idx) => (
                    <div key={idx} className="bg-orange-500/80 rounded p-2 mt-2">
                        <div className="text-sm font-medium">{item.label}</div>
                        <div className="text-lg font-bold">{item.value.toFixed(2)}</div>
                        <div className="w-full bg-black/30 rounded-full h-2 mt-1">
                            <div
                                className="bg-white rounded-full h-2 transition-all duration-500"
                                style={{
                                    width: `${Math.min(
                                        100,
                                        Math.abs(item.trend[yearIndex]) / Math.max(...item.trend.map(Math.abs)) * 100
                                    )}%`,
                                }}
                            />
                        </div>
                    </div>
                ))}

                {/* ▲▼ Floating Scroll buttons on RIGHT SIDE */}
                {isMobile && (
                    <div className="absolute mt-2 right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 z-10">
                        <button
                            onClick={() => scrollPanel('up')}
                            className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full text-white shadow-lg"
                            aria-label="Scroll Up"
                        >
                            ▲
                        </button>
                        <button
                            onClick={() => scrollPanel('down')}
                            className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full text-white shadow-lg"
                            aria-label="Scroll Down"
                        >
                            ▼
                        </button>
                    </div>
                )}
            </motion.div>
        );
    };

    return (
        <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
            <Navbar />
            <Globe
                ref={globeEl}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                objectsData={markerData}
                objectThreeObject={createMarker}
                objectLat={(d) => d.lat}
                objectLng={(d) => d.lng}
                onObjectClick={handleMarkerClick}
                width={windowSize.width}
                height={windowSize.height}
                enablePointerInteraction
            />

            {renderDataPanel()}

            {/* Control Panel — NOW VISIBLE ON ALL DEVICES */}
            <AnimatePresence>
                {showControlPanel && (
                    <motion.div
                        ref={controlRef}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        style={{
                            left: panelPosition.x,
                            top: panelPosition.y,
                            position: 'absolute',
                            width: 340,
                        }}
                        className="pointer-events-auto bg-black/90 backdrop-blur-md p-4 flex flex-col gap-3 w-[340px] rounded-xl z-[99999]"
                    >
                        <div
                            className="w-full flex items-center justify-between cursor-grab mb-3"
                            onMouseDown={(e) => startDrag(e.clientX, e.clientY, "control")}
                            onTouchStart={(e) => {
                                if (e.touches && e.touches.length > 0) {
                                    const touch = e.touches[0];
                                    startDrag(touch.clientX, touch.clientY, "control");
                                }
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-2 bg-gray-600 rounded-full" />
                                <div className="w-8 h-2 bg-gray-600 rounded-full" />
                            </div>

                            <button
                                onClick={() => setShowControlPanel(false)}
                                className="text-gray-400 hover:text-white font-bold text-xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="flex items-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg text-white font-medium text-sm"
                                >
                                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                    {isPlaying ? 'Pause' : 'Play'}
                                </button>
                                <button
                                    onClick={() => {
                                        setYearIndex(0);
                                        setSelectedCountry(null);
                                        globeEl.current?.pointOfView({ altitude: 2.5 }, 1000);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-medium text-sm"
                                >
                                    <RotateCcw className="w-4 h-4" /> Reset
                                </button>
                                <button
                                    onClick={() => setShowInfo(true)}
                                    className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-medium text-sm"
                                >
                                    <Info className="w-4 h-4" /> Info
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-white text-sm font-medium">Year:</span>
                            <input
                                type="range"
                                min="0"
                                max={years.length - 1}
                                value={yearIndex}
                                onChange={(e) => setYearIndex(+e.target.value)}
                                className="flex-1 accent-teal-500"
                            />
                            <span className="text-white text-lg font-bold min-w-[4rem]">{years[yearIndex]}</span>

                            <button
                                onClick={() => setYearIndex(prev => Math.max(0, prev - 1))}
                                disabled={yearIndex === 0}
                                className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white font-bold text-lg flex items-center justify-center"
                            >
                                −
                            </button>

                            <button
                                onClick={() => setYearIndex(prev => Math.min(years.length - 1, prev + 1))}
                                disabled={yearIndex === years.length - 1}
                                className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white font-bold text-lg flex items-center justify-center"
                            >
                                +
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hamburger button for mobile when panel is closed */}
            {windowSize.width < 640 && !showControlPanel && (
                <motion.button
                    onClick={() => setShowControlPanel(true)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-4 left-4 z-[99999] bg-black/80 backdrop-blur-sm p-3 rounded-full text-white hover:bg-gray-800 transition-all"
                >
                    <Menu className="w-6 h-6" />
                </motion.button>
            )}

            {showInfo && (
                <div
                    className={`absolute z-50 bg-black/80 backdrop-blur-sm rounded-lg p-4
          ${windowSize.width < 640 ? 'top-0 left-0 w-full rounded-t-lg max-h-[60vh] overflow-y-auto' : 'top-4 right-4 max-w-sm'}`}
                >
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-white font-bold text-lg">Terra Earth Explorer</h2>
                        <button onClick={() => setShowInfo(false)} className="text-gray-400 hover:text-white">
                            ×
                        </button>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">
                        <strong>Drag to rotate</strong> the Earth.
                        <br />
                        Click on markers to see 25 years of NASA Terra data.
                    </p>
                    <div className="text-xs text-gray-400">Team CosmoMinds • Terra Data Visualization</div>
                </div>
            )}
        </div>
    );
};

export default TerraEarthGame;