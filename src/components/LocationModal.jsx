import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play, Pause, BookOpen, Gamepad2 } from 'lucide-react';
import { Link } from 'react-router-dom';

// ── Safe value renderer — never renders objects or arrays directly ──
function SafeValue({ value }) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return <span>{String(value)}</span>;
  }
  if (Array.isArray(value)) {
    return (
      <ul className="mt-1 space-y-0.5 list-disc list-inside">
        {value.map((item, i) => (
          <li key={i} className="text-white/65 text-xs leading-snug">
            <SafeValue value={item} />
          </li>
        ))}
      </ul>
    );
  }
  if (typeof value === 'object') {
    return (
      <div className="space-y-1">
        {Object.entries(value).map(([k, v]) => (
          <div key={k}>
            <span className="text-white/45 text-[10px] capitalize">{k.replace(/_/g, ' ')}: </span>
            <span className="text-white/75 text-xs"><SafeValue value={v} /></span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

// ── Sensor config ──
const SENSORS = {
  aster: { name: 'ASTER', icon: '🌡️', color: '#ff6b6b', bg: 'rgba(255,107,107,.1)', border: 'rgba(255,107,107,.3)', desc: 'Surface temperature & land cover', kidText: 'I feel how hot the land is from space! 🔥' },
  ceres: { name: 'CERES', icon: '☀️', color: '#ffd43b', bg: 'rgba(255,212,59,.1)', border: 'rgba(255,212,59,.3)', desc: "Earth's energy balance — sunlight in vs heat out", kidText: 'I track all the sunlight Earth reflects! ✨' },
  misr:  { name: 'MISR',  icon: '🌈', color: '#74c0fc', bg: 'rgba(116,192,252,.1)', border: 'rgba(116,192,252,.3)', desc: 'Air quality & aerosols with 9 cameras', kidText: 'I use 9 cameras to see pollution! 📷' },
  modis: { name: 'MODIS', icon: '🌿', color: '#51cf66', bg: 'rgba(81,207,102,.1)', border: 'rgba(81,207,102,.3)', desc: 'Forests, fires, oceans & vegetation daily', kidText: 'I track forests and fires every day! 🌲' },
};

// ── Satellite data hook ──
function useSatData() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.allSettled([
      fetch('/datas/ceres.json').then(r => r.json()),
      fetch('/datas/aster.json').then(r => r.json()),
      fetch('/datas/misr.json').then(r => r.json()),
      fetch('/datas/modis.json').then(r => r.json()),
    ]).then(([ceres, aster, misr, modis]) => {
      setData({
        ceres: ceres.status === 'fulfilled' ? ceres.value : {},
        aster: aster.status === 'fulfilled' ? aster.value : {},
        misr:  misr.status  === 'fulfilled' ? misr.value  : {},
        modis: modis.status === 'fulfilled' ? modis.value : {},
      });
      setLoading(false);
    });
  }, []);
  return { data, loading };
}

// ── Mini kid SVG ──
function MiniKid({ talking = false }) {
  return (
    <svg width="52" height="72" viewBox="0 0 52 72" style={{ filter: 'drop-shadow(0 3px 8px rgba(80,200,255,.35))' }}>
      <style>{`.mk{animation:kidBob 2.5s ease-in-out infinite}.mke{animation:blink 4s ease-in-out infinite}.mkt1{animation:talkDot .7s ease-in-out infinite}.mkt2{animation:talkDot .7s ease-in-out infinite .2s}.mkt3{animation:talkDot .7s ease-in-out infinite .4s}`}</style>
      <g className="mk">
        <rect x="14" y="34" width="24" height="22" rx="4" fill="#c8dff0" stroke="#88b4d4" strokeWidth="1"/>
        <rect x="8"  y="36" width="8"  height="14" rx="3" fill="#c8dff0" transform="rotate(15,12,43)"/>
        <rect x="36" y="36" width="8"  height="14" rx="3" fill="#c8dff0" transform="rotate(-15,40,43)"/>
        <rect x="16" y="54" width="7"  height="12" rx="3" fill="#c8dff0"/>
        <rect x="29" y="54" width="7"  height="12" rx="3" fill="#c8dff0"/>
        <circle cx="26" cy="20" r="14" fill="rgba(200,230,255,.1)" stroke="#88b4d4" strokeWidth="1.5"/>
        <ellipse cx="26" cy="20" rx="11" ry="10" fill="rgba(15,60,150,.25)" stroke="rgba(80,160,255,.55)" strokeWidth="1"/>
        <circle cx="26" cy="20" r="8.5" fill="#ffd0a0"/>
        <g className="mke">
          <ellipse cx="22" cy="17.5" rx="1.9" ry="1.5" fill="#2a1500"/>
          <ellipse cx="30" cy="17.5" rx="1.9" ry="1.5" fill="#2a1500"/>
          <circle cx="22.8" cy="16.8" r=".7" fill="white"/>
          <circle cx="30.8" cy="16.8" r=".7" fill="white"/>
        </g>
        <path d="M22 23 Q26 27 30 23" stroke="#c06020" strokeWidth="1" strokeLinecap="round" fill="none"/>
        <line x1="26" y1="7" x2="26" y2="3.5" stroke="#88b4d4" strokeWidth="1.2" strokeLinecap="round"/>
        <circle cx="26" cy="2.5" r="1.8" fill="#4af">
          <animate attributeName="r" values="1.8;2.8;1.8" dur="1.1s" repeatCount="indefinite"/>
        </circle>
        {talking && <>
          <circle cx="38" cy="12" r="1.5" fill="white" opacity=".7" className="mkt1"/>
          <circle cx="42" cy="8"  r="2"   fill="white" opacity=".6" className="mkt2"/>
          <circle cx="46" cy="5"  r="2.5" fill="white" opacity=".5" className="mkt3"/>
        </>}
      </g>
    </svg>
  );
}

// ── Get entry for a sensor/year ──
function getEntry(sensor, countryData, year) {
  if (!countryData) return null;
  try {
    if (sensor === 'ceres') return countryData?.CERES?.radiation?.[`radiation_${year}`] ?? null;
    if (sensor === 'modis') return Array.isArray(countryData) ? (countryData.find(i => i.year === year) ?? null) : null;
    if (sensor === 'aster') return countryData?.ASTER?.years?.[String(year)] ?? null;
    if (sensor === 'misr')  return countryData?.MISR?.ndvi?.[`ndvi_${year}`] ?? null;
  } catch { return null; }
  return null;
}

function getImg(entry) {
  if (!entry) return null;
  return entry.img || entry.Img || entry.image || null;
}

// ── Year Viewer ──
function YearViewer({ sensor, countryData }) {
  const [year, setYear] = useState(2005);
  const [playing, setPlaying] = useState(false);
  const s = SENSORS[sensor];

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setYear(y => { if (y >= 2024) { setPlaying(false); return 2024; } return y + 1; });
    }, 950);
    return () => clearInterval(id);
  }, [playing]);

  const entry = useMemo(() => getEntry(sensor, countryData, year), [sensor, countryData, year]);
  const img = useMemo(() => getImg(entry), [entry]);

  // Safe fields to display — only pick known string/number fields + handle objects safely
  const displayFields = useMemo(() => {
    if (!entry) return [];
    const fields = [];

    // CERES stats
    if (entry.stats) {
      const stats = entry.stats;
      if (stats.mean_w_m2 != null) fields.push({ label: 'Mean Radiation', value: `${stats.mean_w_m2} W/m²` });
      if (stats.min_w_m2  != null) fields.push({ label: 'Min',           value: `${stats.min_w_m2} W/m²` });
      if (stats.max_w_m2  != null) fields.push({ label: 'Max',           value: `${stats.max_w_m2} W/m²` });
    }

    // terra_data (object) — extract strings
    if (entry.terra_data && typeof entry.terra_data === 'object') {
      const td = entry.terra_data;
      if (td.average_ndvi != null) fields.push({ label: 'Avg NDVI',  value: String(td.average_ndvi) });
      if (td.assessment)           fields.push({ label: 'Assessment', value: td.assessment });
      if (td.sensor)               fields.push({ label: 'Sensor',     value: td.sensor });
    }

    // aster_data
    if (entry.aster_data && typeof entry.aster_data === 'object') {
      const ad = entry.aster_data;
      if (ad.mean_lst_anomaly_c != null)         fields.push({ label: 'Temp Anomaly',  value: `${ad.mean_lst_anomaly_c}°C` });
      if (ad.annual_deforestation_percent != null) fields.push({ label: 'Deforestation', value: `${ad.annual_deforestation_percent}%` });
      if (ad.urban_heat_island_intensity != null)  fields.push({ label: 'Urban Heat Island', value: `${ad.urban_heat_island_intensity}°C` });
    }

    // per_picture_info — string only
    if (entry.per_picture_info && typeof entry.per_picture_info === 'string') {
      fields.push({ label: 'Info', value: entry.per_picture_info.slice(0, 220) });
    }

    // vegetation_state — string
    if (entry.vegetation_state && typeof entry.vegetation_state === 'string') {
      fields.push({ label: 'Vegetation', value: entry.vegetation_state.slice(0, 180) });
    }

    // community_impact — object → render each sub-value
    if (entry.community_impact) {
      if (typeof entry.community_impact === 'string') {
        fields.push({ label: 'Community Impact', value: entry.community_impact.slice(0, 200) });
      } else if (typeof entry.community_impact === 'object' && !Array.isArray(entry.community_impact)) {
        // Pick first 3 entries from the object
        const entries = Object.entries(entry.community_impact).slice(0, 3);
        entries.forEach(([k, v]) => {
          if (typeof v === 'string') fields.push({ label: k.replace(/_/g, ' '), value: v.slice(0, 120) });
        });
      }
    }

    // our_response_suggestions — array of strings
    if (Array.isArray(entry.our_response_suggestions) && entry.our_response_suggestions.length > 0) {
      const tips = entry.our_response_suggestions.filter(x => typeof x === 'string').slice(0, 3);
      if (tips.length > 0) fields.push({ label: '💡 Tips', value: tips.join(' · ') });
    }

    return fields;
  }, [entry]);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setYear(y => Math.max(2000, y - 1))} disabled={year <= 2000}
          className="p-1.5 bg-white/10 hover:bg-white/18 rounded-lg text-white disabled:opacity-30 transition-colors">
          <ChevronLeft size={14} />
        </button>
        <button onClick={() => setPlaying(p => !p)}
          className="p-1.5 rounded-lg text-white transition-colors"
          style={{ background: s.bg, border: `1px solid ${s.border}` }}>
          {playing ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button onClick={() => setYear(y => Math.min(2024, y + 1))} disabled={year >= 2024}
          className="p-1.5 bg-white/10 hover:bg-white/18 rounded-lg text-white disabled:opacity-30 transition-colors">
          <ChevronRight size={14} />
        </button>
        <span className="font-black text-xl ml-1" style={{ color: s.color }}>{year}</span>
        <div className="flex-1 h-1.5 bg-white/12 rounded-full overflow-hidden mx-1">
          <motion.div className="h-full rounded-full" style={{ background: s.color }}
            animate={{ width: `${((year - 2000) / 24) * 100}%` }} transition={{ duration: 0.25 }} />
        </div>
        <span className="text-white/35 text-xs">2024</span>
      </div>

      {/* Image + data grid */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 min-h-0 overflow-hidden">
        {/* Image */}
        <div className="rounded-xl overflow-hidden border border-white/10 bg-white/5 relative min-h-[140px]">
          <AnimatePresence mode="wait">
            {img ? (
              <motion.img key={img} src={img} alt={`${sensor} ${year}`}
                initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 w-full h-full object-cover"
                onError={e => { e.currentTarget.style.display = 'none'; }} />
            ) : (
              <motion.div key="noimg" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="text-4xl">{s.icon}</div>
                <p className="text-white/30 text-xs">No image for {year}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Data fields — all safe strings */}
        <div className="overflow-y-auto space-y-2 pr-0.5">
          {displayFields.length > 0 ? displayFields.map((f, i) => (
            <div key={i} className="rounded-xl px-3 py-2.5 bg-white/5 border border-white/10">
              <div className="text-[10px] font-black uppercase tracking-wide mb-0.5 capitalize"
                style={{ color: s.color }}>{f.label}</div>
              <div className="text-white/80 text-xs leading-snug">{f.value}</div>
            </div>
          )) : (
            <div className="h-full flex items-center justify-center text-white/30 text-sm text-center p-4">
              No data available for {year}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Modal ──
export default function LocationModal({ location, isOpen, onClose }) {
  const { data: satData, loading } = useSatData();
  const [tab, setTab] = useState('aster');
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!isOpen) { setPhase(0); setTab('aster'); return; }
    const t = setTimeout(() => setPhase(1), 750);
    return () => clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [isOpen, onClose]);

  const countryData = useMemo(() => {
    if (!location?.name || !satData) return null;
    try {
      if (tab === 'ceres') return satData.ceres?.[location.name] ?? null;
      if (tab === 'modis') return satData.modis?.countries?.[location.name] ?? null;
      if (tab === 'aster') return satData.aster?.[location.name] ?? null;
      if (tab === 'misr')  return satData.misr?.[location.name] ?? null;
    } catch { return null; }
    return null;
  }, [tab, location, satData]);

  if (!isOpen || !location) return null;
  const s = SENSORS[tab];
  const name = location.name || '';

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4"
        style={{ backdropFilter: 'blur(10px)', background: 'rgba(2,6,20,.88)' }}>

        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          className="relative w-full sm:max-w-4xl flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden"
          style={{
            height: '90vh',
            background: 'linear-gradient(145deg,rgba(5,15,50,.98),rgba(3,10,35,.98))',
            border: '1px solid rgba(100,180,255,.2)',
            boxShadow: '0 30px 80px rgba(0,40,180,.45)',
          }}>

          {/* Header */}
          <div className="flex-shrink-0 px-5 sm:px-7 pt-5 pb-4 border-b border-white/10"
            style={{ background: 'linear-gradient(180deg,rgba(20,50,120,.28),transparent)' }}>
            <button onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 bg-white/8 hover:bg-white/15 border border-white/15 rounded-full flex items-center justify-center text-white/55 hover:text-white transition-all">
              <X size={15} />
            </button>
            <div className="flex items-start gap-4 pr-12">
              <motion.div initial={{ x: -18, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.12 }} className="flex-shrink-0">
                <MiniKid talking={phase === 0} />
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="text-white/40 text-xs font-bold uppercase tracking-widest mb-0.5">{location.region || 'Earth Explorer'}</div>
                <h2 className="text-2xl sm:text-3xl font-black text-white truncate">{name}</h2>
                <AnimatePresence mode="wait">
                  {phase === 0 ? (
                    <motion.p key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="mt-1.5 text-white/65 text-sm font-medium">
                      🌍 Connecting to NASA Terra satellite…
                    </motion.p>
                  ) : (
                    <motion.p key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="mt-1 text-white/35 text-xs">
                      {location.lat?.toFixed(2)}°, {location.lng?.toFixed(2)}° · 25 years of data
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <div className="hidden sm:flex flex-col gap-2 flex-shrink-0">
                <Link to={`/story?country=${encodeURIComponent(name)}`} onClick={onClose}>
                  <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-1.5 bg-gradient-to-r from-teal-600 to-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer shadow">
                    <BookOpen size={12} /> Read Story
                  </motion.div>
                </Link>
                <Link to="/space-game" onClick={onClose}>
                  <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-1.5 bg-purple-500/20 border border-purple-400/25 text-purple-200 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer">
                    <Gamepad2 size={12} /> Space Game
                  </motion.div>
                </Link>
              </div>
            </div>
          </div>

          {/* Sensor tabs */}
          <div className="flex-shrink-0 flex gap-1.5 px-4 sm:px-6 pt-3 pb-1 overflow-x-auto hide-scrollbar">
            {Object.entries(SENSORS).map(([key, info]) => (
              <motion.button key={key} onClick={() => setTab(key)}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all relative"
                style={tab === key
                  ? { background: info.bg, border: `1.5px solid ${info.border}`, color: info.color, boxShadow: `0 0 18px ${info.color}28` }
                  : { background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.5)' }}>
                {info.icon} {info.name}
                {tab === key && (
                  <motion.div layoutId="sensorDot"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                    style={{ background: info.color }} />
                )}
              </motion.button>
            ))}
          </div>

          {/* Sensor info strip */}
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
              className="flex-shrink-0 mx-4 sm:mx-6 mt-2 rounded-xl px-4 py-2.5 flex items-center gap-3"
              style={{ background: s.bg, border: `1px solid ${s.border}` }}>
              <div className="text-xl">{s.icon}</div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: s.color }}>{s.name}</div>
                <p className="text-white text-xs font-semibold">{s.kidText}</p>
                <p className="text-white/45 text-[11px] hidden sm:block">{s.desc}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Data area */}
          <div className="flex-1 min-h-0 px-4 sm:px-6 py-3 overflow-hidden">
            {loading || phase === 0 ? (
              <div className="h-full flex items-center justify-center flex-col gap-3">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="w-10 h-10 rounded-full border-4 border-teal-500/20 border-t-teal-400" />
                <p className="text-white/35 text-sm">Loading satellite data…</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                  <YearViewer sensor={tab} countryData={countryData} />
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-white/10 px-4 sm:px-6 py-3 flex items-center gap-2">
            <Link to={`/story?country=${encodeURIComponent(name)}`} onClick={onClose} className="sm:hidden flex-1">
              <motion.div whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-teal-600 to-blue-600 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer">
                <BookOpen size={12} /> Read Story
              </motion.div>
            </Link>
            <Link to="/space-game" onClick={onClose} className="sm:hidden">
              <motion.div whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1 bg-purple-500/20 border border-purple-400/25 text-purple-200 text-xs font-bold px-3 py-2.5 rounded-xl cursor-pointer">
                <Gamepad2 size={12} />
              </motion.div>
            </Link>
            <button onClick={onClose}
              className="ml-auto text-white/45 hover:text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-white/8 transition-all">
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
