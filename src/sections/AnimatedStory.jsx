import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, BookOpen, Gamepad2, RotateCcw } from 'lucide-react';
import Navbar from './Navbar';

/* ── Data loaders ── */
const LOADERS = {
  'Bangladesh':    ()=>import('../data/terraBookData_bgd'),
  'Kenya':         ()=>import('../data/terraBookData_ken'),
  'Japan':         ()=>import('../data/terraBookData_jpn'),
  'Argentina':     ()=>import('../data/terraBookData_arg'),
  'United States': ()=>import('../data/terraBookData_usa'),
  'Australia':     ()=>import('../data/terraBookData_aus'),
  'Brazil':        ()=>import('../data/terraBookData_bra'),
  'Canada':        ()=>import('../data/terraBookData_can'),
  'Chile':         ()=>import('../data/terraBookData_chl'),
  'United Kingdom':()=>import('../data/terraBookData_uk'),
};
const EMOJIS  ={'Bangladesh':'🇧🇩','Kenya':'🇰🇪','Japan':'🇯🇵','Argentina':'🇦🇷','United States':'🇺🇸','Australia':'🇦🇺','Brazil':'🇧🇷','Canada':'🇨🇦','Chile':'🇨🇱','United Kingdom':'🇬🇧'};
const PALETTES={'Bangladesh':['#1a4730','#0d5c3a'],'Kenya':['#7c1a1a','#5c2e0a'],'Japan':['#6b1a2a','#4a0f1a'],'Argentina':['#1a2a6b','#0d1a4a'],'United States':['#1a2a6b','#6b1a1a'],'Australia':['#6b3d1a','#4a250a'],'Brazil':['#1a5c1a','#3d5c0a'],'Canada':['#6b1a1a','#4a0f0f'],'Chile':['#1a2a6b','#0d1a4a'],'United Kingdom':['#1a2a6b','#6b1a1a']};

