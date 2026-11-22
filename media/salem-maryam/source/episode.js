// سالم ومريم — الحلقة 1: «حفلة… ما صارت!»  (1920×1080 cartoon renderer, driven by timeline.js)
const W=1920,H=1080,FLOOR=900;
const cv=document.getElementById('c');let x=cv.getContext('2d');
// ---------- helpers ----------
function rng(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,eOut=t=>1-Math.pow(1-cl(t),3),eBack=t=>{t=cl(t);const c=1.9;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2)};
const seg=(t,a,b)=>cl((t-a)/(b-a));
function vg(y0,y1,st){const g=x.createLinearGradient(0,y0,0,y1);st.forEach(([o,c])=>g.addColorStop(o,c));return g}
function rg(cx,cy,r,st){const g=x.createRadialGradient(cx,cy,0,cx,cy,Math.max(1,r));st.forEach(([o,c])=>g.addColorStop(o,c));return g}
function rr(x0,y0,w,h,r){x.beginPath();x.moveTo(x0+r,y0);x.arcTo(x0+w,y0,x0+w,y0+h,r);x.arcTo(x0+w,y0+h,x0,y0+h,r);x.arcTo(x0,y0+h,x0,y0,r);x.arcTo(x0,y0,x0+w,y0,r);x.closePath()}
const INK='#2a2238';
function fs(fill,lw=6,stroke=INK){x.fillStyle=fill;x.fill();if(lw){x.lineWidth=lw;x.strokeStyle=stroke;x.lineJoin='round';x.stroke()}}
function circ(cx,cy,r){x.beginPath();x.arc(cx,cy,r,0,7)}
function ell(cx,cy,rx,ry,rot=0){x.beginPath();x.ellipse(cx,cy,Math.abs(rx),Math.abs(ry),rot,0,7)}

// ---------- timeline ----------
const BT={};TL.forEach(e=>BT[e.id]=e);
const S=(id,f=0)=>BT[id].start+BT[id].dur*f, P=(id,t)=>cl((t-BT[id].start)/BT[id].dur), E=id=>BT[id].start+BT[id].dur;
const inB=(id,t)=>t>=BT[id].start&&t<E(id);
function talk(spk,t){for(const e of TL)if(e.kind==='say'&&e.spk===spk&&t>=e.start&&t<e.start+e.dur){const v=e.env[Math.floor((t-e.start)*24)]||0;return v}return 0}
function beatAt(t){let b=TL[0];for(const e of TL)if(e.start<=t&&e.kind==='act'||e.start<=t&&e.kind==='say')b=e;return b}
function after(id,t){return t>=BT[id].start}

// ---------- characters ----------
const POSE={down:[0.18,0.05],hip:[0.75,-2.0],up:[2.7,0.2],point:[1.45,0.1],hold:[0.35,-1.85],mouth:[0.15,-2.75],palm:[0.2,-2.95],thumb:[1.05,1.25],cross:[0.28,-1.8],ear:[0.3,-2.95],shrug:[0.95,1.55],wave:[2.4,0.6],fist:[0.9,2.0],blow:[0.35,-2.6],fan:[1.6,0.8],carry:[0.55,-1.4],laugh:[0.5,-1.6]};
const armP=(a,o={})=>({...o,a:a});
function drawPerson(c,t){const s=c.s||1;x.save();x.translate(c.x,c.y);if(c.rot){x.translate(0,-150*s);x.rotate(c.rot);x.translate(0,150*s)}
  const sq=c.squash||0;x.scale(s*(1+sq*0.12),s*(1-sq*0.12));
  const hero=c.who==='s';const sitDrop=c.sit?70:0;x.translate(0,sitDrop);const bh=c.sit?230:300;const bob=c.bob||0;
  // feet
  x.fillStyle=hero?'#7a4b2a':'#2f1f4a';for(const d of[-1,1]){ell(d*40,-4,32,14);fs(x.fillStyle,5)}
  // robe
  const top=-bh-bob,sw=62,hw=c.sit?118:96;x.beginPath();x.moveTo(-sw,top+22);x.quadraticCurveTo(0,top-6,sw,top+22);x.lineTo(hw,-10);x.quadraticCurveTo(0,8,-hw,-10);x.closePath();
  fs(hero?'#fbfaf5':'#4b2e83',6);
  if(hero){x.strokeStyle='rgba(120,110,140,0.25)';x.lineWidth=5;x.beginPath();x.moveTo(-30,top+60);x.quadraticCurveTo(-40,top+170,-55,-20);x.moveTo(35,top+70);x.quadraticCurveTo(45,top+170,60,-20);x.stroke();
    if(c.apron){x.beginPath();x.moveTo(-50,top+60);x.lineTo(50,top+60);x.lineTo(70,-30);x.lineTo(-70,-30);x.closePath();fs('#e8655a',5);x.strokeStyle='#fff';x.lineWidth=6;for(let i=0;i<4;i++){x.beginPath();x.moveTo(-60+i*35,top+70);x.lineTo(-68+i*42,-35);x.stroke()}}
    // tassel
    x.strokeStyle='#b8925a';x.lineWidth=4;x.beginPath();x.moveTo(0,top+14);x.lineTo(Math.sin(t*3)*3,top+80);x.stroke();circ(Math.sin(t*3)*3,top+88,8);fs('#b8925a',3)}
  else{x.strokeStyle='#e8b64a';x.lineWidth=5;x.beginPath();x.moveTo(0,top+40);x.lineTo(0,-12);x.stroke();x.fillStyle='#e2557a';x.beginPath();x.moveTo(-hw+8,-12);x.quadraticCurveTo(0,4,hw-8,-12);x.lineTo(hw-14,-2);x.quadraticCurveTo(0,14,-hw+14,-2);x.fill()}
  // head
  const hy=top-88+(c.headBob||0),R=96;x.save();x.translate(c.headX||0,hy);if(c.headTilt)x.rotate(c.headTilt);
  if(!hero){// shaila (headscarf) behind
    x.beginPath();x.moveTo(-R*1.05,10);x.quadraticCurveTo(-R*1.35,-R*1.4,0,-R*1.22);x.quadraticCurveTo(R*1.35,-R*1.4,R*1.05,10);x.quadraticCurveTo(R*1.1,R*0.95,sw+10,88-0);x.lineTo(-sw-10,88);x.quadraticCurveTo(-R*1.1,R*0.95,-R*1.05,10);x.closePath();fs('#e2557a',6);
    x.fillStyle='rgba(255,255,255,0.35)';for(let i=0;i<14;i++){const a=i/14*Math.PI*2;circ(Math.cos(a)*R*1.02,Math.sin(a)*R*0.95-12,4);x.fill()}}
  else{for(const d of[-1,1]){circ(d*R*0.98,4,18);fs('#c98d64',5)}}
  // face
  const skin=hero?'#d29a72':'#eab38c';if(hero){circ(0,0,R)}else{ell(0,6,R*0.84,R*0.93)}fs(skin,6);
  x.save();if(hero)circ(0,0,R-3);else ell(0,6,R*0.84-3,R*0.93-3);x.clip();
  if(c.tint){x.fillStyle=c.tint;x.fillRect(-R,-R,2*R,2*R)}
  if(c.mask==='flour'){x.fillStyle='rgba(255,255,255,0.92)';const r=rng(4);for(let i=0;i<9;i++){circ((r()-0.5)*R*1.6,(r()-0.5)*R*1.6,R*0.5+r()*20);x.fill()}}
  if(c.mask==='rice'){x.fillStyle='#fffaf0';const r=rng(9);for(let i=0;i<30;i++){ell((r()-0.5)*R*1.8,(r()-0.6)*R*1.6,6,3,r()*3);x.fill()}}
  x.restore();
  if(hero){// beard + mustache
    x.strokeStyle='#3a2a20';x.lineWidth=15;x.lineCap='round';x.beginPath();x.arc(0,4,R*0.9,0.18*Math.PI,0.82*Math.PI);x.stroke();
    x.fillStyle='#3a2a20';x.beginPath();x.moveTo(-34,30);x.quadraticCurveTo(-18,20,0,28);x.quadraticCurveTo(18,20,34,30);x.quadraticCurveTo(18,40,0,34);x.quadraticCurveTo(-18,40,-34,30);x.fill();
    if(!c.noCap){// kumma
      x.beginPath();x.moveTo(-R*1.0,-R*0.28);x.bezierCurveTo(-R*1.05,-R*1.25,R*1.05,-R*1.25,R*1.0,-R*0.28);x.quadraticCurveTo(0,-R*0.42,-R*1.0,-R*0.28);fs('#fffdf6',6);kummaPattern(R)}
    else{x.fillStyle='#2a1d16';x.beginPath();x.arc(0,0,R,Math.PI*1.12,Math.PI*1.88);x.quadraticCurveTo(0,-R*0.6,-R*0.94,-R*0.33);x.fill()}
    if(c.potHat){x.save();x.translate(0,-R*0.85);x.rotate(Math.sin(t*2)*0.05);rr(-R*0.95,-70,R*1.9,95,18);fs('#9aa3ad',6);x.fillStyle='rgba(255,255,255,0.4)';x.fillRect(-R*0.7,-60,20,70);rr(-R*1.15,20,R*2.3,16,8);fs('#7d8791',5);for(const d of[-1,1]){ell(d*R*1.12,-20,18,10);x.lineWidth=7;x.strokeStyle=INK;x.stroke()}x.restore()}}
  // features
  face(c,t,R,hero);
  if(c.sweat){x.save();const sy=-R*0.45+((t*60)%40);x.translate(R*0.92,sy);x.beginPath();x.moveTo(0,-22);x.quadraticCurveTo(14,4,0,10);x.quadraticCurveTo(-14,4,0,-22);fs('#8fd3ff',4);x.restore()}
  if(c.vein){x.save();x.translate(-R*0.6,-R*0.65);x.strokeStyle='#e0262f';x.lineWidth=7;for(const a of[0,1,2,3]){x.save();x.rotate(a*Math.PI/2+0.3);x.beginPath();x.moveTo(6,6);x.quadraticCurveTo(14,4,16,16);x.stroke();x.restore()}x.restore()}
  if(!hero){x.lineWidth=6;x.strokeStyle='#b8325a';ell(0,6,R*0.84,R*0.93);x.stroke()}
  x.restore();
  // arms
  for(const side of[-1,1]){const A=side<0?c.armL:c.armR;if(!A)continue;const sh=[side*58,top+30];const a1=A.a[0],a2=A.a[1];
    const el=[sh[0]+Math.sin(a1)*side*80,sh[1]+Math.cos(a1)*80],ha=[el[0]+Math.sin(a1+a2)*side*72,el[1]+Math.cos(a1+a2)*72];
    x.lineCap='round';x.strokeStyle=INK;x.lineWidth=42;x.beginPath();x.moveTo(...sh);x.lineTo(...el);x.lineTo(...ha);x.stroke();
    x.strokeStyle=hero?'#fbfaf5':'#4b2e83';x.lineWidth=31;x.stroke();
    if(!hero){x.strokeStyle='#e8b64a';x.lineWidth=6;const cu=[lerp(el[0],ha[0],0.8),lerp(el[1],ha[1],0.8)];x.beginPath();x.arc(cu[0],cu[1],15,0,7);x.stroke()}
    if(A.hold)prop(A.hold,ha,side,t,A);
    circ(ha[0],ha[1],18);fs(skin,5);
    if(A.thumb){x.save();x.translate(ha[0],ha[1]-14);rr(-7,-22,14,26,7);fs(skin,4);x.restore()}
    if(A.holdFront)prop(A.holdFront,ha,side,t,A)}
  x.restore()}
