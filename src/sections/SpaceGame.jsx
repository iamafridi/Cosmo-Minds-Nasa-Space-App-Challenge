import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Rocket } from 'lucide-react';
import Navbar from './Navbar';

const FACTS = [
  {emoji:'🌡️',text:'Terra found Earth warmed 1.2°C since 1999!',sensor:'ASTER',color:'#ff6b6b'},
  {emoji:'🌳',text:'MODIS shows 2.3M km² of forest lost in 20 years.',sensor:'MODIS',color:'#51cf66'},
  {emoji:'☀️',text:'CERES tracks how much sunlight Earth reflects!',sensor:'CERES',color:'#ffd43b'},
  {emoji:'🌊',text:'Terra sees ocean temps rising and ice melting.',sensor:'MISR',color:'#74c0fc'},
  {emoji:'🏙️',text:'Cities can be 10°C hotter than nearby forests!',sensor:'ASTER',color:'#ff6b6b'},
  {emoji:'🌱',text:'Forests absorb 2.6 billion tons of CO₂ yearly!',sensor:'MODIS',color:'#51cf66'},
  {emoji:'🌈',text:'MISR uses 9 cameras to see air pollution!',sensor:'MISR',color:'#74c0fc'},
  {emoji:'❄️',text:'Arctic ice melts 13% faster every decade.',sensor:'MODIS',color:'#51cf66'},
  {emoji:'⚡',text:'The Sun sends 173,000 TW to Earth — CERES tracks it!',sensor:'CERES',color:'#ffd43b'},
];