/* ── Kid character (CSS animations only) ── */
function KidSVG({mood='happy',talking=false}) {
  const mouth = mood==='happy'?'M43 48 Q50 55 57 48':mood==='sad'?'M43 52 Q50 46 57 52':'M43 49 Q50 52 57 49';
  return (
    <svg viewBox="0 0 100 170" fill="none" style={{filter:'drop-shadow(0 6px 18px rgba(100,200,255,0.45))'}}>
      <style>{`
        .ks-body{animation:kidBob 2.5s ease-in-out infinite}
        .ks-fl1{transform-origin:39px 118px;animation:flamePulse 0.38s ease-in-out infinite}
        .ks-fl2{transform-origin:61px 118px;animation:flamePulse 0.38s ease-in-out infinite 0.12s}
        .ks-arm1{transform-origin:28px 90px;animation:armSwing 0.7s ease-in-out infinite}
        .ks-arm2{transform-origin:72px 90px;animation:armSwing 0.7s ease-in-out infinite reverse}
        .ks-leg1{transform-origin:42px 125px;animation:legSwing 0.7s ease-in-out infinite}
        .ks-leg2{transform-origin:58px 125px;animation:legSwing 0.7s ease-in-out infinite reverse}
        .ks-eye{animation:blink 4s ease-in-out infinite}
        .ks-talk1{animation:talkDot 0.7s ease-in-out infinite}
        .ks-talk2{animation:talkDot 0.7s ease-in-out infinite 0.2s}
        .ks-talk3{animation:talkDot 0.7s ease-in-out infinite 0.4s}
      `}</style>
      <g className="ks-body">
        <rect x="33" y="80" width="28" height="36" rx="5" fill="#2a3545" stroke="#3a5060" strokeWidth="1"/>
        <ellipse cx="39" cy="118" rx="5" ry="3" fill="#4af" className="ks-fl1"/>
        <ellipse cx="61" cy="118" rx="5" ry="3" fill="#4af" className="ks-fl2"/>
        <rect x="28" y="80" width="44" height="44" rx="9" fill="#c8dff0" stroke="#88b4d4" strokeWidth="1.5"/>
        <rect x="36" y="88" width="28" height="18" rx="3" fill="#a0c4e8"/>
        <circle cx="44" cy="97" r="2.5" fill="#4af"/><circle cx="56" cy="97" r="2.5" fill="#f84"/>
        <circle cx="50" cy="43" r="27" fill="rgba(200,230,255,.1)" stroke="#88b4d4" strokeWidth="2"/>
        <ellipse cx="50" cy="43" rx="22" ry="20" fill="rgba(15,60,150,.27)" stroke="rgba(80,160,255,.6)" strokeWidth="1.5"/>
        <circle cx="50" cy="43" r="16" fill="#ffd0a0"/>
        <g className="ks-eye">
          <ellipse cx="43" cy="39" rx="3.5" ry="2.8" fill="#2a1500"/>
          <ellipse cx="57" cy="39" rx="3.5" ry="2.8" fill="#2a1500"/>
          <circle cx="44.3" cy="37.8" r="1.2" fill="white"/>
          <circle cx="58.3" cy="37.8" r="1.2" fill="white"/>
        </g>
        <path d={mouth} stroke="#c06020" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
        <ellipse cx="40" cy="45" rx="3" ry="2" fill="#ffaaaa" opacity=".5"/>
        <ellipse cx="60" cy="45" rx="3" ry="2" fill="#ffaaaa" opacity=".5"/>
        <line x1="50" y1="17" x2="50" y2="9" stroke="#88b4d4" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="50" cy="7" r="3.2" fill="#4af">
          <animate attributeName="r" values="3.2;4.8;3.2" dur="1.1s" repeatCount="indefinite"/>
          <animate attributeName="fill" values="#4af;white;#4af" dur="1.1s" repeatCount="indefinite"/>
        </circle>
        {talking && <>
          <circle cx="68" cy="22" r="2.5" fill="white" opacity=".7" className="ks-talk1"/>
          <circle cx="75" cy="16" r="3" fill="white" opacity=".6" className="ks-talk2"/>
          <circle cx="83" cy="11" r="3.5" fill="white" opacity=".5" className="ks-talk3"/>
        </>}
      </g>
      <g className="ks-arm1"><rect x="10" y="84" width="19" height="10" rx="5" fill="#c8dff0" stroke="#88b4d4" strokeWidth="1"/><ellipse cx="11" cy="97" rx="6" ry="5" fill="#9ab8d0"/></g>
      <g className="ks-arm2"><rect x="71" y="84" width="19" height="10" rx="5" fill="#c8dff0" stroke="#88b4d4" strokeWidth="1"/><ellipse cx="89" cy="97" rx="6" ry="5" fill="#9ab8d0"/></g>
      <g className="ks-leg1"><rect x="35" y="122" width="12" height="23" rx="5" fill="#c8dff0" stroke="#88b4d4" strokeWidth="1"/><rect x="32" y="140" width="17" height="8" rx="3" fill="#9ab8d0"/></g>
      <g className="ks-leg2"><rect x="53" y="122" width="12" height="23" rx="5" fill="#c8dff0" stroke="#88b4d4" strokeWidth="1"/><rect x="51" y="140" width="17" height="8" rx="3" fill="#9ab8d0"/></g>
    </svg>
  );
}

/* ── Typewriter (stable - no stale closure bug) ── */
function Typewriter({text,speed=20,onDone}) {
  const [shown,setShown]=useState('');
  const [finished,setFinished]=useState(false);
  useEffect(()=>{
    setShown(''); setFinished(false);
    if(!text){setFinished(true);onDone?.();return;}
    let i=0;
    const id=setInterval(()=>{
      i++;
      setShown(text.slice(0,i));
      if(i>=text.length){clearInterval(id);setFinished(true);onDone?.();}
    },speed);
    return ()=>clearInterval(id);
  },[text,speed]); // intentionally omit onDone to avoid restarts
  return <span>{shown}{!finished&&<span className="animate-pulse ml-px text-teal-400">▋</span>}</span>;
}