function kummaPattern(R){x.save();x.beginPath();x.moveTo(-R*1.0,-R*0.28);x.bezierCurveTo(-R*1.05,-R*1.25,R*1.05,-R*1.25,R*1.0,-R*0.28);x.quadraticCurveTo(0,-R*0.42,-R*1.0,-R*0.28);x.clip();
  const cols=['#d23a3a','#2a7bd1','#2e9e5b','#e0a020'];for(let row=0;row<4;row++)for(let i=-9;i<=9;i++){const yy=-R*0.42-row*20,xx=i*12+(row%2)*6;x.fillStyle=cols[(i+row+20)%4];circ(xx,yy,3.4);x.fill()}
  x.strokeStyle='#2a7bd1';x.lineWidth=3;x.beginPath();for(let i=-10;i<=10;i++)x.lineTo(i*10,-R*0.95+(i%2?8:0));x.stroke();x.restore()}
function face(c,t,R,hero){const f=c.face||{};const lk=f.look||[0,0];const blink=f.noBlink?0:((t*0.37+((c.x||0)%7)*0.11)%1<0.035?1:0);const eyes=blink&&!['closed','happy','spiral'].includes(f.eyes)?'closed':(f.eyes||'open');
  const ey=-8,ex=34;
  for(const d of[-1,1]){const cx=d*ex;let st=eyes;if(eyes==='wink'&&d===1)st='happy';else if(eyes==='wink')st='open';
    if(st==='closed'){x.strokeStyle=INK;x.lineWidth=6;x.lineCap='round';x.beginPath();x.arc(cx,ey,18,0.15*Math.PI,0.85*Math.PI);x.stroke();continue}
    if(st==='happy'){x.strokeStyle=INK;x.lineWidth=7;x.lineCap='round';x.beginPath();x.arc(cx,ey+8,18,1.15*Math.PI,1.85*Math.PI);x.stroke();continue}
    const big=st==='wide'?1.3:1;ell(cx,ey,20*big,26*big);fs('#fff',5);
    if(st==='spiral'){x.strokeStyle=INK;x.lineWidth=3;x.beginPath();for(let a=0;a<14;a+=0.3){const r=a*1.4;x.lineTo(cx+Math.cos(a+t*8*d)*r,ey+Math.sin(a+t*8*d)*r)}x.stroke();continue}
    const pr=st==='wide'?6:11;circ(cx+lk[0]*8,ey+lk[1]*10+2,pr);x.fillStyle=hero?'#3a2414':'#4a2a14';x.fill();circ(cx+lk[0]*8-3,ey+lk[1]*10-2,pr*0.35);x.fillStyle='#fff';x.fill();
    if(st==='half'||st==='angry'){x.save();ell(cx,ey,21,27);x.clip();x.fillStyle=hero?'#d29a72':'#eab38c';x.beginPath();if(st==='half'){x.rect(cx-25,ey-30,50,28)}else{x.moveTo(cx-25,ey-30+(d<0?20:0));x.lineTo(cx+25,ey-30+(d<0?0:20));x.lineTo(cx+25,ey-40);x.lineTo(cx-25,ey-40)}x.fill();x.restore();
      x.strokeStyle=INK;x.lineWidth=5;x.beginPath();if(st==='half'){x.moveTo(cx-21,ey-2);x.lineTo(cx+21,ey-2)}else{x.moveTo(cx-21,ey-10+(d<0?20:0)*0.6);x.lineTo(cx+21,ey-10+(d<0?0:20)*0.6)}x.stroke()}
    if(!hero&&st!=='spiral'){x.strokeStyle=INK;x.lineWidth=4;for(let k=0;k<3;k++){x.beginPath();x.moveTo(cx+d*(10+k*6),ey-24+k*2);x.lineTo(cx+d*(18+k*8),ey-34+k*4);x.stroke()}}}
  // brows
  const br=f.brow||'neutral';x.strokeStyle=hero?'#2a1a12':'#3a2216';x.lineWidth=hero?10:7;x.lineCap='round';
  for(const d of[-1,1]){const cx=d*ex;let y0=ey-44,inner=0,outer=0;if(br==='raised'){y0-=12}if(br==='angry'){inner=14;outer=-6}if(br==='worried'){inner=-12;outer=6}if(br==='happy'){y0-=6}
    x.beginPath();x.moveTo(cx-d*18,y0+inner);x.quadraticCurveTo(cx,y0-6+(inner+outer)/2,cx+d*18,y0+outer);x.stroke()}
  // nose
  x.strokeStyle=hero?'#9c6440':'#c4845e';x.lineWidth=5;x.beginPath();x.arc(0,16,9,0.2*Math.PI,0.9*Math.PI);x.stroke();
  // cheeks
  if(!hero||f.blush){x.fillStyle=`rgba(255,110,130,${f.blush?0.45:0.25})`;ell(-58,30,16,9);x.fill();ell(58,30,16,9);x.fill()}
  if(f.puff){x.fillStyle=hero?'#d9926a':'#eba585';for(const d of[-1,1]){circ(d*55,40,30+f.puff*8);fs(x.fillStyle,5)}}
  // mouth
  const my=hero?50:52,a=c.talk||0,m=f.mouth||'smile';x.lineCap='round';x.lineJoin='round';
  if(a>0.04||m==='laugh'){const w=(m==='grin'||m==='laugh'?54:32)+a*10,h=m==='laugh'?34+Math.abs(Math.sin(t*18))*10:5+a*30;
    x.beginPath();x.moveTo(-w,my-2);x.quadraticCurveTo(0,my-6,w,my-2);x.quadraticCurveTo(w*0.8,my+h,0,my+h);x.quadraticCurveTo(-w*0.8,my+h,-w,my-2);x.closePath();fs('#7a1f2a',5);
    x.save();x.clip();x.fillStyle='#fff';x.fillRect(-w,my-8,2*w,9);x.fillStyle='#e05a6a';ell(0,my+h,w*0.55,h*0.45);x.fill();x.restore();return}
  x.strokeStyle=INK;x.lineWidth=6;x.beginPath();
  if(m==='smile'){x.arc(0,my-22,26,0.25*Math.PI,0.75*Math.PI);x.stroke()}
  else if(m==='grin'){x.moveTo(-46,my-6);x.quadraticCurveTo(0,my-10,46,my-6);x.quadraticCurveTo(30,my+30,0,my+30);x.quadraticCurveTo(-30,my+30,-46,my-6);x.closePath();fs('#fff',6);x.beginPath();x.moveTo(-40,my+8);x.lineTo(40,my+8);x.lineWidth=3;x.stroke()}
  else if(m==='frown'){x.arc(0,my+18,22,1.2*Math.PI,1.8*Math.PI);x.stroke()}
  else if(m==='o'){ell(0,my+6,11,14);fs('#7a1f2a',5)}
  else if(m==='open'){ell(0,my+10,24,30);fs('#7a1f2a',6)}
  else if(m==='flat'){x.moveTo(-20,my+4);x.lineTo(20,my+4);x.stroke()}
  else if(m==='wavy'){x.moveTo(-30,my+4);for(let i=-30;i<=30;i+=6)x.lineTo(i,my+4+((i/6)%2?6:-6));x.stroke()}
  else if(m==='smirk'){x.moveTo(-22,my+6);x.quadraticCurveTo(8,my+12,26,my-4);x.stroke()}
  else if(m==='chew'){const k=Math.abs(Math.sin(t*12));ell(0,my+4,16,3+k*6);fs('#7a1f2a',5)}}