function drawRocket(ctx, x, y, vy, f, inv) {
  if(inv>0 && Math.floor(f/5)%2===0) return;
  ctx.save(); ctx.translate(x,y);
  // Flame
  const fl=18+Math.sin(f*.3)*7;
  const fg=ctx.createLinearGradient(-10,0,-10-fl,0);
  fg.addColorStop(0,'rgba(255,200,50,.95)'); fg.addColorStop(.6,'rgba(255,80,20,.6)'); fg.addColorStop(1,'rgba(255,30,0,0)');
  ctx.beginPath(); ctx.moveTo(-10,-7); ctx.lineTo(-10-fl,0); ctx.lineTo(-10,7); ctx.fillStyle=fg; ctx.fill();
  // Body
  const bg=ctx.createLinearGradient(-12,-13,12,13);
  bg.addColorStop(0,'#e8f4ff'); bg.addColorStop(1,'#90b8dd');
  ctx.beginPath(); ctx.ellipse(0,0,21,11,0,0,Math.PI*2); ctx.fillStyle=bg; ctx.fill();
  ctx.strokeStyle='#6090b0'; ctx.lineWidth=1.2; ctx.stroke();
  // Nose
  ctx.beginPath(); ctx.moveTo(21,0); ctx.lineTo(10,-9); ctx.lineTo(10,9); ctx.fillStyle='#ff4444'; ctx.fill();
  // Wings
  ctx.beginPath(); ctx.moveTo(-2,10); ctx.lineTo(-11,21); ctx.lineTo(4,11); ctx.fillStyle='#c0d8f0'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(-2,-10); ctx.lineTo(-11,-21); ctx.lineTo(4,-11); ctx.fillStyle='#c0d8f0'; ctx.fill();
  // Window
  ctx.beginPath(); ctx.arc(4,0,5.5,0,Math.PI*2); ctx.fillStyle='rgba(100,200,255,.85)'; ctx.fill();
  ctx.strokeStyle='rgba(80,180,255,.8)'; ctx.lineWidth=1.3; ctx.stroke();
  // Kid face
  ctx.fillStyle='#ffcc88'; ctx.beginPath(); ctx.arc(4,0,4,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#333'; ctx.beginPath(); ctx.arc(2.5,-1,.8,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(5.5,-1,.8,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(4,1.5,1.5,0,Math.PI); ctx.strokeStyle='#c06020'; ctx.lineWidth=.8; ctx.stroke();
  // NASA label
  ctx.fillStyle='#003'; ctx.font='bold 4.5px Arial'; ctx.textAlign='center'; ctx.fillText('NASA',-5,4);
  ctx.restore();
}

function drawAsteroid(ctx,a) {
  ctx.save(); ctx.translate(a.x,a.y); ctx.rotate(a.rot);
  const R=a.r;
  ctx.beginPath();
  for(let i=0;i<a.pts;i++){
    const ang=(Math.PI*2*i)/a.pts;
    const r=R*(.75+Math.sin(i*3.7)*.25);
    i===0?ctx.moveTo(Math.cos(ang)*r,Math.sin(ang)*r):ctx.lineTo(Math.cos(ang)*r,Math.sin(ang)*r);
  }
  ctx.closePath();
  const g=ctx.createRadialGradient(0,0,0,0,0,R);
  g.addColorStop(0,'#887766'); g.addColorStop(1,'#332211');
  ctx.fillStyle=g; ctx.fill();
  ctx.strokeStyle='#554433'; ctx.lineWidth=1.5; ctx.stroke();
  ctx.restore();
}

function drawOrb(ctx,o,f) {
  const glow=3+Math.sin(f*.06)*2;
  ctx.save(); ctx.translate(o.x,o.y);
  ctx.shadowColor=o.fact.color; ctx.shadowBlur=18+glow*3;
  ctx.beginPath(); ctx.arc(0,0,o.r+glow,0,Math.PI*2);
  ctx.fillStyle=o.fact.color+'35'; ctx.fill();
  ctx.shadowBlur=0;
  ctx.beginPath(); ctx.arc(0,0,o.r,0,Math.PI*2);
  const rg=ctx.createRadialGradient(-3,-3,1,0,0,o.r);
  rg.addColorStop(0,'#fff'); rg.addColorStop(.4,o.fact.color); rg.addColorStop(1,o.fact.color+'88');
  ctx.fillStyle=rg; ctx.fill();
  ctx.font=`bold ${o.r}px Arial`; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(o.fact.emoji,0,0);
  ctx.restore();
}

function addParticles(arr,x,y,color,n=14){
  for(let i=0;i<n;i++){
    const ang=(Math.PI*2*i)/n+Math.random()*.4;
    const spd=Math.random()*4+2;
    arr.push({x,y,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd,alpha:1,sz:Math.random()*4+2,color,life:45});
  }
}

export default function SpaceGame() {
  const canvasRef=useRef(null);
  const gs=useRef(null); // game state ref — no setState during loop
  const rafRef=useRef(null);
  const keysRef=useRef({});
  const [phase,setPhase]=useState('menu'); // menu|playing|over|win
  const [uiScore,setUiScore]=useState(0);
  const [uiLives,setUiLives]=useState(3);
  const [fact,setFact]=useState(null);
  const [hs,setHs]=useState(()=>Number(localStorage.getItem('cosmo_hs')||0));

  const stopLoop=useCallback(()=>cancelAnimationFrame(rafRef.current),[]);

  const startGame=useCallback(()=>{
    const c=canvasRef.current; if(!c) return;
    const W=c.width=c.offsetWidth, H=c.height=c.offsetHeight;
    gs.current={
      W,H,f:0,score:0,lives:3,alive:true,speed:3,inv:0,
      rocket:{x:130,y:H/2,vy:0},
      asteroids:[],orbs:[],particles:[],
      stars:Array.from({length:90},()=>({x:Math.random()*W,y:Math.random()*H,sz:Math.random()*1.8+.3,spd:Math.random()*1.2+.4,a:Math.random()})),
      lastA:0,lastO:0,
    };
    setUiScore(0); setUiLives(3);
  },[]);

  const loop=useCallback(()=>{
    const s=gs.current; const c=canvasRef.current;
    if(!s||!c||!s.alive) return;
    const ctx=c.getContext('2d');
    const {W,H}=s;
    s.f++;

    // Input
    const up=keysRef.current['ArrowUp']||keysRef.current['w']||keysRef.current['W'];
    const dn=keysRef.current['ArrowDown']||keysRef.current['s']||keysRef.current['S'];
    if(up) s.rocket.vy-=.52;
    if(dn) s.rocket.vy+=.52;
    s.rocket.vy*=.88;
    s.rocket.y=Math.max(28,Math.min(H-28,s.rocket.y+s.rocket.vy));
    if(s.inv>0) s.inv--;

    // Speed ramp
    if(s.f%500===0) s.speed=Math.min(s.speed+.35,8);

    // Spawn asteroids
    const aInterval=Math.max(45,115-s.score*.4);
    if(s.f-s.lastA>aInterval){
      const szs=[16,22,30]; const sz=szs[s.f%3];
      s.asteroids.push({x:W+sz,y:Math.random()*(H-80)+40,vx:-(s.speed+Math.random()*1.2),vy:(Math.random()-.5)*.9,r:sz,rot:0,rv:(Math.random()-.5)*.05,pts:Math.floor(8+Math.random()*5)});
      s.lastA=s.f;
    }
    // Spawn orbs
    if(s.f-s.lastO>260){
      const fc=FACTS[s.f%FACTS.length];
      s.orbs.push({x:W+18,y:Math.random()*(H-100)+50,vx:-(s.speed*.65+.4),r:16,fact:fc});
      s.lastO=s.f;
    }

    // BG
    ctx.fillStyle='#020614'; ctx.fillRect(0,0,W,H);
    // Stars
    s.stars.forEach(st=>{
      st.x-=st.spd*.45; if(st.x<0){st.x=W;st.y=Math.random()*H;}
      const a=.3+Math.sin(s.f*.018+st.a*8)*.28;
      ctx.fillStyle=`rgba(200,220,255,${a})`; ctx.beginPath(); ctx.arc(st.x,st.y,st.sz,0,Math.PI*2); ctx.fill();
    });
    // Nebula tint
    const nb=ctx.createRadialGradient(W*.75,H*.25,0,W*.75,H*.25,220);
    nb.addColorStop(0,'rgba(70,15,130,.06)'); nb.addColorStop(1,'transparent');
    ctx.fillStyle=nb; ctx.fillRect(0,0,W,H);

    // Asteroids
    s.asteroids=s.asteroids.filter(a=>{
      a.x+=a.vx; a.y+=a.vy; a.rot+=a.rv;
      drawAsteroid(ctx,a);
      if(s.inv<=0){
        const dx=a.x-s.rocket.x,dy=a.y-s.rocket.y;
        if(Math.sqrt(dx*dx+dy*dy)<a.r+18){
          addParticles(s.particles,a.x,a.y,'#ff8844',18);
          s.lives--; s.inv=80; setUiLives(s.lives);
          if(s.lives<=0){s.alive=false;setPhase('over');setHs(prev=>{const h=Math.max(prev,s.score);localStorage.setItem('cosmo_hs',h);return h;});}
          return false;
        }
      }
      return a.x+a.r>-10;
    });

    // Orbs
    s.orbs=s.orbs.filter(o=>{
      o.x+=o.vx;
      drawOrb(ctx,o,s.f);
      const dx=o.x-s.rocket.x,dy=o.y-s.rocket.y;
      if(Math.sqrt(dx*dx+dy*dy)<o.r+16){
        addParticles(s.particles,o.x,o.y,o.fact.color,22);
        s.score+=10; setUiScore(s.score); setFact(o.fact); setTimeout(()=>setFact(null),3500);
        if(s.score>=200){s.alive=false;setPhase('win');}
        return false;
      }
      return o.x+o.r>-10;
    });

    // Particles
    s.particles=s.particles.filter(p=>{
      p.x+=p.vx; p.y+=p.vy; p.vx*=.93; p.vy*=.93; p.alpha-=.023; p.life--;
      if(p.alpha<=0) return false;
      ctx.globalAlpha=p.alpha; ctx.fillStyle=p.color;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.sz*p.alpha,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha=1;
      return p.life>0;
    });

    drawRocket(ctx,s.rocket.x,s.rocket.y,s.rocket.vy,s.f,s.inv);

    // HUD
    ctx.fillStyle='rgba(255,255,255,.9)'; ctx.font='bold 17px Nunito,Arial'; ctx.textAlign='left';
    ctx.fillText(`Score: ${s.score}`,16,34);
    ctx.textAlign='right'; ctx.fillText('❤️'.repeat(s.lives),W-16,34);
    // Progress bar
    const pct=Math.min(s.score/200,1);
    ctx.fillStyle='rgba(255,255,255,.1)'; ctx.fillRect(W/2-90,14,180,9);
    const pg=ctx.createLinearGradient(W/2-90,0,W/2+90,0);
    pg.addColorStop(0,'#4af'); pg.addColorStop(1,'#2fd');
    ctx.fillStyle=pg; ctx.fillRect(W/2-90,14,180*pct,9);
    ctx.strokeStyle='rgba(100,200,255,.35)'; ctx.lineWidth=1; ctx.strokeRect(W/2-90,14,180,9);
    ctx.fillStyle='rgba(255,255,255,.55)'; ctx.font='9px Arial'; ctx.textAlign='center';
    ctx.fillText(`${Math.round(pct*100)}% — Collect 20 orbs to WIN!`,W/2,38);

    rafRef.current=requestAnimationFrame(loop);
  },[]);

  useEffect(()=>{
    if(phase!=='playing') return;
    startGame();
    const onK=(e)=>{keysRef.current[e.key]=e.type==='keydown';};
    window.addEventListener('keydown',onK); window.addEventListener('keyup',onK);
    rafRef.current=requestAnimationFrame(loop);
    return ()=>{stopLoop();window.removeEventListener('keydown',onK);window.removeEventListener('keyup',onK);};
  },[phase,startGame,loop,stopLoop]);

  const touchStart=useCallback((e)=>{
    const midY=canvasRef.current?.offsetHeight/2||0;
    keysRef.current[e.touches[0].clientY<midY?'ArrowUp':'ArrowDown']=true;
  },[]);
  const touchEnd=useCallback(()=>{keysRef.current['ArrowUp']=false;keysRef.current['ArrowDown']=false;},[]);

  return (
    <div className="min-h-screen bg-[#020614] flex flex-col">
      <Navbar/>
      <div className="flex-1 pt-16 flex flex-col">
        {/* MENU */}
        {phase==='menu'&&(
          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
            <motion.div initial={{opacity:0,y:-28}} animate={{opacity:1,y:0}} className="text-center max-w-md">
              <div className="text-7xl mb-4 select-none">🚀</div>
              <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-teal-300 to-green-300 mb-3">
                Terra Space Rescue
              </h1>
              <p className="text-white/65 leading-relaxed mb-2">
                Pilot your rocket through space! Collect glowing <span className="text-yellow-300 font-bold">NASA data orbs</span> to learn cool Earth facts. Dodge <span className="text-red-300 font-bold">asteroids</span> — 3 hits and it's over!
              </p>
              <div className="flex flex-wrap justify-center gap-2 my-5">
                {[{c:'#ff6b6b',l:'ASTER — Temperature'},{c:'#51cf66',l:'MODIS — Forests'},{c:'#ffd43b',l:'CERES — Energy'},{c:'#74c0fc',l:'MISR — Aerosols'}].map(s=>(
                  <span key={s.l} className="text-[11px] font-bold px-3 py-1 rounded-full border" style={{color:s.c,borderColor:s.c+'70',background:s.c+'15'}}>{s.l}</span>
                ))}
              </div>
              <p className="text-white/35 text-xs mb-6">⌨️ Arrow keys / W·S &nbsp;·&nbsp; 📱 Tap top/bottom half</p>
              <motion.button onClick={()=>setPhase('playing')}
                whileHover={{scale:1.08,boxShadow:'0 0 40px rgba(50,200,150,.5)'}} whileTap={{scale:.93}}
                className="bg-gradient-to-r from-teal-500 to-blue-500 text-white font-black text-xl px-12 py-4 rounded-2xl shadow-xl">
                🚀 Launch!
              </motion.button>
              {hs>0&&<p className="mt-4 text-white/35 text-sm">Best score: {hs}</p>}
            </motion.div>
          </div>
        )}

        {/* GAME CANVAS */}
        {phase==='playing'&&(
          <div className="flex-1 relative">
            <canvas ref={canvasRef} className="w-full block" style={{height:'calc(100vh - 64px)',touchAction:'none'}}
              onTouchStart={touchStart} onTouchEnd={touchEnd} onTouchCancel={touchEnd}/>
            {/* Fact toast */}
            <AnimatePresence>
              {fact&&(
                <motion.div initial={{opacity:0,y:50,scale:.8}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-30}}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-sm pointer-events-none z-10">
                  <div className="rounded-2xl p-4 backdrop-blur-2xl border shadow-2xl"
                    style={{background:'rgba(5,12,40,.94)',borderColor:fact.color+'55'}}>
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{fact.emoji}</span>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{color:fact.color}}>📡 {fact.sensor} DATA</div>
                        <p className="text-white text-sm font-semibold leading-snug">{fact.text}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* OVER / WIN */}
        {(phase==='over'||phase==='win')&&(
          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
            <motion.div initial={{opacity:0,scale:.7}} animate={{opacity:1,scale:1}}
              transition={{type:'spring',stiffness:200,damping:18}} className="text-center max-w-sm">
              <motion.div className="text-8xl mb-4 select-none"
                animate={{scale:[1,1.18,1],rotate:[0,10,-10,0]}} transition={{duration:1,repeat:2}}>
                {phase==='win'?'🏆':'💥'}
              </motion.div>
              <h2 className="text-3xl font-black text-white mb-2">{phase==='win'?'Mission Complete!':'Crashed!'}</h2>
              <p className="text-white/55 mb-6">{phase==='win'?'You collected all NASA data! 🎉':'Asteroids got you! Try again!'}</p>
              <div className="glass rounded-2xl p-5 mb-6 flex gap-8 justify-center">
                <div><div className="text-4xl font-black text-teal-300">{uiScore}</div><div className="text-white/45 text-xs mt-1">Score</div></div>
                <div><div className="text-4xl font-black text-yellow-300">{hs}</div><div className="text-white/45 text-xs mt-1">Best</div></div>
              </div>
              <div className="flex gap-3 justify-center flex-wrap">
                <motion.button onClick={()=>setPhase('playing')} whileHover={{scale:1.06}} whileTap={{scale:.94}}
                  className="bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold px-7 py-3 rounded-full shadow-lg">
                  🔄 Play Again
                </motion.button>
                <Link to="/story"><motion.div whileHover={{scale:1.06}} whileTap={{scale:.94}}
                  className="bg-white/10 border border-white/20 text-white font-bold px-7 py-3 rounded-full cursor-pointer flex items-center gap-2">
                  <BookOpen size={14}/> Stories
                </motion.div></Link>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
