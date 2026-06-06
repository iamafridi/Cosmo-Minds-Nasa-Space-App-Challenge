import { useEffect, useState, useCallback, useRef, memo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, Shuffle, BookOpen, Gamepad2, Link as LinkIcon, XCircle } from 'lucide-react';
import LocationModal from '../components/LocationModal';
import GlobeComponent from '../components/GlobeComponent';
import CommandPalette from '../components/CommandPalette';
import Alert from '../components/Alert';
import Navbar from './Navbar';
import { generateStarsData, locations } from '../constants/locationsData';

const STORY = [
  { speaker: 'kid',   text: "Wow… 🌍 Is that really our planet from space?!" },
  { speaker: 'astro', text: "It sure is! Every blue bit is ocean, every green is forest. Terra watches it all!" },
  { speaker: 'kid',   text: "Why are some parts getting hotter? Even my village feels different now…" },
  { speaker: 'astro', text: "That's climate change — NASA's Terra satellite tracked it for 25 years!" },
  { speaker: 'kid',   text: "Can we fix it? I want to plant trees and help! 🌱" },
  { speaker: 'astro', text: "Yes! Tap any glowing dot on the globe to explore countries together!" },
];

// ── Pure canvas starfield ──
const CanvasStarfield = memo(function CanvasStarfield() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    let W = c.width = innerWidth, H = c.height = innerHeight;
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.5 + 0.2,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      ph: Math.random() * Math.PI * 2,
    }));
    let t = 0, id;
    const draw = () => {
      t += 0.008;
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        s.x = (s.x + s.vx + W) % W;
        s.y = (s.y + s.vy + H) % H;
        const a = 0.2 + 0.18 * Math.sin(t + s.ph);
        ctx.fillStyle = `rgba(180,215,255,${a})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
      }
      id = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { W = c.width = innerWidth; H = c.height = innerHeight; };
    addEventListener('resize', resize);
    return () => { cancelAnimationFrame(id); removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} className="fixed inset-0 z-0 pointer-events-none" />;
});

// ── Shooting stars ──
const ShootingStars = memo(function ShootingStars() {
  const [stars, setStars] = useState([]);
  useEffect(() => {
    const fire = () => {
      const id = Date.now();
      setStars(s => [...s.slice(-3), { id, top: `${Math.random() * 45}%`, left: `${Math.random() * 70}%` }]);
      setTimeout(() => setStars(s => s.filter(x => x.id !== id)), 1100);
    };
    const t = setInterval(fire, 3200);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {stars.map(s => (
        <div key={s.id} style={{ top: s.top, left: s.left, transform: 'rotate(-45deg)' }}
          className="absolute w-px h-28 bg-gradient-to-b from-white/90 to-transparent animate-shootStar" />
      ))}
    </div>
  );
});

// ── Kid Character ──
const KidCharacter = memo(function KidCharacter() {
  return (
    <svg viewBox="0 0 100 170" fill="none" style={{ filter: 'drop-shadow(0 0 20px rgba(100,200,255,0.5))' }}>
      <style>{`
        .kb{animation:kidBob 2.8s ease-in-out infinite}
        .kll{transform-origin:42px 125px;animation:legSwing .65s ease-in-out infinite}
        .klr{transform-origin:58px 125px;animation:legSwing .65s ease-in-out infinite reverse}
        .kal{transform-origin:28px 90px;animation:armSwing .65s ease-in-out infinite}
        .kar{transform-origin:72px 90px;animation:armSwing .65s ease-in-out infinite reverse}
        .kf1{transform-origin:39px 118px;animation:flamePulse .38s ease-in-out infinite}
        .kf2{transform-origin:61px 118px;animation:flamePulse .38s ease-in-out infinite .12s}
        .ke{animation:blink 4.5s ease-in-out infinite}
      `}</style>
      <g className="kb">
        <rect x="34" y="80" width="27" height="35" rx="5" fill="#1e2d40" stroke="#2a4060" strokeWidth="1"/>
        <rect x="27" y="84" width="9" height="22" rx="3" fill="#243045" stroke="#2a4060" strokeWidth=".8"/>
        <rect x="64" y="84" width="9" height="22" rx="3" fill="#243045" stroke="#2a4060" strokeWidth=".8"/>
        <ellipse cx="31.5" cy="108" rx="5" ry="3" fill="#4af" className="kf1"/>
        <ellipse cx="68.5" cy="108" rx="5" ry="3" fill="#4af" className="kf2"/>
        <rect x="28" y="79" width="44" height="44" rx="9" fill="#c8dff0" stroke="#88b4d4" strokeWidth="1.5"/>
        <rect x="36" y="87" width="28" height="19" rx="3" fill="#a0c4e8" stroke="#6090c0" strokeWidth=".8"/>
        <circle cx="44" cy="97" r="2.8" fill="#4af"/>
        <circle cx="56" cy="97" r="2.8" fill="#f84"/>
        <circle cx="82" cy="93" r="10" fill="#1a6bcc"/>
        <path d="M74 89 Q78 86 84 88 Q89 86 93 91 Q89 96 83 94 Q78 96 73 92Z" fill="#2a8b3a" opacity=".85"/>
        <circle cx="82" cy="93" r="10" fill="none" stroke="rgba(100,200,255,.5)" strokeWidth=".8">
          <animate attributeName="stroke-opacity" values=".5;.1;.5" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="50" cy="42" r="28" fill="rgba(200,230,255,.1)" stroke="#88b4d4" strokeWidth="2"/>
        <ellipse cx="50" cy="42" rx="23" ry="21" fill="rgba(12,50,140,.3)" stroke="rgba(80,160,255,.6)" strokeWidth="1.5"/>
        <circle cx="50" cy="42" r="16.5" fill="#ffd0a0"/>
        <g className="ke">
          <ellipse cx="43" cy="38" rx="3.8" ry="3.2" fill="#2a1500"/>
          <ellipse cx="57" cy="38" rx="3.8" ry="3.2" fill="#2a1500"/>
          <circle cx="44.5" cy="36.5" r="1.3" fill="white"/>
          <circle cx="58.5" cy="36.5" r="1.3" fill="white"/>
        </g>
        <path d="M43 47 Q50 54 57 47" stroke="#c06020" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <ellipse cx="40" cy="44" rx="3" ry="2" fill="#ffaaaa" opacity=".5"/>
        <ellipse cx="60" cy="44" rx="3" ry="2" fill="#ffaaaa" opacity=".5"/>
        <ellipse cx="39" cy="30" rx="7" ry="4" fill="white" opacity=".12" transform="rotate(-18,39,30)"/>
        <line x1="50" y1="15" x2="50" y2="7" stroke="#88b4d4" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="50" cy="5.5" r="3.5" fill="#4af">
          <animate attributeName="r" values="3.5;5;3.5" dur="1.1s" repeatCount="indefinite"/>
          <animate attributeName="fill" values="#4af;white;#4af" dur="1.1s" repeatCount="indefinite"/>
        </circle>
      </g>
      <g className="kal"><rect x="9" y="83" width="19" height="10" rx="5" fill="#c8dff0" stroke="#88b4d4" strokeWidth="1"/><ellipse cx="10" cy="96" rx="6.5" ry="5.5" fill="#9ab8d0"/></g>
      <g className="kar"><rect x="72" y="83" width="19" height="10" rx="5" fill="#c8dff0" stroke="#88b4d4" strokeWidth="1"/><ellipse cx="90" cy="96" rx="6.5" ry="5.5" fill="#9ab8d0"/></g>
      <g className="kll"><rect x="34" y="121" width="13" height="24" rx="5" fill="#c8dff0" stroke="#88b4d4" strokeWidth="1"/><rect x="31" y="139" width="18" height="8" rx="3" fill="#9ab8d0"/></g>
      <g className="klr"><rect x="53" y="121" width="13" height="24" rx="5" fill="#c8dff0" stroke="#88b4d4" strokeWidth="1"/><rect x="51" y="139" width="18" height="8" rx="3" fill="#9ab8d0"/></g>
    </svg>
  );
});

// ── Astronaut Character ──
const AstroCharacter = memo(function AstroCharacter() {
  return (
    <svg viewBox="0 0 110 185" fill="none" style={{ filter: 'drop-shadow(0 0 26px rgba(80,220,200,0.55))' }}>
      <style>{`
        .ab{animation:astroBob 3.4s ease-in-out infinite}
        .af1{transform-origin:25px 138px;animation:flamePulse .35s ease-in-out infinite}
        .af2{transform-origin:85px 138px;animation:flamePulse .35s ease-in-out infinite .1s}
        .ao{transform-origin:55px 50px;animation:orbitRing 9s linear infinite}
        .ae{animation:blink 5s ease-in-out infinite 1.2s}
      `}</style>
      <g className="ab">
        <rect x="32" y="96" width="46" height="52" rx="7" fill="#1a2d40" stroke="#2a4060" strokeWidth="1.2"/>
        <rect x="17" y="101" width="16" height="35" rx="4" fill="#1e3550" stroke="#2a4565" strokeWidth="1"/>
        <rect x="77" y="101" width="16" height="35" rx="4" fill="#1e3550" stroke="#2a4565" strokeWidth="1"/>
        <ellipse cx="25" cy="138" rx="7" ry="4" fill="#2fd" className="af1"/>
        <ellipse cx="85" cy="138" rx="7" ry="4" fill="#2fd" className="af2"/>
        <rect x="25" y="94" width="60" height="57" rx="11" fill="#daeeff" stroke="#88bbdd" strokeWidth="1.5"/>
        <rect x="25" y="111" width="60" height="7" fill="#c00" opacity=".7"/>
        <text x="55" y="117" textAnchor="middle" fontSize="4.5" fill="white" fontFamily="monospace" fontWeight="bold">NASA</text>
        <rect x="35" y="121" width="40" height="23" rx="4" fill="#070f20" stroke="#2a4566" strokeWidth=".8"/>
        <rect x="38" y="124" width="9" height="6" rx="1" fill="#4af" opacity=".9"/>
        <rect x="50" y="124" width="9" height="6" rx="1" fill="#2fd" opacity=".9"/>
        <rect x="62" y="124" width="7" height="6" rx="1" fill="#f84" opacity=".9"/>
        <rect x="38" y="133" width="30" height="2" rx="1" fill="#4af" opacity=".3"/>
        <rect x="38" y="137" width="20" height="2" rx="1" fill="#4af" opacity=".18"/>
        <rect x="8" y="97" width="20" height="13" rx="6" fill="#daeeff" stroke="#88bbdd" strokeWidth="1.2" transform="rotate(26,18,103)"/>
        <rect x="82" y="97" width="20" height="13" rx="6" fill="#daeeff" stroke="#88bbdd" strokeWidth="1.2" transform="rotate(-26,92,103)"/>
        <ellipse cx="10" cy="116" rx="9.5" ry="7" fill="#b0ccdd" stroke="#80aacc" strokeWidth="1"/>
        <ellipse cx="100" cy="116" rx="9.5" ry="7" fill="#b0ccdd" stroke="#80aacc" strokeWidth="1"/>
        <path d="M96 109 Q101 105 105 109 Q107 114 101 117" stroke="#80aacc" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
        <rect x="35" y="146" width="15" height="28" rx="6" fill="#daeeff" stroke="#88bbdd" strokeWidth="1.2"/>
        <rect x="60" y="146" width="15" height="28" rx="6" fill="#daeeff" stroke="#88bbdd" strokeWidth="1.2"/>
        <rect x="31" y="167" width="22" height="11" rx="4" fill="#b0ccdd" stroke="#80aacc" strokeWidth="1"/>
        <rect x="57" y="167" width="22" height="11" rx="4" fill="#b0ccdd" stroke="#80aacc" strokeWidth="1"/>
        <circle cx="55" cy="50" r="34" fill="rgba(180,220,255,.1)" stroke="#88bbdd" strokeWidth="2.5"/>
        <circle cx="55" cy="50" r="30" fill="rgba(4,14,45,.45)" stroke="rgba(80,180,255,.5)" strokeWidth="1.5"/>
        <ellipse cx="55" cy="50" rx="25" ry="23" fill="rgba(20,80,160,.28)" stroke="rgba(80,160,255,.7)" strokeWidth="1.5"/>
        <circle cx="55" cy="50" r="20" fill="#e8c090"/>
        <g className="ae">
          <ellipse cx="47" cy="45" rx="4.5" ry="3.5" fill="#1a1f40"/>
          <ellipse cx="63" cy="45" rx="4.5" ry="3.5" fill="#1a1f40"/>
          <circle cx="48.5" cy="43.5" r="1.8" fill="white"/>
          <circle cx="64.5" cy="43.5" r="1.8" fill="white"/>
        </g>
        <path d="M46 57 Q55 65 64 57" stroke="#c06820" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <ellipse cx="42" cy="36" rx="10" ry="6" fill="white" opacity=".1" transform="rotate(-20,42,36)"/>
        <line x1="55" y1="18" x2="55" y2="9" stroke="#88bbdd" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="55" cy="7" r="4.5" fill="#2fd">
          <animate attributeName="r" values="4.5;6.5;4.5" dur="1.3s" repeatCount="indefinite"/>
          <animate attributeName="fill" values="#2fd;white;#2fd" dur="1.3s" repeatCount="indefinite"/>
        </circle>
        <ellipse cx="55" cy="50" rx="40" ry="13" fill="none" stroke="rgba(100,200,255,.18)" strokeWidth="1" strokeDasharray="5 4" className="ao"/>
      </g>
    </svg>
  );
});

// ── Speech bubble ──
const SpeechBubble = memo(function SpeechBubble({ text, speaker, side }) {
  return (
    <motion.div key={text}
      initial={{ opacity: 0, scale: 0.65, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.82, y: -10 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      className={`absolute bottom-full mb-3 pointer-events-none z-20 ${side === 'left' ? 'left-0' : 'right-0'}`}
      style={{ maxWidth: 'min(650px,85vw)' }}>
      <div className={`relative px-4 py-2 rounded-2xl text-[11px] sm:text-[12px] leading-relaxed font-semibold backdrop-blur-2xl shadow-2xl
        ${speaker === 'kid'
          ? 'bg-gradient-to-br from-amber-950/95 to-yellow-900/85 border border-yellow-500/22 text-yellow-50'
          : 'bg-gradient-to-br from-blue-950/95 to-teal-900/85 border border-teal-500/22 text-teal-50'}`}>
        <div className={`text-[9px] font-black uppercase tracking-widest mb-1.5 ${speaker === 'kid' ? 'text-yellow-300' : 'text-teal-300'}`}>
          {speaker === 'kid' ? '⭐ Astro-Kid' : '🚀 Commander'}
        </div>
        {text}
        <div className={`absolute -bottom-2 w-3 h-3 rotate-45 ${side === 'left' ? 'left-5' : 'right-5'}
          ${speaker === 'kid' ? 'bg-amber-950/95 border-b border-r border-yellow-500/22' : 'bg-blue-950/95 border-b border-r border-teal-500/22'}`} />
      </div>
    </motion.div>
  );
});

export default function Hero() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [starsData, setStarsData] = useState([]);
  const [ready, setReady] = useState(false);
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [storyIdx, setStoryIdx] = useState(0);
  const [toast, setToast] = useState({ visible: false, type: 'success', text: '' });
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);

  const isMobile = dimensions.width < 768;

  const showToast = useCallback((type, text, ms = 1800) => {
    setToast({ visible: true, type, text });
    if (ms > 0) {
      setTimeout(() => setToast(t => ({ ...t, visible: false })), ms);
    }
  }, []);

  const handleClick = useCallback(loc => {
    setSelectedLoc(loc);
    setModalOpen(true);

    const nextHash = `#loc=${encodeURIComponent(loc.name)}`;
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, '', nextHash);
    }

    showToast('success', `Opened ${loc.name}`);
  }, [showToast]);

  const handleClose = useCallback(() => {
    setModalOpen(false);
    setTimeout(() => setSelectedLoc(null), 300);

    window.history.replaceState(
      null,
      '',
      window.location.pathname + window.location.search
    );
  }, []);

  const handleSelectFromPalette = useCallback((name) => {
    const loc = locations.find(l => l.name === name);
    if (!loc) {
      return showToast('danger', `Location "${name}" not found`);
    }
    handleClick(loc);
  }, [handleClick, showToast]);

  const randomLoc = useCallback(() => {
    handleClick(locations[Math.floor(Math.random() * locations.length)]);
  }, [handleClick]);

  const clearSelection = useCallback(() => {
    if (!selectedLoc) return;
    handleClose();
    showToast('success', 'Cleared selection');
  }, [selectedLoc, handleClose, showToast]);

  const shareCurrent = useCallback(async () => {
    try {
      if (!selectedLoc) {
        return showToast('danger', 'No location selected');
      }
      const url = `${window.location.origin}${window.location.pathname}#loc=${encodeURIComponent(selectedLoc.name)}`;
      await navigator.clipboard.writeText(url);
      showToast('success', 'Link copied!');
    } catch {
      showToast('danger', 'Copy failed');
    }
  }, [selectedLoc, showToast]);

  const quickActions = [
    {
      title: 'Random location',
      desc: 'Jump anywhere',
      icon: <Shuffle className="w-4 h-4" />,
      onRun: randomLoc
    },
    {
      title: selectedLoc ? `Share ${selectedLoc.name}` : 'Share current',
      desc: 'Copy deep-link',
      icon: <LinkIcon className="w-4 h-4" />,
      onRun: shareCurrent
    },
    {
      title: 'Clear selection',
      desc: 'Close details',
      icon: <XCircle className="w-4 h-4" />,
      onRun: clearSelection
    },
  ];

  // Story interval
  useEffect(() => {
    const id = setInterval(() => setStoryIdx(i => (i + 1) % STORY.length), 5200);
    return () => clearInterval(id);
  }, []);

  // Dimensions debounced
  useEffect(() => {
    let t;
    const h = () => { clearTimeout(t); t = setTimeout(() => setDimensions({ width: innerWidth, height: innerHeight }), 100); };
    h(); addEventListener('resize', h); return () => { removeEventListener('resize', h); clearTimeout(t); };
  }, []);

  // Stars + ready
  useEffect(() => {
    setStarsData(generateStarsData(isMobile ? 600 : 1600));
    const t = setTimeout(() => setReady(true), 600);
    return () => clearTimeout(t);
  }, [isMobile]);

  // Deep-link support
  useEffect(() => {
    const openFromHash = () => {
      const match = window.location.hash.match(/loc=([^&]+)/i);
      if (!match) return;
      const name = decodeURIComponent(match[1]).trim().toLowerCase();
      const loc = locations.find(l => l.name.toLowerCase() === name);
      if (loc) {
        setSelectedLoc(loc);
        setModalOpen(true);
      }
    };
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isK = e.key.toLowerCase() === 'k';
      const cmdOrCtrl = e.metaKey || e.ctrlKey;

      if (cmdOrCtrl && isK) {
        e.preventDefault();
        setPaletteOpen(current => !current);
      }

      if (e.key === 'Escape') {
        setPaletteOpen(false);
        if (modalOpen) {
          handleClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen, handleClose]);

  // Hint toast interval — show 3s every 10s
  useEffect(() => {
    const id = setInterval(() => {
      setHintVisible(true);
      setTimeout(() => setHintVisible(false), 3000);
    }, 10000);
    return () => clearInterval(id);
  }, []);

  if (!ready || dimensions.width === 0) return (
    <div className="fixed inset-0 bg-[#020614] flex flex-col items-center justify-center gap-5">
      <div className="relative w-20 h-20">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-4 border-blue-500/20 border-t-blue-400" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-2 rounded-full border-4 border-teal-500/20 border-b-teal-400" />
        <div className="absolute inset-0 flex items-center justify-center text-2xl">🌍</div>
      </div>
      <motion.p animate={{ opacity: [.4, 1, .4] }} transition={{ duration: 1.8, repeat: Infinity }}
        className="text-blue-300 text-xs tracking-widest uppercase font-semibold">Loading the Universe…</motion.p>
    </div>
  );

  const line = STORY[storyIdx];

  return (
    <>
      <Navbar />
      <CanvasStarfield />
      <ShootingStars />

      {/* Deep space gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-5%,rgba(25,55,155,.4),transparent_68%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_88%_88%,rgba(0,65,85,.2),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_35%_at_8%_75%,rgba(60,10,110,.15),transparent_60%)]" />
      </div>

      {/* Globe */}
      <section className="fixed inset-0 z-10 flex items-center justify-center">
        <GlobeComponent
          dimensions={dimensions}
          starsData={starsData}
          onLocationClick={handleClick}
          orbitalPeriodMs={14000}
          orbitInclinationDeg={35}
          orbitAltitudeRatio={2.4}
        />
      </section>

      {/* Top-right Palette & Share buttons */}
      <div className="fixed top-[72px] right-4 z-30 flex items-center gap-2">
        <button
          onClick={() => setPaletteOpen(true)}
          className="text-white/90 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-3 py-2 text-sm flex items-center gap-2 transition-colors duration-200 backdrop-blur-sm"
          title="Open command palette (⌘K / Ctrl+K)"
        >
          <Command className="w-4 h-4" /> Palette
        </button>

        {selectedLoc && (
          <button
            onClick={shareCurrent}
            className="text-white/90 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-3 py-2 text-sm flex items-center gap-2 transition-colors duration-200 backdrop-blur-sm"
            title={`Share ${selectedLoc.name}`}
          >
            <LinkIcon className="w-4 h-4" /> Share
          </button>
        )}
      </div>

      {/* Title */}
      <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: .3, duration: .8, ease: [.22, 1, .36, 1] }}
        className="fixed top-[68px] sm:top-[74px] left-6 z-20 text-left pointer-events-none">
        <h1 className="text-lg sm:text-[1.9rem] md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-teal-300">
          Terra · Earth Explorer
        </h1>
        <p className="mt-1 text-white/40 text-[10px] sm:text-sm tracking-wide">
          25 years of NASA Terra satellite data, explored through storytelling
        </p>
      </motion.div>

      {/* Story progress */}
      <div className="fixed z-20 flex gap-2 pointer-events-none"
        style={{ top: isMobile ? 136 : 150, left: '50%', transform: 'translateX(-50%)' }}>
        {STORY.map((_, i) => (
          <motion.div key={i}
            animate={{ width: i === storyIdx ? 22 : 8, opacity: i === storyIdx ? 1 : .25 }}
            transition={{ duration: .3 }}
            className={`h-1.5 rounded-full ${i === storyIdx ? 'bg-teal-400 shadow-[0_0_8px_#2fd]' : 'bg-white/30'}`} />
        ))}
      </div>

      {/* Characters */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex items-end justify-between px-3 sm:px-10 pb-2 sm:pb-5 pointer-events-none">
        {/* Kid */}
        <div className="relative flex flex-col items-start">
          <AnimatePresence mode="wait">
            {line.speaker === 'kid' && (
              <SpeechBubble key={`k${storyIdx}`} text={line.text} speaker="kid" side="left" />
            )}
          </AnimatePresence>
          <div className="w-[80px] sm:w-[108px] h-[110px] sm:h-[152px] animate-kidBob">
            <KidCharacter />
          </div>
        </div>

        {/* Centre CTAs + hint below */}
        <div className="hidden sm:flex flex-col items-center gap-2 pb-4 pointer-events-auto">
          <div className="flex flex-row items-center gap-3">
            <motion.button onClick={randomLoc}
              whileHover={{ scale: 1.07, boxShadow: '0 0 28px rgba(50,180,255,.55)' }} whileTap={{ scale: .93 }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-lg">
              <Shuffle size={13} /> Random Country
            </motion.button>
            <Link to="/story">
              <motion.div whileHover={{ scale: 1.07, boxShadow: '0 0 20px rgba(80,230,180,.4)' }} whileTap={{ scale: .93 }}
                className="flex items-center gap-2 bg-teal-500/15 border border-teal-400/35 text-teal-200 text-xs font-bold px-5 py-2.5 rounded-full cursor-pointer">
                <BookOpen size={13} /> Animated Stories
              </motion.div>
            </Link>
            <Link to="/space-game">
              <motion.div whileHover={{ scale: 1.07, boxShadow: '0 0 20px rgba(160,80,255,.4)' }} whileTap={{ scale: .93 }}
                className="flex items-center gap-2 bg-purple-500/15 border border-purple-400/35 text-purple-200 text-xs font-bold px-5 py-2.5 rounded-full cursor-pointer">
                <Gamepad2 size={13} /> Space Game
              </motion.div>
            </Link>
          </div>

          <AnimatePresence>
            {hintVisible && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.3 }}>
                <div className="bg-black/30 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/10">
                  <span className="text-white/38 text-[10px] tracking-wide">🌍 Tap locations · Drag to rotate · Scroll to zoom</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Astronaut */}
        <div className="relative flex flex-col items-end">
          <AnimatePresence mode="wait">
            {line.speaker === 'astro' && (
              <SpeechBubble key={`a${storyIdx}`} text={line.text} speaker="astro" side="right" />
            )}
          </AnimatePresence>
          <div className="w-[88px] sm:w-[118px] h-[118px] sm:h-[162px] animate-astroBob">
            <AstroCharacter />
          </div>
        </div>
      </div>



      {/* Mobile CTAs */}
      <div className="fixed bottom-[118px] left-1/2 -translate-x-1/2 z-30 flex gap-2 sm:hidden pointer-events-auto">
        <motion.button onClick={randomLoc} whileTap={{ scale: .9 }}
          className="flex items-center gap-1.5 bg-blue-600 text-white text-[11px] font-bold px-3 py-2 rounded-full shadow-lg">
          <Shuffle size={11} /> Random
        </motion.button>
        <Link to="/story"><motion.div whileTap={{ scale: .9 }} className="flex items-center gap-1.5 bg-teal-600 text-white text-[11px] font-bold px-3 py-2 rounded-full cursor-pointer"><BookOpen size={11} /> Story</motion.div></Link>
        <Link to="/space-game"><motion.div whileTap={{ scale: .9 }} className="flex items-center gap-1.5 bg-purple-600 text-white text-[11px] font-bold px-3 py-2 rounded-full cursor-pointer"><Gamepad2 size={11} /> Game</motion.div></Link>
      </div>

      {/* Command Palette */}
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        items={locations.map(l => l.name)}
        onSelect={handleSelectFromPalette}
        quickActions={quickActions}
      />

      {/* Toast */}
      {toast.visible && (
        <Alert type={toast.type === 'danger' ? 'danger' : 'success'} text={toast.text} />
      )}

      <LocationModal location={selectedLoc} isOpen={modalOpen} onClose={handleClose} />
    </>
  );
}