function prop(kind,h,side,t,A){x.save();x.translate(h[0],h[1]);x.lineJoin='round';
  if(kind==='notebook'){x.rotate(side*0.2);rr(-34,-56,68,84,6);fs('#ff8fb1',5);x.fillStyle='#fff';rr(-26,-48,52,68,4);x.fill();x.strokeStyle='#9aa';x.lineWidth=3;for(let i=0;i<5;i++){x.beginPath();x.moveTo(-20,-36+i*12);x.lineTo(20,-36+i*12);x.stroke()}}
  else if(kind==='date'){ell(0,-14,9,14);fs('#6b3a1c',3)}
  else if(kind==='phone'){x.rotate(side*-0.3);rr(-14,-46,28,56,6);fs('#222a35',4);x.fillStyle='#6fd0ff';x.fillRect(-10,-40,20,38)}
  else if(kind==='whisk'){x.rotate(Math.sin(t*30)*0.6);x.strokeStyle='#888';x.lineWidth=4;for(let i=-1;i<=1;i++){x.beginPath();x.ellipse(i*4,-50,9,26,0,0,7);x.stroke()}x.strokeStyle='#5a3a22';x.lineWidth=9;x.beginPath();x.moveTo(0,-20);x.lineTo(0,10);x.stroke()}
  else if(kind==='bowl'){x.beginPath();x.moveTo(-80,-30);x.lineTo(80,-30);x.quadraticCurveTo(70,40,0,40);x.quadraticCurveTo(-70,40,-80,-30);fs('#f3f0ea',6);ell(0,-30,80,16);fs('#f7e3a8',5)}
  else if(kind==='towel'){x.rotate(Math.sin(t*16)*0.8);x.beginPath();x.moveTo(0,0);x.quadraticCurveTo(40,-40,30,-110);x.lineTo(70,-100);x.quadraticCurveTo(70,-40,20,10);fs('#f4c542',5)}
  else if(kind==='cake'){rr(-70,-60,140,60,18);fs('#1d1716',6);x.fillStyle='#3a2c28';for(let i=0;i<6;i++){circ(-50+i*20,-40+(i%2)*14,6);x.fill()}}
  else if(kind==='sugar'){x.rotate(A.tilt||0);rr(-42,-110,84,110,10);fs('#ffffff',6);rr(-42,-110,84,26,8);fs('#e0464f',5);x.fillStyle=INK;x.font='34px Kufi';x.textAlign='center';x.direction='rtl';x.fillText('سكر',0,-34)}
  else if(kind==='spoon'){x.strokeStyle='#999';x.lineWidth=7;x.beginPath();x.moveTo(0,0);x.lineTo(-side*30,-60);x.stroke();ell(-side*36,-74,14,10,0.5);fs('#bbb',4)}
  else if(kind==='plates'){for(let i=0;i<3;i++){ell(0,-20-i*12,60,13);fs('#fff',5)}}
  else if(kind==='pen'){x.rotate(side*0.6);rr(-5,-50,10,50,3);fs('#2a7bd1',3)}
  x.restore()}
function drawCat(c,t){const s=c.s||1,f=c.f||1;x.save();x.translate(c.x,c.y);x.scale(s*f,s);const st=c.state||'sit';const O='#f39a3c',D='#c86a1a';
  if(st==='pounce'||st==='fly'){x.rotate(-0.35);ell(0,-50,85,38);fs(O,6);for(const lx of[-60,55]){x.save();x.translate(lx,-30);x.rotate(lx>0?-0.9:0.9);rr(-10,0,20,55,10);fs(O,5);x.restore()}}
  else if(st==='walk'){const k=Math.sin(t*10);for(const[lx,ph]of[[-45,0],[-25,1],[30,0],[50,1]]){x.save();x.translate(lx,-28);x.rotate((ph?k:-k)*0.4);rr(-9,0,18,30,9);fs(O,5);x.restore()}ell(0,-55,75,35);fs(O,6)}
  else{ell(0,-48,58,50);fs(O,6);for(const d of[-1,1]){ell(d*24,-6,18,10);fs(O,5)}}
  x.strokeStyle=D;x.lineWidth=7;for(let i=0;i<3;i++){x.beginPath();x.arc(-10+i*18,-60,22,1.2*Math.PI,1.6*Math.PI);x.stroke()}
  if(st==='scared'){x.save();x.beginPath();for(let i=0;i<24;i++){const a=i/24*Math.PI*2,r=i%2?75:58;x.lineTo(Math.cos(a)*r,-50+Math.sin(a)*r*0.9)}x.closePath();fs(O,6);x.restore()}
  // tail
  const sw=Math.sin(t*(c.tailSpeed||3))*0.5;x.strokeStyle=INK;x.lineWidth=24;x.lineCap='round';x.beginPath();x.moveTo(-50,-30);x.quadraticCurveTo(-120,-40+sw*30,-110+sw*30,st==='scared'?-160:-110);x.stroke();x.strokeStyle=O;x.lineWidth=14;x.stroke();
  // head
  const hx=st==='pounce'||st==='fly'?70:st==='walk'?60:22,hy=st==='pounce'||st==='fly'?-95:st==='walk'?-95:-115;x.save();x.translate(hx,hy);
  for(const d of[-1,1]){x.beginPath();x.moveTo(d*14,-30);x.lineTo(d*40,-62);x.lineTo(d*42,-14);x.closePath();fs(O,5);x.beginPath();x.moveTo(d*22,-30);x.lineTo(d*38,-50);x.lineTo(d*38,-24);x.fillStyle='#ffb6c1';x.fill()}
  circ(0,0,44);fs(O,6);
  const lk=c.look||[0,0];for(const d of[-1,1]){if(c.eyes==='happy'){x.strokeStyle=INK;x.lineWidth=5;x.beginPath();x.arc(d*17,0,9,1.1*Math.PI,1.9*Math.PI);x.stroke();continue}
    ell(d*17,-4,11,st==='scared'?16:14);fs('#c8f26a',4);ell(d*17+lk[0]*4,-4+lk[1]*4,3.5,st==='scared'?4:10);x.fillStyle='#111';x.fill()}
  x.beginPath();x.moveTo(-6,10);x.lineTo(6,10);x.lineTo(0,16);x.closePath();fs('#ff8fa3',3);
  if(c.meow){ell(0,26,10,6+c.meow*10);fs('#7a1f2a',4)}else{x.strokeStyle=INK;x.lineWidth=3;x.beginPath();x.arc(-6,18,6,0,Math.PI);x.arc(6,18,6,0,Math.PI);x.stroke()}
  x.strokeStyle=INK;x.lineWidth=2;for(const d of[-1,1])for(let i=-1;i<=1;i++){x.beginPath();x.moveTo(d*20,14+i*5);x.lineTo(d*58,8+i*10);x.stroke()}
  if(c.cap){x.save();x.translate(0,-36);x.rotate(-0.15);x.beginPath();x.moveTo(-36,8);x.bezierCurveTo(-38,-34,38,-34,36,8);x.quadraticCurveTo(0,2,-36,8);fs('#fffdf6',4);x.restore()}
  x.restore();x.restore()}

// ---------- sets ----------
function livingSet(t,o={}){
  x.fillStyle=vg(0,780,[[0,'#f8e9cc'],[1,'#ecd3a6']]);x.fillRect(-200,-200,W+400,1000);
  x.fillStyle='#d19a5c';x.fillRect(-200,590,W+400,22);x.fillStyle='#b5763c';for(let i=-200;i<W+200;i+=36){x.beginPath();x.moveTo(i,612);x.lineTo(i+18,630);x.lineTo(i+36,612);x.fill()}
  // window (Omani arch + mashrabiya)
  const wx=1500,wy=130,ww=280,wh=420;x.save();x.beginPath();x.moveTo(wx,wy+wh);x.lineTo(wx,wy+140);x.quadraticCurveTo(wx,wy+20,wx+ww/2,wy);x.quadraticCurveTo(wx+ww,wy+20,wx+ww,wy+140);x.lineTo(wx+ww,wy+wh);x.closePath();
  x.fillStyle=vg(wy,wy+wh,[[0,'#ff9e6b'],[0.6,'#ffcf8a'],[1,'#ffe6b0']]);x.fill();x.lineWidth=16;x.strokeStyle='#8a5a32';x.stroke();x.clip();
  x.fillStyle='#c97a4a';x.beginPath();x.moveTo(wx,wy+wh);for(let i=0;i<=ww;i+=20)x.lineTo(wx+i,wy+wh-80-40*Math.abs(Math.sin(i*0.03)));x.lineTo(wx+ww,wy+wh);x.fill();
  x.strokeStyle='rgba(138,90,50,0.8)';x.lineWidth=5;for(let i=-10;i<20;i++){x.beginPath();x.moveTo(wx+i*30,wy);x.lineTo(wx+i*30+300,wy+wh);x.moveTo(wx+i*30+300,wy);x.lineTo(wx+i*30,wy+wh);x.stroke()}x.restore();
  // picture of a fort
  rr(250,190,240,170,8);fs('#a0662f',10);x.fillStyle=vg(200,350,[[0,'#ffb86b'],[1,'#ff7a59']]);x.fillRect(262,202,216,146);x.fillStyle='#6b3a2a';x.fillRect(300,280,140,68);x.fillRect(340,250,60,98);for(let i=0;i<7;i++)x.fillRect(300+i*20,272,12,10);
  // lantern
  x.strokeStyle='#6b4a2a';x.lineWidth=4;x.beginPath();x.moveTo(960,0);x.lineTo(960,120);x.stroke();x.fillStyle=rg(960,170,140,[[0,'rgba(255,210,120,0.5)'],[1,'rgba(255,210,120,0)']]);x.fillRect(820,30,280,280);
  x.beginPath();x.moveTo(930,120);x.lineTo(990,120);x.lineTo(1010,180);x.lineTo(960,230);x.lineTo(910,180);x.closePath();fs('#e8b64a',5);x.fillStyle='#fff1b8';x.fillRect(945,145,30,45);
  // floor + carpet
  x.fillStyle=vg(780,1080,[[0,'#c99062'],[1,'#a46d43']]);x.fillRect(-200,780,W+400,500);x.strokeStyle='rgba(90,50,25,0.25)';x.lineWidth=3;for(let i=0;i<8;i++){x.beginPath();x.moveTo(-200,800+i*40+i*i*4);x.lineTo(W+200,800+i*40+i*i*4);x.stroke()}
  ell(960,965,760,105);fs('#a83444',0);ell(960,965,700,88);x.strokeStyle='#e8b64a';x.lineWidth=8;x.stroke();ell(960,965,560,60);x.strokeStyle='#2e6f8e';x.lineWidth=10;x.stroke();
  // plant
  rr(110,700,110,130,16);fs('#c4683a',6);x.strokeStyle='#2e8b4f';x.lineWidth=14;x.lineCap='round';for(let i=0;i<7;i++){const a=-Math.PI/2+(i-3)*0.38+Math.sin(t*1.2+i)*0.04;x.beginPath();x.moveTo(165,700);x.quadraticCurveTo(165+Math.cos(a)*90,700+Math.sin(a)*160,165+Math.cos(a)*160,700+Math.sin(a)*190+60);x.stroke()}
  if(o.sofa!==false){rr(400,560,860,190,40);fs('#b03a48',7);for(let i=0;i<4;i++){rr(430+i*205,590,190,140,30);fs('#c84a5a',5)}rr(380,720,900,110,30);fs('#9a2f3d',7);x.strokeStyle='#e8b64a';x.lineWidth=6;x.beginPath();x.moveTo(400,775);x.lineTo(1260,775);x.stroke()}
}
function coffeeTable(t){rr(800,820,320,24,10);fs('#7a4b2a',6);x.fillStyle='#5e3a20';x.fillRect(820,844,18,50);x.fillRect(1082,844,18,50);ell(900,815,60,14);fs('#fff',5);x.fillStyle='#6b3a1c';for(let i=0;i<5;i++){ell(870+i*14,808,8,6);x.fill()}
  // dallah
  x.save();x.translate(1050,820);x.beginPath();x.moveTo(-28,0);x.quadraticCurveTo(-36,-60,-14,-80);x.lineTo(14,-80);x.quadraticCurveTo(36,-60,28,0);x.closePath();fs('#e8b64a',5);x.beginPath();x.moveTo(-20,-60);x.quadraticCurveTo(-60,-70,-62,-100);x.lineWidth=8;x.strokeStyle=INK;x.stroke();x.lineWidth=4;x.strokeStyle='#e8b64a';x.stroke();ell(0,-84,16,8);fs('#e8b64a',4);x.restore()}