/* ── Quiz ── */
function buildQuiz(country,pages) {
  const story=pages.map(p=>p.story||'').join(' ').toLowerCase();
  const pool=[
    {q:`Which country did we just explore in this story?`,opts:[country,'Australia','Brazil','Japan'],correct:0},
    {q:`What does NASA's Terra satellite help us study?`,opts:['Weather forecasts for cities','Earth\'s environment, forests, and climate','Space stations and astronauts','Ocean fish populations'],correct:1},
    {q:`Which NASA sensor measures temperature on Earth's surface?`,opts:['MODIS','CERES','MISR','ASTER'],correct:3},
    {q:`What does MODIS monitor from space?`,opts:['City traffic patterns','Forests, fires, and vegetation','Rainfall inside clouds','Moon surface craters'],correct:1},
    {q:`Why do cities feel hotter than forests?`,opts:['Cities are higher in altitude','Concrete and asphalt trap heat (urban heat island)','Factories make extra heat','Clouds stay away from cities'],correct:1},
    {q:`What is climate change?`,opts:['Seasons changing every year','Long-term shifts in global temperatures caused by greenhouse gases','The weather changing day to day','Rain becoming snow in winter'],correct:1},
    {q:`How do trees help our planet?`,opts:['They produce electricity','They absorb CO₂ and cool the Earth','They make cars run better','They only give us fruit'],correct:1},
    {q:`What is the name of NASA's Earth-observing satellite programme explored in this story?`,opts:['Apollo','Voyager','Terra','Hubble'],correct:2},
  ];
  // filter relevant questions based on story content
  const relevant=pool.filter((_,i)=>i<2||[
    story.includes('heat')||story.includes('hot'),
    story.includes('forest')||story.includes('tree'),
    story.includes('city')||story.includes('urban'),
    true,true,true,true
  ][i-2]);
  // return 5 stable questions (no shuffle → no re-shuffle bug)
  return relevant.slice(0,5);
}