function kitchenSet(t,o={}){
  x.fillStyle='#d4ece6';x.fillRect(-200,-200,W+400,1000);x.strokeStyle='rgba(120,170,165,0.5)';x.lineWidth=2;for(let i=-200;i<W+200;i+=60){x.beginPath();x.moveTo(i,0);x.lineTo(i,620);x.stroke()}for(let j=0;j<620;j+=60){x.beginPath();x.moveTo(-200,j);x.lineTo(W+200,j);x.stroke()}
  for(let i=0;i<5;i++){rr(560+i*170,110,160,210,10);fs('#86b9cc',6);circ(560+i*170+140,300,7);fs('#e8b64a',3)}
  // window
  rr(150,170,320,300,12);fs('#9fdcff',10);x.fillStyle='#fff';x.fillRect(150,170,320,30);x.fillStyle='#ffd38a';ell(310,330,60,60);x.fill();
  x.fillStyle='#ff8fb1';x.beginPath();x.moveTo(140,160);x.quadraticCurveTo(200,320,170,480);x.lineTo(140,480);x.fill();x.beginPath();x.moveTo(480,160);x.quadraticCurveTo(420,320,450,480);x.lineTo(480,480);x.fill();
  // alarm light
  circ(1160,120,26);fs(o.alarm&&Math.floor(t*4)%2?'#ff2a2a':'#8a2a2a',5);if(o.alarm&&Math.floor(t*4)%2){x.fillStyle=rg(1160,120,200,[[0,'rgba(255,40,40,0.35)'],[1,'rgba(255,40,40,0)']]);x.fillRect(960,-80,400,400)}
  // fridge
  rr(1650,180,240,620,24);fs('#f4f6f8',7);x.beginPath();x.moveTo(1650,420);x.lineTo(1890,420);x.stroke();rr(1670,300,14,90,7);fs('#bbb',3);rr(1670,450,14,120,7);fs('#bbb',3);
  // floor
  x.fillStyle='#e9e1d3';x.fillRect(-200,780,W+400,500);for(let i=-4;i<40;i++)for(let j=0;j<6;j++)if((i+j)%2){x.fillStyle='#d8ccb8';x.fillRect(i*64,780+j*64,64,64)}
}
function counter(t,o={}){x.fillStyle='#6fa3b8';x.fillRect(-200,640,1400,200);x.strokeStyle=INK;x.lineWidth=6;x.strokeRect(-200,640,1400,200);for(let i=0;i<7;i++){x.strokeRect(-180+i*190,660,170,160);rr(-110+i*190,680,40,10,5);fs('#e8b64a',3)}
  rr(-220,610,1440,36,10);fs('#efe6d8',6);
  // containers
  if(!o.noSugar){rr(560,520,84,96,10);fs('#fff',6);rr(560,520,84,24,8);fs('#e0464f',5);x.fillStyle=INK;x.font='30px Kufi';x.textAlign='center';x.fillText('سكر',602,595)}
  rr(660,530,80,86,10);fs('#fff',6);rr(660,530,80,22,8);fs('#2a7bd1',5);x.fillStyle=INK;x.font='30px Kufi';x.textAlign='center';x.fillText('ملح',700,595);
  rr(400,500,110,116,16);fs('#f3e6c8',6);x.fillStyle=INK;x.font='26px Kufi';x.fillText('طحين',455,575)}
function oven(t,o={}){const sh=o.shake?Math.sin(t*60)*o.shake:0;x.save();x.translate(sh,0);
  rr(1220,560,320,280,16);fs('#e8e4dc',7);rr(1220,560,320,60,14);fs('#cfc8bc',6);for(let i=0;i<4;i++){circ(1260+i*80,590,14);fs('#555',4)}
  if(o.open){x.beginPath();x.moveTo(1250,830);x.lineTo(1510,830);x.lineTo(1540,900);x.lineTo(1220,900);x.closePath();fs('#555',6)}else{rr(1250,640,260,170,12);fs('#30343a',6);x.fillStyle=o.glow?`rgba(255,120,40,${o.glow})`:'#4a5058';rr(1275,665,210,120,10);x.fill();rr(1300,620,160,12,6);fs('#bbb',3)}
  // pot on stove
  if(o.pot){rr(1290,470,180,95,18);fs('#9aa3ad',6);rr(1270,460,220,20,10);fs('#7d8791',5);if(o.steam){x.strokeStyle='rgba(255,255,255,0.7)';x.lineWidth=8;for(let i=0;i<3;i++){x.beginPath();const bx=1330+i*50;x.moveTo(bx,450);x.bezierCurveTo(bx-20,410,bx+20,380,bx-(Math.sin(t*3+i)*15),330);x.stroke()}}}
  x.restore()}
function diningTable(t,items=true){rr(660,690,600,30,10);fs('#7a4b2a',6);x.fillStyle='#5e3a20';x.fillRect(690,720,24,180);x.fillRect(1206,720,24,180);
  if(items){x.beginPath();x.moveTo(640,690);x.lineTo(1280,690);x.lineTo(1300,800);x.quadraticCurveTo(960,820,620,800);x.closePath();fs('#fff',6);x.strokeStyle='#d23a3a';x.lineWidth=8;x.beginPath();x.moveTo(624,785);x.quadraticCurveTo(960,805,1296,785);x.stroke();
    x.fillStyle='#d23a3a';circ(1290,820,10);x.fill();x.strokeStyle='#d23a3a';x.lineWidth=4;x.beginPath();x.moveTo(1290,800);x.lineTo(1290+Math.sin(t*3)*4,815);x.stroke()}}
function tableItems(t,o){// pot, plates, burnt cake on table
  rr(860,600,160,90,16);fs('#9aa3ad',6);rr(845,590,190,18,9);fs('#7d8791',5);
  for(const px of[720,1160]){ell(px,686,56,12);fs('#fff',5)}rr(1060,640,100,48,14);fs('#1d1716',6);
  for(const bx of[620,1300]){x.strokeStyle='#888';x.lineWidth=2;x.beginPath();x.moveTo(bx,700);x.lineTo(bx+Math.sin(t+bx)*10,420);x.stroke();ell(bx+Math.sin(t+bx)*10,380,46,56);fs(bx<900?'#e0464f':'#2e9e5b',5)}}

// ---------- fx ----------
function burst(cx,cy,r,text,col='#ffd23a',p=1){x.save();x.translate(cx,cy);x.scale(p,p);x.beginPath();for(let i=0;i<28;i++){const a=i/28*Math.PI*2,R=i%2?r:r*0.62;x.lineTo(Math.cos(a)*R,Math.sin(a)*R)}x.closePath();fs(col,8);
  x.font=`${r*0.55}px Kufi`;x.textAlign='center';x.textBaseline='middle';x.direction='rtl';x.lineWidth=12;x.strokeStyle=INK;x.strokeText(text,0,0);x.fillStyle='#fff';x.fillText(text,0,0);x.restore()}
function comic(text,cx,cy,size,rot=0,col='#fff'){x.save();x.translate(cx,cy);x.rotate(rot);x.font=`${size}px Kufi`;x.textAlign='center';x.textBaseline='middle';x.direction='rtl';x.lineWidth=size*0.16;x.strokeStyle=INK;x.lineJoin='round';x.strokeText(text,0,0);x.fillStyle=col;x.fillText(text,0,0);x.restore()}
function smoke(cx,cy,t,n,k,col='120,120,130'){const r=rng(11);for(let i=0;i<n;i++){const ph=(t*0.5+r())%1,px=cx+(r()-0.5)*160+Math.sin(t*2+i)*30,py=cy-ph*420,sz=(40+r()*60)*(0.5+ph)*k;x.fillStyle=`rgba(${col},${0.75*(1-ph)*cl(k)})`;circ(px,py,sz);x.fill()}}
function stars(cx,cy,t,n=5){for(let i=0;i<n;i++){const a=t*5+i/n*Math.PI*2;const px=cx+Math.cos(a)*120,py=cy+Math.sin(a)*30;x.save();x.translate(px,py);x.rotate(t*4);x.beginPath();for(let k=0;k<10;k++){const r=k%2?8:20;x.lineTo(Math.cos(k*Math.PI/5)*r,Math.sin(k*Math.PI/5)*r)}x.closePath();fs('#ffd23a',4);x.restore()}}
function marks(cx,cy,ch,p){if(p<=0)return;const s=eBack(cl(p*3));comic(ch,cx,cy-20*s,90*s,0,'#ffd23a')}
function confetti(t,n=80,a=1){const r=rng(21),cols=['#ff5a7a','#ffd23a','#4ee08a','#4ab3ff','#b06bff'];for(let i=0;i<n;i++){const px=(r()*W+Math.sin(t*2+i)*40),py=((r()*H+t*(120+r()*120))%(H+60))-30;x.save();x.globalAlpha=a;x.translate(px,py);x.rotate(t*3+i);x.fillStyle=cols[i%5];x.fillRect(-8,-4,16,8);x.restore()}}
function steam(cx,cy,t,side){for(let i=0;i<4;i++){const ph=(t*2+i*0.25)%1;x.fillStyle=`rgba(255,255,255,${0.9*(1-ph)})`;circ(cx+side*(20+ph*80),cy-ph*60,14+ph*22);x.fill()}}

// ---------- camera ----------
let CAM={x:960,y:540,z:1};
function cam(c){CAM=c}
function wide(){return{x:960,y:540,z:1}}
function cu(px,py,z=1.9){return{x:px,y:py,z}}
function applyCam(shake=0){const c=CAM;const z=Math.max(1,c.z);const hw=W/2/z,hh=H/2/z;const cx=cl(c.x,hw,W-hw),cy=cl(c.y,hh,H-hh);x.translate(W/2+(shake?Math.sin(T*70)*shake:0),H/2+(shake?Math.cos(T*53)*shake:0));x.scale(z,z);x.translate(-cx,-cy)}
let T=0;

// ---------- character state builders ----------
function salem(o){return Object.assign({who:'s',x:700,y:FLOOR,s:1,armL:armP(POSE.down),armR:armP(POSE.down),face:{}},o)}
function maryam(o){return Object.assign({who:'m',x:1250,y:FLOOR,s:0.95,armL:armP(POSE.down),armR:armP(POSE.down),face:{}},o)}
var headPos=(c)=>[c.x,c.y-(c.sit?230:300)*(c.s||1)-88*(c.s||1)+(c.sit?70:0)];
function walkBob(t,on){return on?Math.abs(Math.sin(t*9))*-14:0}

// ---------- scenes ----------
function sTitle(t){const p=P('title',t);x.fillStyle=rg(W/2,H/2,1100,[[0,'#ffcf6b'],[0.6,'#ff8a5c'],[1,'#d9456b']]);x.fillRect(0,0,W,H);
  x.save();x.translate(W/2,H/2);x.rotate(t*0.15);for(let i=0;i<24;i++){x.rotate(Math.PI/12);x.fillStyle='rgba(255,255,255,0.08)';x.beginPath();x.moveTo(0,0);x.lineTo(-90,-1400);x.lineTo(90,-1400);x.fill()}x.restore();
  confetti(t);
  const pop1=eBack(seg(t,0.2,0.9)),pop2=eBack(seg(t,0.8,1.5));
  const sal=salem({x:560,y:1180+(1-pop1)*400,s:1.15,face:{mouth:'grin',brow:'raised',eyes:'open'},armL:armP(POSE.wave),armR:armP(POSE.down)});sal.armL.a=[2.4+Math.sin(t*8)*0.3,0.5];drawPerson(sal,t);
  const mar=maryam({x:1360,y:1180+(1-pop2)*400,s:1.1,face:{mouth:'smile',brow:'happy',eyes:'happy'},armR:armP(POSE.wave)});mar.armR.a=[2.4+Math.sin(t*8+1)*0.3,0.5];drawPerson(mar,t);
  drawCat({x:960,y:1080+(1-eBack(seg(t,1.3,1.9)))*300,s:1.1,eyes:'happy'},t);
  const tp=eBack(seg(t,0.4,1.1));x.save();x.translate(W/2,300);x.scale(tp,tp);x.rotate(Math.sin(t*2)*0.03);comic('سالم ومريم',0,0,190,0,'#fff');x.restore();
  const sp=eOut(seg(t,1.3,1.9));x.save();x.globalAlpha=sp;rr(W/2-430,430,860,96,48);fs('#2a2238',0);x.fillStyle='rgba(42,34,56,0.85)';x.fill();comic('الحلقة ١ : حفلة… ما صارت!',W/2,478+(1-sp)*30,62,0,'#ffd23a');x.restore()}

function sLiving(t){const b=beatAt(t).id;livingSet(t);
  const standUp=eOut(seg(t,S('s1'),S('s1')+0.35));const sitting=t<S('s1');
  const mx=lerp(2150,1260,eOut(P('enter',t)));const walking=inB('enter',t);
  let sf={eyes:'open',mouth:'chew',brow:'neutral',look:[0.6,0]},mf={eyes:'open',mouth:'smile',brow:'raised',look:[-0.6,0]};
  const s=salem({x:720,sit:sitting,face:sf,talk:talk('s',t)});const m=maryam({x:mx,bob:walkBob(t,walking),face:mf,talk:talk('m',t),armL:armP(POSE.hold,{hold:'notebook'}),armR:armP(POSE.point,{hold:'pen'})});
  m.armR.a=[0.6,-1.2];
  // eating dates
  if(t<S('choke')){const k=(t*0.8)%1;s.armR=armP(k<0.5?POSE.mouth:[0.5,-1.0],{hold:k<0.5?'date':null});sf.mouth=k<0.5?'o':'chew';sf.look=[0.6,0]}
  if(inB('choke',t)){const p=P('choke',t);sf.eyes='wide';sf.mouth=p<0.5?'puff':'open';sf.puff=p<0.5?1:0;s.tint=`rgba(220,40,40,${0.35*Math.sin(p*Math.PI)})`;s.armR=armP([0.4,-1.9]);s.headBob=Math.sin(t*40)*4*(1-p);mf.eyes='wide';mf.mouth='o'}
  if(after('s1',t)){s.y=FLOOR-Math.sin(standUp*Math.PI)*60;sf.eyes='wide';sf.brow='raised';sf.mouth='open';s.armL=armP(POSE.up);s.armR=armP(POSE.up);s.squash=-Math.sin(standUp*Math.PI)*0.5}
  if(after('m2',t)){sf.eyes='open';sf.mouth='flat';s.armL=armP(POSE.down);s.armR=armP(POSE.down);mf.eyes='half';mf.mouth='smile';mf.brow='neutral'}
  if(inB('gulp',t)){sf.eyes='wide';sf.mouth='wavy';s.sweat=true;sf.brow='worried'}
  if(after('m3',t)){sf.eyes='open';sf.mouth='smile';sf.brow='neutral';s.headBob=inB('m3',t)?Math.abs(Math.sin(t*5))*8:0;mf.eyes='open';mf.brow='neutral';m.armR=armP(POSE.point,{hold:'pen'})}
  if(after('s2',t)){sf.mouth='grin';sf.brow='raised';sf.eyes='open';s.armR=armP(POSE.thumb,{thumb:true});s.armL=armP(POSE.hip);s.squash=-0.15;mf.eyes='half';mf.brow='raised';mf.mouth='flat';m.armR=armP(POSE.cross);m.armL=armP(POSE.cross,{hold:'notebook'})}
  if(after('wink',t)){sf.eyes='wink'}
  // date flying to notebook
  if(inB('choke',t)){const p=P('choke',t);if(p>0.35){const q=seg(p,0.35,0.8);const hp=headPos(s);x.save();ell(lerp(hp[0],m.x-60,q),lerp(hp[1]+40,m.y-330,q)-Math.sin(q*Math.PI)*120,9,14,q*12);fs('#6b3a1c',3);x.restore()}}
  // camera
  const hs=headPos(s),hm=headPos(m);
  if(b==='m1'||b==='m2')cam(cu(hm[0],hm[1]+90,b==='m2'?2.1:1.8));
  else if(b==='s1'||b==='s2'||b==='wink')cam(cu(hs[0],hs[1]+90,b==='s1'?1.7:1.9));
  else if(b==='gulp')cam(cu(hs[0],hs[1]+40,2.6));
  else if(b==='m3')cam({x:(hs[0]+hm[0])/2,y:560,z:1.35});
  else cam(wide());
  return{chars:[s,m],after:()=>{coffeeTable(t);
    if(inB('choke',t)&&P('choke',t)>0.75)comic('!',m.x+40,m.y-560,110,0.2,'#ffd23a');
    if(inB('gulp',t)){const p=P('gulp',t);comic('غُلْب!',hs[0]+150,hs[1]-60,70*eBack(seg(p,0.3,0.6)),-0.2,'#8fd3ff')}
    if(after('s2',t)&&t<E('wink')){const p=seg(t,S('wink'),S('wink')+0.5);if(p>0&&p<1){x.save();x.translate(hs[0]+30,hs[1]+60);x.rotate(p*3);x.scale(Math.sin(p*Math.PI),Math.sin(p*Math.PI));x.beginPath();for(let k=0;k<8;k++){const r=k%2?10:46;x.lineTo(Math.cos(k*Math.PI/4)*r,Math.sin(k*Math.PI/4)*r)}x.closePath();fs('#fff',4);x.restore()}}}}
}