function QuizPage({country,pages,onRestart}) {
  // FIX: useMemo so questions never change between renders
  const questions=useMemo(()=>buildQuiz(country,pages),[country]);
  const [qIdx,setQIdx]=useState(0);
  const [selected,setSelected]=useState(null);
  const [score,setScore]=useState(0);
  const [done,setDone]=useState(false);
  const [showExplain,setShowExplain]=useState(false);

  const q=questions[qIdx];
  const pct=Math.round((score/questions.length)*100);
  const medal=pct>=80?'🏆':pct>=60?'🥈':'🌱';

  const choose=useCallback((i)=>{
    if(selected!==null)return;
    const correct=i===q.correct;
    setSelected(i);
    if(correct)setScore(s=>s+1);
    setShowExplain(true);
    setTimeout(()=>{
      setShowExplain(false);
      setTimeout(()=>{
        if(qIdx<questions.length-1){setQIdx(qi=>qi+1);setSelected(null);}
        else setDone(true);
      },200);
    },1800);
  },[selected,q,qIdx,questions.length]);

  const confettiItems=useMemo(()=>Array.from({length:24},(_,i)=>({
    color:['#ffd700','#ff6b6b','#4af','#2fd','#ff9900','#c084fc'][i%6],
    left:`${4+i*4}%`,
    dur:`${1.8+Math.random()*1.5}s`,
    delay:`${i*0.08}s`,
    x:(i%2?1:-1)*(Math.random()*80+20),
  })),[]);

  if(done) return (
    <div className="min-h-screen bg-[#020614] flex flex-col">
      <Navbar/>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 pt-20 relative overflow-hidden">
        {/* Confetti */}
        {confettiItems.map((c,i)=>(
          <div key={i} style={{position:'fixed',left:c.left,top:'-20px',width:10,height:10,borderRadius:'50%',background:c.color,animation:`confettiFall ${c.dur} ${c.delay} ease-in forwards`,transform:`translateX(${c.x}px)`}}/>
        ))}
        <motion.div initial={{opacity:0,scale:.7}} animate={{opacity:1,scale:1}}
          transition={{type:'spring',stiffness:200,damping:18}} className="text-center max-w-md w-full">
          <motion.div className="text-8xl mb-4 select-none"
            animate={{rotate:[0,15,-15,0],scale:[1,1.15,1]}} transition={{duration:1.2,repeat:2}}>
            {medal}
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-1">Quiz Complete!</h2>
          <p className="text-white/50 mb-5 text-sm">{EMOJIS[country]} {country} adventure finished</p>
          <div className="glass rounded-2xl p-6 mb-6">
            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-blue-300 mb-1">
              {score}/{questions.length}
            </div>
            <div className="text-white/50 text-sm mb-4">correct answers</div>
            {/* Score bar */}
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-4">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-blue-400"
                initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:1,delay:.4}}/>
            </div>
            <p className="text-white font-semibold text-sm">
              {pct===100?'🌟 Perfect score! You\'re a Terra Expert!':pct>=80?'🎉 Brilliant! You learned so much!':pct>=60?'👍 Good job! Keep exploring!':'📚 Great start! Read the story again to learn more!'}
            </p>
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            <motion.button onClick={onRestart} whileHover={{scale:1.05}} whileTap={{scale:.95}}
              className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold px-6 py-3 rounded-full shadow-lg">
              <RotateCcw size={15}/> Read Again
            </motion.button>
            <Link to="/terra-game"><motion.div whileHover={{scale:1.05}} whileTap={{scale:.95}}
              className="flex items-center gap-2 bg-white/10 border border-white/20 text-white font-bold px-6 py-3 rounded-full cursor-pointer">
              🌍 Globe
            </motion.div></Link>
            <Link to="/space-game"><motion.div whileHover={{scale:1.05}} whileTap={{scale:.95}}
              className="flex items-center gap-2 bg-purple-500/20 border border-purple-400/30 text-purple-200 font-bold px-6 py-3 rounded-full cursor-pointer">
              <Gamepad2 size={15}/> Space Game
            </motion.div></Link>
          </div>
        </motion.div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020614] flex flex-col">
      <Navbar/>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 pt-20">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-white/40 text-xs uppercase tracking-widest mb-1">🎓 Quiz Time — {EMOJIS[country]} {country}</div>
            <div className="text-white/60 text-sm">Question {qIdx+1} of {questions.length}</div>
          </div>
          {/* Progress */}
          <div className="flex gap-1.5 mb-6">
            {questions.map((_,i)=>(
              <div key={i} className={`flex-1 h-2 rounded-full transition-all duration-500 ${i<qIdx?'bg-teal-400':i===qIdx?'bg-blue-400 animate-pulse':'bg-white/15'}`}/>
            ))}
          </div>

          {/* Question card with kid */}
          <AnimatePresence mode="wait">
            <motion.div key={qIdx} initial={{opacity:0,x:50}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-50}}
              transition={{duration:.3}} className="glass rounded-2xl p-5 sm:p-6 mb-4">
              <div className="flex items-start gap-4">
                <div className="w-[60px] sm:w-[72px] flex-shrink-0 animate-kidBob">
                  <KidSVG mood="happy" talking={selected===null}/>
                </div>
                <div className="flex-1 pt-1">
                  <div className="text-[10px] font-black uppercase tracking-widest text-yellow-300 mb-2">⭐ Astro-Kid asks:</div>
                  <p className="text-white font-bold text-base sm:text-lg leading-snug">{q.q}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Options */}
          <div className="grid grid-cols-1 gap-2.5">
            {q.opts.map((opt,i)=>{
              let cls='border-white/15 bg-white/5 text-white/85 hover:bg-white/12 hover:border-white/30 cursor-pointer';
              let icon=['A','B','C','D'][i];
              if(selected!==null){
                if(i===q.correct){cls='border-teal-400/60 bg-teal-500/20 text-white';icon='✓';}
                else if(i===selected){cls='border-red-400/60 bg-red-500/20 text-white';icon='✗';}
                else{cls='border-white/8 bg-white/3 text-white/35';} 
              }
              return (
                <motion.button key={`${qIdx}-${i}`} onClick={()=>choose(i)}
                  whileHover={selected===null?{scale:1.02,x:4}:{}}
                  whileTap={selected===null?{scale:.98}:{}}
                  disabled={selected!==null}
                  className={`border rounded-xl px-4 py-3.5 text-left text-sm font-semibold transition-all flex items-center gap-3 ${cls}`}>
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 border
                    ${selected!==null&&i===q.correct?'bg-teal-500 border-teal-400 text-white':selected===i&&i!==q.correct?'bg-red-500 border-red-400 text-white':'bg-white/10 border-white/20'}`}>
                    {icon}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {selected!==null&&i===q.correct&&<span className="text-lg">🌟</span>}
                </motion.button>
              );
            })}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {showExplain&&selected!==null&&(
              <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-5}}
                className={`mt-3 rounded-xl px-4 py-3 text-sm font-semibold border ${selected===q.correct?'bg-teal-900/60 border-teal-400/30 text-teal-100':'bg-red-900/60 border-red-400/30 text-red-100'}`}>
                {selected===q.correct?'🎉 Correct! Well done!':'💪 Not quite — but now you know! Keep going!'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ── Main AnimatedStory ── */
export default function AnimatedStory() {
  const [params]=useSearchParams();
  const initCountry=params.get('country')||'Bangladesh';
  const [country,setCountry]=useState(initCountry);
  const [bookData,setBookData]=useState(null);
  const [loading,setLoading]=useState(true);
  const [pageIdx,setPageIdx]=useState(-1); // -1=cover
  const [typingDone,setTypingDone]=useState(false);
  const [showQuiz,setShowQuiz]=useState(false);

  const c1=PALETTES[country]?.[0]||'#1a2a6b';
  const c2=PALETTES[country]?.[1]||'#0d1a4a';

  useEffect(()=>{
    setLoading(true);setPageIdx(-1);setTypingDone(false);setShowQuiz(false);
    const loader=LOADERS[country];
    if(!loader){setLoading(false);return;}
    loader().then(m=>{setBookData(m.default||m.bookData);setLoading(false);});
  },[country]);

  const pages=useMemo(()=>bookData?.countries?.[0]?.pages||[],[bookData]);
  const totalPages=pages.length;
  const currentPage=pages[pageIdx]||null;
  const isLast=pageIdx===totalPages-1;

  const kidMood=useMemo(()=>{
    if(!currentPage)return 'happy';
    const t=currentPage.story.toLowerCase();
    if(['plant','hope','green','grow','future','promis'].some(w=>t.includes(w)))return 'excited';
    if(['flood','heat','burn','gone','empty','die','dry'].some(w=>t.includes(w)))return 'sad';
    return 'happy';
  },[currentPage]);

  const goNext=useCallback(()=>{
    if(!typingDone&&pageIdx>=0){setTypingDone(true);return;}
    if(isLast){setShowQuiz(true);return;}
    setPageIdx(p=>Math.min(p+1,totalPages-1));
    setTypingDone(false);
  },[typingDone,isLast,totalPages,pageIdx]);

  const goPrev=useCallback(()=>{
    if(pageIdx<=-1)return;
    setPageIdx(p=>p-1);setTypingDone(false);setShowQuiz(false);
  },[pageIdx]);

  useEffect(()=>{
    const h=(e)=>{if(e.key==='ArrowRight'||e.key===' ')goNext();if(e.key==='ArrowLeft')goPrev();};
    window.addEventListener('keydown',h);return ()=>window.removeEventListener('keydown',h);
  },[goNext,goPrev]);

  if(showQuiz)return <QuizPage country={country} pages={pages} onRestart={()=>{setPageIdx(-1);setShowQuiz(false);setTypingDone(false);}}/>;

  if(loading)return (
    <div className="min-h-screen bg-[#020614] flex items-center justify-center">
      <motion.div animate={{rotate:360}} transition={{duration:1.5,repeat:Infinity,ease:'linear'}}
        className="w-14 h-14 rounded-full border-4 border-teal-500/20 border-t-teal-400"/>
    </div>
  );

  const coverImg=bookData?.countries?.[0]?.coverImage;

  return (
    <div className="min-h-screen flex flex-col" style={{background:`linear-gradient(135deg,${c1},${c2})`}}>
      <Navbar/>

      {/* Starfield bg */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {Array.from({length:30}).map((_,i)=>(
          <div key={i} className="absolute w-1 h-1 rounded-full bg-white/30"
            style={{left:`${(i*37)%100}%`,top:`${(i*53)%100}%`,
              animation:`blink ${2+i%3}s ease-in-out infinite`,animationDelay:`${i*0.2}s`}}/>
        ))}
      </div>

      <div className="relative z-10 flex flex-col flex-1 pt-16">
        {/* Country tabs */}
        <div className="flex items-center gap-2 px-4 sm:px-8 py-3 border-b border-white/10 overflow-x-auto hide-scrollbar">
          {Object.keys(LOADERS).map(c=>(
            <button key={c} onClick={()=>setCountry(c)}
              className={`flex-shrink-0 text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-full transition-all ${country===c?'bg-white text-black shadow':'bg-white/10 text-white/65 hover:bg-white/20'}`}>
              {EMOJIS[c]} {c}
            </button>
          ))}
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col lg:flex-row max-w-5xl mx-auto w-full px-3 sm:px-4 py-4 gap-3 sm:gap-4">

          {/* Scene image */}
          <div className="lg:w-1/2 relative rounded-2xl overflow-hidden min-h-[220px] sm:min-h-[300px] lg:min-h-0 flex-shrink-0">
            <AnimatePresence mode="wait">
              <motion.div key={pageIdx} initial={{opacity:0,scale:1.04}} animate={{opacity:1,scale:1}}
                exit={{opacity:0,scale:.96}} transition={{duration:.5}}
                className="absolute inset-0">
                {(pageIdx===-1?coverImg:currentPage?.image) ? (
                  <img src={pageIdx===-1?coverImg:currentPage.image}
                    alt="" className="w-full h-full object-cover"
                    onError={e=>{e.currentTarget.style.display='none';}}/>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-black/30">
                    <span className="text-7xl">{EMOJIS[country]}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"/>
                {currentPage?.caption&&(
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white/75 text-xs italic">{currentPage.caption}</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Story panel */}
          <div className="lg:w-1/2 glass rounded-2xl flex flex-col p-5 sm:p-6 min-h-[300px]">
            {/* Progress */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/35 text-[10px] font-mono uppercase tracking-wider">
                {pageIdx===-1?'Cover':`Page ${pageIdx+1}/${totalPages}`}
              </span>
              <div className="flex gap-1">
                {Array.from({length:totalPages}).map((_,i)=>(
                  <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i<=pageIdx?'bg-teal-400':'bg-white/15'}`}
                    style={{width:i===pageIdx?18:7}}/>
                ))}
              </div>
            </div>

            {/* Title */}
            {pageIdx===-1&&bookData&&(
              <div className="mb-4">
                <div className="text-white/40 text-xs uppercase tracking-widest mb-1">{EMOJIS[country]} {country}</div>
                <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">{bookData.title}</h1>
                {bookData.subtitle&&<p className="text-teal-300 text-sm mt-1">{bookData.subtitle}</p>}
              </div>
            )}
            {pageIdx>=0&&currentPage&&(
              <div className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">{currentPage.year}</div>
            )}

            {/* Kid + speech */}
            <div className="flex items-end gap-3 mb-5 flex-1">
              <div className="w-[70px] sm:w-[85px] h-[95px] sm:h-[115px] flex-shrink-0 animate-kidBob">
                <KidSVG mood={kidMood} talking={!typingDone&&pageIdx>=0}/>
              </div>
              <div className="flex-1 relative">
                <div className="bg-white/10 border border-white/20 rounded-2xl rounded-bl-sm px-4 py-3 backdrop-blur-sm min-h-[70px] flex flex-col justify-center">
                  <div className="text-[10px] font-black uppercase tracking-widest text-yellow-300 mb-1.5">⭐ Astro-Kid says:</div>
                  <p className="text-white text-sm leading-relaxed font-medium">
                    {pageIdx===-1?(
                      <Typewriter text={`Hi! I'm Astro-Kid! 👋 Let's explore ${country} together! Press Next to begin our story! 🚀`} onDone={()=>setTypingDone(true)} speed={22}/>
                    ):(
                      typingDone
                        ? currentPage?.story
                        : <Typewriter text={currentPage?.story||''} onDone={()=>setTypingDone(true)} speed={18}/>
                    )}
                  </p>
                </div>
                <div className="absolute -left-2 bottom-4 w-3 h-3 bg-white/10 border-b border-l border-white/20 rotate-45"/>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-2 mt-auto">
              <motion.button onClick={goPrev} disabled={pageIdx<=-1}
                whileHover={{scale:1.04}} whileTap={{scale:.96}}
                className="flex items-center gap-1.5 bg-white/10 border border-white/15 text-white/65 disabled:opacity-25 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-white/15 transition-colors disabled:pointer-events-none">
                <ChevronLeft size={15}/> Back
              </motion.button>
              <motion.button onClick={goNext}
                whileHover={{scale:1.05,boxShadow:'0 0 25px rgba(50,200,150,.4)'}} whileTap={{scale:.95}}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-black px-5 py-2.5 rounded-xl text-sm shadow-lg">
                {!typingDone&&pageIdx>=0?'⏩ Read All':isLast?'🎓 Take the Quiz!':pageIdx===-1?<>Start Story! <ChevronRight size={14}/>:</>:<>Next <ChevronRight size={14}/></>}
              </motion.button>
              <Link to="/space-game">
                <motion.div whileHover={{scale:1.04}} className="bg-purple-500/20 border border-purple-400/25 text-purple-200 text-xs font-bold px-3 py-2.5 rounded-xl cursor-pointer flex items-center">
                  <Gamepad2 size={14}/>
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