function sBalloon(t){const b=beatAt(t).id;livingSet(t);
  const blow=P('blow',t),pp=P('pop',t),popped=t>=S('pop',0.12);
  const s=salem({x:800,face:{eyes:'open',mouth:'o',brow:'neutral',look:[0,-0.5]},talk:talk('s',t)});
  const cat={x:1180,y:FLOOR,s:1,look:[-1,-0.5],tailSpeed:3};let br=0;
  if(!popped){br=lerp(40,330,ease(blow))+(inB('pop',t)?20:0);s.armL=armP(POSE.blow);s.armR=armP(POSE.blow);s.face.puff=Math.sin(t*6)*0.5+0.5;s.face.mouth='o';s.tint=`rgba(220,40,40,${0.45*blow})`;s.face.eyes=blow>0.7?'wide':'open';s.sweat=blow>0.75;cat.look=[-1,-1];cat.tailSpeed=8}
  else{const q=seg(pp,0.12,0.48);s.rot=lerp(0,-1.5,eOut(q));s.x=lerp(800,640,eOut(q));s.y=FLOOR-Math.sin(q*Math.PI)*160;s.noCap=true;s.face.eyes=q<1?'wide':'spiral';s.face.mouth=q<1?'open':'wavy';s.armL=armP(POSE.up);s.armR=armP(POSE.up);s.tint='rgba(60,40,40,0.15)';
    if(after('s3',t)){s.face.eyes=talk('s',t)>0?'half':'spiral';s.face.brow='worried'}
    const cq=seg(pp,0.12,0.5);cat.state=cq<1?'scared':'sit';cat.y=FLOOR-Math.sin(cq*Math.PI)*260;cat.cap=pp>0.5||after('m4',t);cat.look=[-1,0];
    if(after('m4',t)){cat.x=1500;cat.state='sit'}
    if(inB('catwalk',t)){const w=P('catwalk',t);cat.state='walk';cat.x=lerp(1500,-200,w);cat.f=-1;cat.cap=true;s.face.eyes='half';s.rot=-1.5+Math.sin(w*Math.PI)*0.25}}
  const showM=after('m4',t);const m=maryam({x:1200,face:{eyes:'half',mouth:'smirk',brow:'raised',look:[-0.8,0.6]},talk:talk('m',t),armL:armP(POSE.cross),armR:armP(POSE.cross)});
  const hs=headPos(s);
  if(b==='blow')cam({x:900,y:520,z:lerp(1.0,1.35,ease(blow))});else if(b==='pop')cam(wide());else if(b==='m4')cam(cu(1200,headPos(m)[1]+90,1.9));else if(b==='s3')cam({x:700,y:700,z:1.8});else cam(wide());
  return{chars:showM?[s,m]:[s],cats:[cat],before:()=>{},after:()=>{
    if(!popped&&br>0){const bx=hs[0]+0,by=hs[1]+(window.BALLOON_OFF||0)-br*0.95;x.strokeStyle='#888';x.lineWidth=3;ell(bx,by,br*0.88,br);x.fillStyle=rg(bx-br*0.3,by-br*0.4,br*1.3,[[0,'#ff8a9a'],[0.4,'#ff3d5a'],[1,'#b8102e']]);x.fill();x.lineWidth=6;x.strokeStyle=INK;x.stroke();x.fillStyle='rgba(255,255,255,0.5)';ell(bx-br*0.35,by-br*0.45,br*0.15,br*0.25,0.4);x.fill()}
    if(inB('pop',t)){const q=seg(pp,0.12,0.4);if(q>0&&q<1){burst(hs[0]+60,hs[1]-200,260,'بوم!!','#ffd23a',eBack(cl(q*3)));const r=rng(3);for(let i=0;i<14;i++){const a=r()*7,d=q*700;x.save();x.translate(hs[0]+Math.cos(a)*d,hs[1]-200+Math.sin(a)*d+q*q*400);x.rotate(a+q*8);x.fillStyle='#e0263f';x.fillRect(-20,-8,40,16);x.restore()}}
      // flying cap
      const cq=seg(pp,0.12,0.5);if(cq>0&&cq<1){x.save();x.translate(lerp(hs[0],1180+22,cq),lerp(hs[1]-80,FLOOR-150,cq)-Math.sin(cq*Math.PI)*420);x.rotate(cq*12);x.beginPath();x.moveTo(-80,20);x.bezierCurveTo(-84,-70,84,-70,80,20);x.quadraticCurveTo(0,8,-80,20);fs('#fffdf6',6);x.restore()}}
    if(popped&&t<E('catwalk')){const hp=headPos(s);stars(s.x+(s.rot?-260:0),FLOOR-120,t,5)}
    if(inB('blow',t)&&blow>0.6)comic('؟',1240,FLOOR-280,90*eBack(seg(blow,0.6,0.8)),0.2,'#ffd23a')}}
}

function sKitchen(t){const b=beatAt(t).id;kitchenSet(t,{alarm:t>S('smoke',0.4)&&t<E('m5')});
  const s=salem({x:720,apron:true,face:{eyes:'open',mouth:'smile',brow:'neutral'},talk:talk('s',t),armL:armP(POSE.hold,{hold:'bowl'}),armR:armP([0.5,-1.6],{hold:'whisk'})});
  const mIn=after('m5',t);const mEnter=eOut(seg(t,S('m5')-0.5,S('m5')+0.4));
  const m=maryam({x:lerp(2100,1400,mEnter),bob:walkBob(t,mEnter<1&&mIn),face:{eyes:'angry',mouth:'frown',brow:'angry'},talk:talk('m',t)});
  const floured=t>=S('flour',0.2);if(floured)s.mask='flour';
  let ovenO={pot:after('m6',t)};
  if(inB('mix',t)){s.armR.a=[0.5+Math.sin(t*30)*0.25,-1.6+Math.cos(t*30)*0.3];s.face.mouth='grin';s.face.look=[0,1]}
  if(inB('flour',t)){const p=P('flour',t);s.face.eyes=p<0.5?'closed':'open';s.face.mouth=p<0.5?'o':'flat'}
  if(after('s4',t)){s.armR=armP(POSE.thumb,{thumb:true});s.face.mouth='grin';s.face.brow='raised'}
  if(after('smoke',t)){const p=P('smoke',t);s.armL=armP(POSE.down);s.armR=armP(POSE.fan,{hold:'towel'});s.armR.a=[1.6+Math.sin(t*16)*0.5,0.8];s.face.eyes='wide';s.face.mouth='wavy';s.face.brow='worried';s.sweat=true;ovenO.shake=4+p*8;ovenO.glow=0.3+0.5*Math.abs(Math.sin(t*8))}
  if(after('m5',t)){m.armR=armP([0.3,-2.7]);m.armR.a=[0.3+Math.sin(t*14)*0.3,-2.5];m.face.eyes='angry'}
  if(after('reveal',t)){const p=P('reveal',t);ovenO.shake=0;ovenO.open=p<0.4&&t<E('reveal');s.x=lerp(720,1000,eOut(seg(p,0,0.25)));s.armL=armP(POSE.carry);s.armR=armP(POSE.carry,{holdFront:'cake'});s.face.eyes='open';s.face.mouth='wavy';s.sweat=true;if(p>0.5){s.armR=armP([0.9,-2.3],{hold:'cake'});s.armL=armP([0.6,-2.0])}}
  if(after('s5',t)){s.face.mouth='grin';s.face.brow='worried';s.armL=armP(POSE.down);s.armR=armP(POSE.carry,{holdFront:'cake'})}
  if(after('facepalm',t)){m.armR=armP(POSE.palm);m.armL=armP(POSE.down);m.face.eyes='closed';m.face.mouth='frown';m.face.brow='worried';s.face.mouth='flat'}
  if(after('m6',t)){s.x=650;s.armL=armP(POSE.down);s.armR=armP(POSE.down);s.face={eyes:'open',mouth:'smile',brow:'neutral',look:[1,0]};m.x=1380;m.armR=armP([0.45,-1.5],{hold:'spoon'});m.armL=armP(POSE.down);m.face={eyes:'half',mouth:'flat',brow:'neutral',look:[-0.5,0.6]};ovenO.pot=true;ovenO.steam=true}
  if(after('pour',t)){const p=P('pour',t);s.armL=armP([0.4,-1.7]);s.armR=armP([1.2,-0.3],{hold:'sugar',tilt:p>0.2?lerp(0,-2.0,seg(p,0.2,0.35)):0});s.x=lerp(650,1080,eOut(seg(p,0.05,0.25)));s.face={eyes:'happy',mouth:'smile',brow:'happy'};m.face.look=[1,0.8]}
  if(after('taste',t)){const p=P('taste',t);s.armR=armP(POSE.down);s.armL=armP(POSE.down);s.face={eyes:'open',mouth:'smile',brow:'neutral',look:[1,0]};m.armR=armP(p<0.35?POSE.mouth:[0.45,-1.5],{hold:'spoon'});m.face={eyes:p<0.35?'closed':p<0.5?'wide':'spiral',mouth:p<0.35?'chew':p<0.5?'o':'wavy',brow:p<0.5?'neutral':'angry'};if(p>0.45){m.tint=`rgba(${p>0.7?'230,40,40':'80,180,60'},0.45)`;m.headBob=Math.sin(t*50)*5}}
  if(after('m7',t)){m.tint='rgba(230,40,40,0.5)';m.face={eyes:'angry',mouth:'open',brow:'angry'};m.vein=true;m.armL=armP(POSE.fist);m.armR=armP(POSE.fist);m.headBob=Math.sin(t*40)*4;s.face={eyes:'wide',mouth:'o',brow:'worried'};s.sweat=true}
  if(after('s6',t)){s.armL=armP(POSE.shrug);s.armR=armP(POSE.shrug);s.face={eyes:'open',mouth:'smile',brow:'raised',look:[0.3,-1]};m.face={eyes:'angry',mouth:'frown',brow:'angry'}}
  const hs=headPos(s),hm=headPos(m);
  if(b==='s4')cam(cu(hs[0],hs[1]+90,1.9));else if(b==='m5'||b==='m7')cam(cu(hm[0],hm[1]+90,b==='m7'?2.2:1.9));else if(b==='s5'||b==='s6')cam(cu(hs[0],hs[1]+90,1.9));else if(b==='facepalm')cam({x:(hs[0]+hm[0])/2,y:560,z:1.3});
  else if(b==='m6')cam({x:1000,y:540,z:1.15});else if(b==='pour'&&P('pour',t)<0.3)cam(cu(1100,520,2.6));else if(b==='taste')cam(cu(hm[0],hm[1]+80,1.9));else cam(wide());
  return{chars:mIn?[s,m]:[s],before:()=>{counter(t,{noSugar:after('pour',t)});oven(t,ovenO)},after:()=>{
    if(inB('flour',t)){const p=P('flour',t);x.fillStyle=`rgba(255,255,255,${0.95*(1-p)})`;for(let i=0;i<14;i++){circ(hs[0]+Math.cos(i)*(80+p*200),hs[1]+120+Math.sin(i*1.7)*(80+p*160),60+p*60);x.fill()}if(p<0.5)comic('بُف!',hs[0]+220,hs[1]-60,80,0.2)}
    if(after('smoke',t)&&t<E('reveal')){const k=t<E('m5')?seg(t,S('smoke'),S('smoke')+1.5):1-P('reveal',t);smoke(1380,640,t,22,k,'90,90,100')}
    if(after('reveal',t)&&t<E('facepalm')){const hp=headPos(s);smoke(s.x+90,hp[1]+260,t,6,0.5,'60,60,60');const p=P('reveal',t);if(inB('reveal',t)&&p>0.6)comic('طق طق',s.x+260,hp[1]+80,70,-0.15,'#ffd23a')}
    if(inB('facepalm',t))comic('…',hm[0]+150,hm[1]-80,90);
    if(inB('pour',t)){const p=P('pour',t);if(p>0.35){x.fillStyle='#fff';x.strokeStyle='#ddd';x.lineWidth=3;const sx0=s.x+150,sy0=FLOOR-430;x.beginPath();x.moveTo(sx0,sy0);x.quadraticCurveTo(sx0+60,sy0+30,1380,480);x.lineTo(1395,480);x.quadraticCurveTo(sx0+70,sy0+20,sx0+16,sy0-4);x.fill();const r=rng(Math.floor(t*20));for(let i=0;i<20;i++){circ(1380+(r()-0.5)*60,470-r()*30,3);x.fill()}}
      if(p<0.3){comic('سكر',1100,300,90*eBack(seg(p,0.05,0.15)),0,'#e0464f')}}
    if(inB('taste',t)&&P('taste',t)>0.5){steam(hm[0]-90,hm[1]-10,t,-1);steam(hm[0]+90,hm[1]-10,t,1)}
    if(inB('m7',t)){steam(hm[0]-90,hm[1]-10,t,-1);steam(hm[0]+90,hm[1]-10,t,1)}}}
}

function sChaos(t){const b=beatAt(t).id;livingSet(t,{sofa:false});
  const cp=P('cat',t),kp=P('crash',t),crashed=t>=S('crash',0.1);
  const enter=eOut(seg(cp,0.25,0.7));
  const s=salem({x:lerp(-200,520,enter),bob:walkBob(t,cp>0.25&&cp<0.7),face:{eyes:'open',mouth:'smile',brow:'neutral',look:[1,0]},armL:armP(POSE.carry),armR:armP(POSE.carry,{holdFront:'plates'}),talk:talk('s',t)});
  const m=maryam({x:lerp(-400,1500,enter),bob:walkBob(t,cp>0.25&&cp<0.7),face:{eyes:'open',mouth:'smile',brow:'neutral',look:[-1,0]},talk:talk('m',t)});
  if(t<S('crash'))m.x=lerp(2300,1500,enter);
  if(cp>0.8||after('crash',t)){s.face={eyes:'wide',mouth:'open',brow:'raised'};m.face={eyes:'wide',mouth:'open',brow:'raised'}}
  const cat={x:960,y:FLOOR,s:1,look:[1,-1],tailSpeed:6};
  if(t<S('crash')){if(cp<0.5){cat.x=1100;cat.state='sit';cat.look=[1,-1];cat.tailSpeed=10}else{const q=seg(cp,0.5,0.8);cat.state='pounce';cat.x=lerp(1100,1280,q);cat.y=FLOOR-Math.sin(q*Math.PI)*200}}
  if(crashed){const q=seg(kp,0.1,0.5);cat.state=q<1?'fly':'sit';cat.x=lerp(1280,900,q);cat.y=lerp(FLOOR-80,690,q)-Math.sin(q*Math.PI)*200;cat.f=-1;cat.look=[0,0];
    const f=seg(kp,0.2,0.6);s.rot=lerp(0,-1.45,eOut(f));s.x=520;s.armL=armP(POSE.up);s.armR=armP(POSE.up);s.potHat=kp>0.6;s.y=FLOOR-Math.sin(f*Math.PI)*120;
    m.mask=kp>0.5?'rice':null;m.armL=armP(POSE.up);m.armR=armP(POSE.up)}
  if(after('silence',t)){s.rot=-1.45;s.potHat=true;s.face={eyes:'half',mouth:'flat',brow:'neutral'};m.face={eyes:'half',mouth:'flat',brow:'neutral'};m.mask='rice';m.armL=armP(POSE.down);m.armR=armP(POSE.down);cat.state='sit';cat.eyes='happy';cat.x=900;cat.y=690}
  if(after('m8',t)){m.tint='rgba(230,40,40,0.5)';m.face={eyes:'angry',mouth:'open',brow:'angry'};m.vein=true;m.armL=armP(POSE.fist);m.armR=armP(POSE.fist);m.headBob=Math.sin(t*40)*5;m.squash=Math.sin(t*20)*0.1}
  const hm=headPos(m);
  if(b==='m8')cam(cu(hm[0],hm[1]+90,1.9));else if(b==='silence')cam({x:960,y:600,z:1.1});else cam(wide());
  return{chars:[s,m],cats:[],before:()=>{diningTable(t,!crashed);if(!crashed)tableItems(t)},after:()=>{
    drawCat(cat,t);
    if(t<S('crash')&&cp>0.8){marks(s.x,FLOOR-560,'!',seg(cp,0.8,0.9));marks(m.x,FLOOR-540,'!',seg(cp,0.82,0.92))}
    if(crashed&&t<E('silence')+10){const q=seg(t,S('crash',0.1),S('crash',0.7));const r=rng(5);
      // flying items
      const items=[['pot',940,640,500,300],['plate',720,686,200,880],['plate',1160,686,1400,880],['cake',1110,660,1600,870],['bal',620,380,300,-200],['bal',1300,380,1700,-200]];
      for(const[k,x0,y0,x1,y1]of items){if(k==='pot'&&kp>0.6)continue;const px=lerp(x0,x1,q),py=lerp(y0,y1,q)-Math.sin(q*Math.PI)*300;x.save();x.translate(px,py);x.rotate(q*8);
        if(k==='pot'){rr(-80,-45,160,90,16);fs('#9aa3ad',6)}else if(k==='plate'){if(q<1){ell(0,0,56,12);fs('#fff',5)}else{for(let i=0;i<4;i++){x.save();x.translate(i*30-45,0);x.rotate(i);x.beginPath();x.moveTo(0,0);x.lineTo(24,4);x.lineTo(8,10);fs('#fff',3);x.restore()}}}else if(k==='cake'){rr(-50,-24,100,48,14);fs('#1d1716',6)}else{ell(0,0,46,56);fs('#e0464f',5)}x.restore()}
      // tablecloth
      if(q<1){x.save();x.translate(lerp(960,1350,q),lerp(740,FLOOR-60,q));x.rotate(q*2);rr(-300*(1-q)-60,-40,600*(1-q)+120,80,20);fs('#fff',6);x.restore()}else{x.save();x.translate(1350,FLOOR-30);rr(-120,-30,240,60,26);fs('#fff',6);x.restore()}
      // rice
      x.fillStyle='#fffaf0';for(let i=0;i<120;i++){const a=r()*Math.PI-Math.PI,sp=200+r()*600;const px=940+Math.cos(a)*sp*q,py=640+Math.sin(a)*sp*q*0.6+q*q*500;ell(px,Math.min(FLOOR+60*r(),py),5,2.5,r()*3);x.fill()}
      if(inB('crash',t)&&kp<0.5)burst(960,420,250,'كراش!!','#ff7a3a',eBack(seg(kp,0.1,0.25)))}
    if(inB('silence',t)){const p=P('silence',t);x.fillStyle='#fffaf0';ell(m.x+30,lerp(FLOOR-560,FLOOR-430,seg(p,0.3,0.7)),5,2.5);x.fill();comic('…',960,300,120)}
    if(inB('m8',t)){steam(hm[0]-90,hm[1]-10,t,-1);steam(hm[0]+90,hm[1]-10,t,1)}}}
}

function sPhone(t){const b=beatAt(t).id;livingSet(t,{sofa:false});
  const s=salem({x:820,potHat:true,face:{eyes:'open',mouth:'smile',brow:'neutral',look:[0.5,0]},talk:talk('s',t),armL:armP(POSE.down),armR:armP(POSE.ear,{hold:'phone'})});
  const m=maryam({x:1350,mask:'rice',face:{eyes:'half',mouth:'flat',brow:'neutral',look:[-1,0]},armL:armP(POSE.cross),armR:armP(POSE.cross)});
  if(inB('dial',t)){const p=P('dial',t);s.armR=armP(p<0.6?[0.6,-1.6]:POSE.ear,{hold:'phone'});s.face.look=[0.3,1]}
  if(inB('s7',t)){s.face={eyes:'happy',mouth:'grin',brow:'raised'};s.face.blush=true}
  if(inB('s8',t)){const p=P('s8',t);s.face={eyes:p>0.6?'wide':'open',mouth:'grin',brow:'worried'};s.sweat=true;s.armL=armP([0.8+Math.sin(t*6)*0.4,1.0])}
  if(after('hangup',t)){s.armR=armP(POSE.down,{hold:'phone'});s.face={eyes:'half',mouth:'flat',brow:'worried'}}
  const hs=headPos(s);
  if(b==='s7')cam(cu(hs[0],hs[1]+90,1.8));else if(b==='s8')cam(cu(hs[0],hs[1]+90,lerp(1.8,2.4,P('s8',t))));else cam({x:1050,y:560,z:1.15});
  return{chars:[s,m],before:()=>{diningTable(t,false);drawCat({x:960,y:690,eyes:'happy'},t)}}}

function sEnd(t){const b=beatAt(t).id;livingSet(t);
  const s=salem({x:760,face:{eyes:'open',mouth:'flat',brow:'neutral',look:[1,0]},talk:talk('s',t)});const m=maryam({x:1180,face:{eyes:'open',mouth:'flat',brow:'neutral',look:[-1,0]},talk:talk('m',t)});
  const cat={x:960,y:FLOOR,eyes:'open',look:[0,-1]};
  const laughing=t>=S('laughS')&&t<S('m9')+0.2;
  if(inB('look',t)){const p=P('look',t);s.face.look=[lerp(0,1,seg(p,0.2,0.4)),0];m.face.look=[lerp(0,-1,seg(p,0.4,0.6)),0];if(p>0.75){s.face.mouth='smirk';m.face.mouth='smirk'}}
  if(laughing){s.face={eyes:'happy',mouth:'laugh',brow:'happy'};m.face={eyes:'happy',mouth:'laugh',brow:'happy'};s.headBob=Math.sin(t*20)*8;m.headBob=Math.sin(t*20+1)*8;s.armL=armP(POSE.laugh);s.armR=armP(POSE.laugh);m.armL=armP(POSE.laugh);m.armR=armP(POSE.laugh);s.squash=Math.sin(t*20)*0.08;m.squash=Math.sin(t*20+1)*0.08}
  if(after('m9',t)&&!laughing){m.face={eyes:'happy',mouth:'smile',brow:'raised'};m.armR=armP(POSE.point);s.face={eyes:'open',mouth:'smile',brow:'worried',blush:true}}
  if(after('s9',t)){s.face={eyes:'open',mouth:'grin',brow:'raised'};s.armR=armP(POSE.up,{hold:'phone'});m.face={eyes:'open',mouth:'smile',brow:'raised'}}
  if(after('meow',t)){cat.meow=inB('meow',t)?Math.abs(Math.sin(P('meow',t)*Math.PI)):0;cat.eyes='open';cat.look=[0,-0.5]}
  if(after('m10',t)){m.face={eyes:'happy',mouth:'laugh',brow:'happy'};m.armR=armP([1.2,0.3]);s.face={eyes:'happy',mouth:'grin',brow:'happy'};cat.eyes='happy'}
  const hs=headPos(s),hm=headPos(m);
  if(b==='m9')cam(cu(hm[0],hm[1]+90,1.9));else if(b==='s9')cam(cu(hs[0],hs[1]+90,1.9));else if(b==='meow')cam(cu(990,FLOOR-110,2.4));else if(b==='look')cam({x:970,y:540,z:1.4});else cam({x:970,y:560,z:1.2});
  return{chars:[s,m],cats:[cat],after:()=>{if(laughing){comic('ها ها',hs[0]-200,hs[1]-120,70,-0.2,'#ffd23a');comic('هههه',hm[0]+200,hm[1]-120,70,0.2,'#ff8fb1')}if(inB('meow',t))comic('مياو!',1180,FLOOR-260,80*eBack(P('meow',t)*3),0.15,'#ffd23a')}}}

function sEndcard(t){const p=P('endcard',t);x.fillStyle=rg(W/2,H/2,1100,[[0,'#4a3a8a'],[1,'#1a1238']]);x.fillRect(0,0,W,H);confetti(t,60,0.8);
  const s=salem({x:620,y:1000,s:0.95,face:{eyes:'happy',mouth:'grin',brow:'happy'},armL:armP(POSE.wave)});s.armL.a=[2.4+Math.sin(t*8)*0.3,0.5];
  const m=maryam({x:1300,y:1000,s:0.92,face:{eyes:'happy',mouth:'smile',brow:'happy'},armR:armP(POSE.wave)});m.armR.a=[2.4+Math.sin(t*8+1)*0.3,0.5];
  drawPerson(s,t);drawPerson(m,t);
  // pizza box + cat
  rr(860,860,200,40,6);fs('#d9a066',6);x.fillStyle='#c0392b';x.font='26px Kufi';x.textAlign='center';x.fillText('بيتزا',960,890);drawCat({x:960,y:860,eyes:'happy',s:0.9},t);
  const tp=eBack(seg(p,0.05,0.25));x.save();x.translate(W/2,250);x.scale(tp,tp);comic('النهاية',0,0,170,0,'#ffd23a');x.restore();
  const sp=eOut(seg(p,0.25,0.45));x.globalAlpha=sp;comic('انتظرونا في الحلقة القادمة من «سالم ومريم»',W/2,420,56,0,'#fff');x.globalAlpha=1}

const SCENES={title:sTitle,living:sLiving,balloon:sBalloon,kitchen:sKitchen,chaos:sChaos,phone:sPhone,end:sEnd,endcard:sEndcard};

// ---------- subtitles ----------
const NAME={s:'سالم',m:'مريم'},NCOL={s:'#7fd1ff',m:'#ff9cc0'};
function subtitles(t){for(const e of TL){if(e.kind!=='say'||t<e.start-0.05||t>e.start+e.dur+0.35)continue;const a=cl((t-e.start+0.05)/0.12)*cl((e.start+e.dur+0.35-t)/0.15);
  x.save();x.globalAlpha=a;x.font='46px Cairo';x.direction='rtl';x.textBaseline='middle';const lbl=NAME[e.spk]+': ';
  const words=e.text.split(' ');const lines=[];let cur='';for(const w of words){const tr=cur?cur+' '+w:w;if(x.measureText((lines.length?'':lbl)+tr).width>1380&&cur){lines.push(cur);cur=w}else cur=tr}lines.push(cur);
  const other=TL.some(o=>o.kind==='say'&&o.spk!==e.spk&&t>=o.start&&t<=o.start+o.dur&&o.start<e.start);const y0=(other?905:1010)-(lines.length-1)*62;
  lines.forEach((ln,i)=>{const full=(i?'':lbl)+ln;const w=x.measureText(full).width;const y=y0+i*62;rr(W/2-w/2-30,y-32,w+60,64,32);x.fillStyle='rgba(20,14,32,0.74)';x.fill();
    x.textAlign='right';const right=W/2+w/2;let off=0;if(!i){x.fillStyle=NCOL[e.spk];x.fillText(lbl,right,y);off=x.measureText(lbl).width}x.fillStyle='#fff';x.fillText(ln,right-off,y)});x.restore()}}

// ---------- render ----------
function render(t){T=t;x.setTransform(1,0,0,1,0,0);x.globalAlpha=1;x.globalCompositeOperation='source-over';x.clearRect(0,0,W,H);
  const b=beatAt(t);const sc=SCENES[b.scene];
  if(b.scene==='title'||b.scene==='endcard'){sc(t)}
  else{const res=sc(t);x.save();const shake=(b.id==='crash'&&P('crash',t)<0.5)?14:(b.id==='pop'&&P('pop',t)>0.1&&P('pop',t)<0.35)?12:0;applyCam(shake);
    // redraw set inside camera: scene functions drew the set in screen space, so draw again under camera
    x.restore();x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,W,H);x.save();applyCam(shake);sc(t);if(res.before)res.before();for(const c of res.chars)drawPerson(c,t);for(const c of(res.cats||[]))drawCat(c,t);if(res.after)res.after();x.restore()}
  // scene transition: quick iris wipe at scene changes
  for(let i=1;i<TL.length;i++){if(TL[i].scene!==TL[i-1].scene){const d=t-TL[i].start;if(d>=-0.25&&d<0.25){const k=1-Math.abs(d)/0.25;x.save();x.fillStyle='#1a1238';x.beginPath();x.rect(0,0,W,H);x.arc(W/2,H/2,Math.max(0,1200*(1-k)),0,7,true);x.fill('evenodd');x.restore()}}}
  subtitles(t);
  // letterbox + vignette
  x.fillStyle=rg(W/2,H/2,1250,[[0.6,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,0.35)']]);x.fillRect(0,0,W,H);
  const fi=1-seg(t,0,0.4),fo=seg(t,TOTAL-0.8,TOTAL);if(fi>0||fo>0){x.fillStyle=`rgba(0,0,0,${Math.max(fi,fo)})`;x.fillRect(0,0,W,H)}}
window.render=render;
window.ready=Promise.all([document.fonts.load('80px Kufi'),document.fonts.load('46px Cairo')]).then(()=>{render(0);return true});
