// Epic anime-drama restyle of «سالم ومريم» (loaded after episode.js; overrides its drawing layer).
// Realistic proportions, heavy ink + hatching, muted grade, speed-line shock frames, extreme eye close-ups.
const AINK='#15110f';
function headPos(c){const s=c.s||1;return[c.x,c.y+(-578+(c.sit?110:0))*s]}
function cam(c){const z=c.z>1.45?c.z*1.42:c.z;CAM={x:c.x,y:c.z>1.45?c.y-34:c.y,z}}

// ---------- hatching helpers ----------
function hatch(x0,y0,x1,y1,n,len,ang=-0.9,lw=1.6,col='rgba(20,15,12,0.55)'){x.save();x.strokeStyle=col;x.lineWidth=lw;x.lineCap='round';for(let i=0;i<n;i++){const u=i/(n-1||1);const px=lerp(x0,x1,u),py=lerp(y0,y1,u);x.beginPath();x.moveTo(px,py);x.lineTo(px+Math.cos(ang)*len,py+Math.sin(ang)*len);x.stroke()}x.restore()}
function inkLine(pts,w0,w1,col=AINK){for(let i=0;i<pts.length-1;i++){x.strokeStyle=col;x.lineCap='round';x.lineWidth=lerp(w0,w1,i/(pts.length-1));x.beginPath();x.moveTo(...pts[i]);x.lineTo(...pts[i+1]);x.stroke()}}

// ---------- face ----------
const SKIN={s:['#c99572','#a8724f'],m:['#dcae8c','#b98563']};
function facePath(){x.beginPath();x.moveTo(-47,-28);x.quadraticCurveTo(-49,8,-38,30);x.quadraticCurveTo(-24,52,0,60);x.quadraticCurveTo(24,52,38,30);x.quadraticCurveTo(49,8,47,-28);x.bezierCurveTo(44,-86,-44,-86,-47,-28);x.closePath()}
function faceA(c,t){const hero=c.who==='s';const f=c.face||{};const sk=SKIN[c.who];const lk=f.look||[0,0];const a=c.talk||0;
  if(!hero){// shaila behind/around
    x.beginPath();x.moveTo(-60,-30);x.bezierCurveTo(-66,-108,66,-108,60,-30);x.quadraticCurveTo(70,40,78,96);x.lineTo(-78,96);x.quadraticCurveTo(-70,40,-60,-30);x.closePath();fs('#9e4a62',3.5,AINK);
    x.strokeStyle='rgba(30,10,20,0.5)';x.lineWidth=2;for(const d of[-1,1]){x.beginPath();x.moveTo(d*56,-20);x.quadraticCurveTo(d*64,40,d*70,92);x.stroke();x.beginPath();x.moveTo(d*48,10);x.quadraticCurveTo(d*56,60,d*58,94);x.stroke()}}
  else{for(const d of[-1,1]){ell(d*47,2,8,13);fs(sk[0],3,AINK)}}
  // neck
  x.fillStyle=sk[1];x.fillRect(-17,40,34,46);x.strokeStyle=AINK;x.lineWidth=3;x.beginPath();x.moveTo(-17,44);x.lineTo(-17,86);x.moveTo(17,44);x.lineTo(17,86);x.stroke();
  facePath();x.fillStyle=sk[0];x.fill();
  x.save();facePath();x.clip();
  // cel shadow (light from upper-left)
  x.fillStyle=sk[1];x.beginPath();x.moveTo(12,-90);x.quadraticCurveTo(30,0,6,70);x.lineTo(70,70);x.lineTo(70,-90);x.fill();
  hatch(24,8,40,-4,6,16,2.2,1.4,'rgba(60,30,20,0.45)');
  if(c.tint){x.fillStyle=c.tint;x.fillRect(-60,-90,120,160)}
  if(c.mask==='flour'){x.fillStyle='rgba(245,245,240,0.9)';const r=rng(4);for(let i=0;i<8;i++){circ((r()-0.5)*90,(r()-0.6)*110,22+r()*14);x.fill()}}
  if(c.mask==='rice'){x.fillStyle='#f4efe2';const r=rng(9);for(let i=0;i<24;i++){ell((r()-0.5)*100,(r()-0.7)*110,3,1.6,r()*3);x.fill()}}
  if(hero){x.fillStyle='rgba(40,28,22,0.35)';x.beginPath();x.moveTo(-44,8);x.quadraticCurveTo(-36,46,0,58);x.quadraticCurveTo(36,46,44,8);x.quadraticCurveTo(30,40,0,44);x.quadraticCurveTo(-30,40,-44,8);x.fill();const r=rng(2);x.fillStyle='rgba(30,20,15,0.6)';for(let i=0;i<70;i++){const a2=r()*Math.PI,rr2=40+r()*12;circ(Math.cos(a2)*rr2*0.85,8+Math.sin(a2)*rr2,0.9);x.fill()}}
  // shock gloom lines
  if(f.eyes==='wide'||c.shock){x.strokeStyle='rgba(30,40,80,0.6)';x.lineWidth=2;for(let i=-44;i<=44;i+=5){x.beginPath();x.moveTo(i,-80);x.lineTo(i,-30+Math.abs(i)*0.2);x.stroke()}x.fillStyle='rgba(40,50,110,0.25)';x.fillRect(-60,-90,120,62)}
  x.restore();
  facePath();x.lineWidth=3.2;x.strokeStyle=AINK;x.stroke();inkLine([[-38,30],[-24,50],[0,60],[24,50],[38,30]],5,3);
  // eyes
  const blink=f.noBlink?0:((t*0.33+((c.x||0)%7)*0.13)%1<0.03?1:0);const eyes=blink&&!['closed','happy','spiral'].includes(f.eyes)?'closed':(f.eyes||'open');
  const tr=eyes==='wide'?[Math.sin(t*70)*1.2,Math.cos(t*60)*1]:[0,0];
  for(const d of[-1,1]){const cx=d*21,cy=-8;let st=eyes;if(eyes==='wink')st=d===1?'happy':'open';
    x.save();x.translate(cx,cy);x.scale(d,1);// draw left-eye geometry mirrored
    if(st==='closed'){inkLine([[-12,1],[0,4],[13,1]],3,4.5)}
    else if(st==='happy'){inkLine([[-12,4],[0,-3],[13,4]],3.5,5)}
    else if(st==='spiral'){x.scale(d,1);x.strokeStyle=AINK;x.lineWidth=1.8;x.beginPath();for(let k=0;k<12;k+=0.3){const r=k*0.9;x.lineTo(Math.cos(k+t*9*d)*r,Math.sin(k+t*9*d)*r)}x.stroke()}
    else{const wide=st==='wide',half=st==='half',ang=st==='angry';
      const top=wide?-12:half?-2:ang?-4:-8,bot=wide?9:6;
      x.beginPath();x.moveTo(-13,0);x.quadraticCurveTo(-2,top-3,14,top+2);x.quadraticCurveTo(10,bot+2,-13,0);x.closePath();x.fillStyle='#f3efe6';x.fill();
      x.save();x.clip();const ir=wide?5.5:8;const ix=1+lk[0]*4*d+tr[0],iy=1+lk[1]*3+tr[1];circ(ix,iy,ir);x.fillStyle=hero?'#4a3020':'#7a5a2a';x.fill();x.lineWidth=1.5;x.strokeStyle=AINK;x.stroke();circ(ix,iy,wide?1.8:3.6);x.fillStyle='#0a0806';x.fill();
      if(!wide){circ(ix-2.5,iy-3,1.6);x.fillStyle='#fff';x.fill()}
      x.fillStyle='rgba(0,0,0,0.25)';x.fillRect(-14,top-6,30,5);x.restore();
      // upper lid: heavy ink with outer flick
      inkLine([[-14,1],[-6,top-1],[4,top-1],[14,top+2],[18,top-1]],3,5.5);if(ang)inkLine([[-14,-6],[14,top-4]],4,5);
      x.strokeStyle=AINK;x.lineWidth=1.4;x.beginPath();x.moveTo(-10,bot-1);x.quadraticCurveTo(2,bot+3,12,bot-1);x.stroke();
      // under-eye lines
      x.lineWidth=1.3;x.strokeStyle='rgba(20,15,12,0.7)';x.beginPath();x.moveTo(-6,bot+6);x.quadraticCurveTo(3,bot+9,10,bot+5);x.stroke();
      if(!hero){x.lineWidth=2;x.beginPath();x.moveTo(14,top+2);x.lineTo(20,top-4);x.moveTo(12,top);x.lineTo(16,top-7);x.stroke()}}
    x.restore()}
  // brows
  const br=f.brow||'neutral';for(const d of[-1,1]){let y0=-27,inner=0,outer=0;if(br==='raised')y0-=8;if(br==='angry'){inner=9;outer=-5}if(br==='worried'){inner=-8;outer=4}if(br==='happy')y0-=4;
    x.save();x.scale(d,1);x.beginPath();x.moveTo(6,y0+inner);x.lineTo(34,y0+outer-2);x.lineTo(34,y0+outer+(hero?4:2));x.lineTo(6,y0+inner+(hero?7:4));x.closePath();x.fillStyle=hero?'#1d1410':'#2d1e16';x.fill();x.restore()}
  if(br==='angry'){x.strokeStyle=AINK;x.lineWidth=1.6;x.beginPath();x.moveTo(-4,-26);x.lineTo(-2,-16);x.moveTo(3,-26);x.lineTo(2,-17);x.stroke()}
  // nose
  inkLine([[-1,-4],[2,10],[5,18]],2,2.6);x.strokeStyle=AINK;x.lineWidth=2;x.beginPath();x.moveTo(-5,20);x.quadraticCurveTo(0,23,6,19);x.stroke();
  if(f.blush||c.blush){hatch(-36,16,-22,16,5,8,-1.1,1.6,'rgba(200,60,60,0.7)');hatch(22,16,36,16,5,8,-1.1,1.6,'rgba(200,60,60,0.7)')}
  if(f.puff){x.fillStyle=sk[0];for(const d of[-1,1]){circ(d*34,26,14+f.puff*4);fs(sk[0],2.5,AINK)}}
  // mustache
  if(hero){x.fillStyle='#1d1410';x.beginPath();x.moveTo(-20,28);x.quadraticCurveTo(-8,22,0,25);x.quadraticCurveTo(8,22,20,28);x.quadraticCurveTo(8,31,0,29);x.quadraticCurveTo(-8,31,-20,28);x.fill()}
  // mouth
  const my=35,m=f.mouth||'flat';
  if(a>0.04||m==='laugh'||m==='open'||m==='grin'){const w=m==='grin'||m==='laugh'?19:12+a*4,h=m==='laugh'?14+Math.abs(Math.sin(t*16))*4:m==='open'?16:m==='grin'?8:2+a*13;
    x.beginPath();x.moveTo(-w,my);x.quadraticCurveTo(0,my-3,w,my);x.quadraticCurveTo(w*0.7,my+h,0,my+h);x.quadraticCurveTo(-w*0.7,my+h,-w,my);x.closePath();x.fillStyle='#3a1414';x.fill();
    x.save();x.clip();x.fillStyle='#eee8dc';x.fillRect(-w,my-3,2*w,Math.min(5,h*0.4));x.fillStyle='#8a3a3a';ell(0,my+h,w*0.5,h*0.35);x.fill();x.restore();x.lineWidth=2.4;x.strokeStyle=AINK;x.stroke();
    x.lineWidth=1.4;x.beginPath();x.moveTo(-6,my+h+5);x.lineTo(6,my+h+5);x.stroke();return}
  x.strokeStyle=AINK;x.lineCap='round';
  if(m==='smile'){inkLine([[-12,my],[0,my+3],[12,my-1]],2.2,3)}
  else if(m==='frown'){inkLine([[-12,my+3],[0,my],[12,my+3]],2.6,3)}
  else if(m==='o'){ell(0,my+3,5,6);x.fillStyle='#3a1414';x.fill();x.lineWidth=2;x.stroke()}
  else if(m==='wavy'){x.lineWidth=2.2;x.beginPath();x.moveTo(-14,my);for(let i=-14;i<=14;i+=3.5)x.lineTo(i,my+((i/3.5)%2?2.5:-2.5));x.stroke()}
  else if(m==='smirk'){inkLine([[-10,my+2],[4,my+2],[13,my-3]],2.2,3)}
  else if(m==='chew'){const k=Math.abs(Math.sin(t*12));ell(0,my+1,7,1+k*3);x.fillStyle='#3a1414';x.fill()}
  else{inkLine([[-11,my],[0,my+1],[11,my]],2.4,2.4)}
  x.lineWidth=1.3;x.beginPath();x.moveTo(-5,my+8);x.lineTo(5,my+8);x.stroke()}

function kummaA(t){x.beginPath();x.moveTo(-50,-30);x.bezierCurveTo(-54,-104,54,-104,50,-30);x.quadraticCurveTo(0,-40,-50,-30);x.closePath();fs('#ece6d6',3.2,AINK);
  x.save();x.clip();x.fillStyle='rgba(90,80,70,0.35)';x.fillRect(10,-110,60,90);const cols=['#8a3a32','#34557a','#3e6b48','#9a7a30'];for(let r=0;r<3;r++)for(let i=-8;i<=8;i++){x.fillStyle=cols[(i+r+12)%4];circ(i*6.5+(r%2)*3,-40-r*9,1.9);x.fill()}
  x.strokeStyle='#34557a';x.lineWidth=1.6;x.beginPath();for(let i=-8;i<=8;i++)x.lineTo(i*6.5,-70+(i%2?5:0));x.stroke();x.restore()}

// ---------- body ----------
function drawPerson(c,t){const s=c.s||1,hero=c.who==='s';x.save();x.translate(c.x,c.y);if(c.rot){x.translate(0,-200*s);x.rotate(c.rot);x.translate(0,200*s)}
  const sq=c.squash||0;x.scale(s*(1+sq*0.1),s*(1-sq*0.1));const drop=c.sit?110:0;x.translate(0,drop);
  const bob=c.bob||0,top=-500+(c.sit?110:0)-bob,len=c.sit?390:500;const robe=hero?['#e9e4d8','#b9b2a2']:['#3e2f55','#251b36'];
  for(const d of[-1,1]){ell(d*24,-4,20,8);fs(hero?'#4a3020':'#1d1626',2.5,AINK)}
  // robe
  x.beginPath();x.moveTo(-50,top+18);x.quadraticCurveTo(0,top-4,50,top+18);x.lineTo(c.sit?92:66,-8);x.quadraticCurveTo(0,4,c.sit?-92:-66,-8);x.closePath();x.fillStyle=robe[0];x.fill();
  x.save();x.clip();x.fillStyle=robe[1];x.beginPath();x.moveTo(12,top);x.quadraticCurveTo(30,top+200,22,10);x.lineTo(120,10);x.lineTo(120,top);x.fill();
  hatch(30,top+40,40,-40,18,22,2.3,1.3,'rgba(20,15,12,0.35)');
  x.strokeStyle='rgba(20,15,12,0.55)';x.lineWidth=2;for(const[x0,x1]of[[-22,-38],[-6,-12],[18,28],[38,52]]){x.beginPath();x.moveTo(x0,top+70);x.quadraticCurveTo(x0+(x1-x0)*0.3,top+260,x1,-12);x.stroke()}
  if(c.apron){x.fillStyle='#8a4a3e';x.beginPath();x.moveTo(-40,top+50);x.lineTo(40,top+50);x.lineTo(56,-40);x.lineTo(-56,-40);x.closePath();x.fill();x.strokeStyle='rgba(240,230,210,0.6)';x.lineWidth=4;for(let i=0;i<4;i++){x.beginPath();x.moveTo(-30+i*20,top+56);x.lineTo(-42+i*28,-44);x.stroke()}}
  x.restore();x.beginPath();x.moveTo(-50,top+18);x.quadraticCurveTo(0,top-4,50,top+18);x.lineTo(c.sit?92:66,-8);x.quadraticCurveTo(0,4,c.sit?-92:-66,-8);x.closePath();x.lineWidth=3.5;x.strokeStyle=AINK;x.stroke();
  if(hero){x.strokeStyle='#8a6a3a';x.lineWidth=2.4;x.beginPath();x.moveTo(0,top+8);x.lineTo(Math.sin(t*3)*2,top+70);x.stroke();ell(Math.sin(t*3)*2,top+76,4,6);fs('#8a6a3a',1.5,AINK)}
  else{x.strokeStyle='#a88a4a';x.lineWidth=2.5;x.beginPath();x.moveTo(0,top+30);x.lineTo(0,-10);x.stroke()}
  // head
  x.save();x.translate(c.headX||0,top-78+(c.headBob||0));if(c.headTilt)x.rotate(c.headTilt);
  faceA(c,t);
  if(hero){if(!c.noCap)kummaA(t);else{x.fillStyle='#1d1410';x.beginPath();x.moveTo(-47,-28);x.bezierCurveTo(-44,-88,44,-88,47,-28);x.quadraticCurveTo(20,-52,-47,-28);x.fill()}
    if(c.potHat){x.save();x.translate(0,-64);x.rotate(Math.sin(t*2)*0.05);rr(-56,-44,112,58,10);fs('#7f868c',3,AINK);x.fillStyle='rgba(255,255,255,0.3)';x.fillRect(-40,-38,10,44);rr(-66,10,132,10,5);fs('#666d73',2.5,AINK);x.restore()}}
  if(c.sweat){for(const k of[0,1]){const sy=-30+((t*50+k*20)%34);x.save();x.translate(46-k*96,sy);x.beginPath();x.moveTo(0,-9);x.quadraticCurveTo(6,2,0,5);x.quadraticCurveTo(-6,2,0,-9);fs('rgba(200,230,255,0.9)',1.5,AINK);x.restore()}}
  if(c.vein){x.save();x.translate(-34,-52);x.strokeStyle='#a01818';x.lineWidth=3;for(const a of[0,1,2,3]){x.save();x.rotate(a*Math.PI/2+0.3);x.beginPath();x.moveTo(3,3);x.quadraticCurveTo(8,2,9,9);x.stroke();x.restore()}x.restore()}
  x.restore();
  // arms
  const skin=SKIN[c.who][0];
  for(const side of[-1,1]){const A=side<0?c.armL:c.armR;if(!A)continue;const sh=[side*48,top+26];const a1=A.a[0],a2=A.a[1];
    const el=[sh[0]+Math.sin(a1)*side*98,sh[1]+Math.cos(a1)*98],ha=[el[0]+Math.sin(a1+a2)*side*88,el[1]+Math.cos(a1+a2)*88];
    x.lineCap='round';x.lineJoin='round';x.strokeStyle=AINK;x.lineWidth=40;x.beginPath();x.moveTo(...sh);x.lineTo(...el);x.lineTo(...ha);x.stroke();x.strokeStyle=robe[0];x.lineWidth=33;x.stroke();
    x.strokeStyle=robe[1];x.lineWidth=8;x.beginPath();x.moveTo(sh[0]+side*6,sh[1]+4);x.lineTo(el[0]+side*6,el[1]);x.stroke();
    x.save();x.translate(ha[0],ha[1]);x.scale(0.78,0.78);if(A.hold)prop(A.hold,[0,0],side,t,A);x.restore();
    circ(ha[0],ha[1],14);fs(skin,2.5,AINK);x.strokeStyle=AINK;x.lineWidth=1.5;x.beginPath();x.moveTo(ha[0]-5,ha[1]+2);x.lineTo(ha[0]+5,ha[1]+3);x.stroke();
    if(A.thumb){rr(ha[0]-5,ha[1]-28,10,20,5);fs(skin,2.5,AINK)}
    if(A.holdFront){x.save();x.translate(ha[0],ha[1]);x.scale(0.78,0.78);prop(A.holdFront,[0,0],side,t,A);x.restore()}}
  x.restore()}

// ---------- dramatic inserts ----------
const DRAMA={s1:['#3b0d0d','#0b0505'],gulp:['#0d1f3b','#03060d'],m7:['#4a0a0a','#100303'],m8:['#3d0808','#0a0202'],taste:null};
function dramaBackdrop(t,b,who){const col=DRAMA[b];const hp=headPos(who);x.save();x.fillStyle=rg(hp[0],hp[1],1400,[[0,col[0]],[1,col[1]]]);x.fillRect(-500,-500,W+1000,H+1000);
  const r=rng(Math.floor(t*12)+7);x.fillStyle='rgba(255,240,220,0.22)';for(let i=0;i<110;i++){const a=r()*Math.PI*2,w=r()*0.02+0.004,r0=180+r()*120;x.beginPath();x.moveTo(hp[0]+Math.cos(a)*r0,hp[1]+Math.sin(a)*r0);x.lineTo(hp[0]+Math.cos(a-w)*2600,hp[1]+Math.sin(a-w)*2600);x.lineTo(hp[0]+Math.cos(a+w)*2600,hp[1]+Math.sin(a+w)*2600);x.fill()}x.restore()}
function eyeECU(c,t,k){x.save();x.fillStyle='#050403';x.fillRect(0,0,W,H);const bh=380*eOut(k);x.beginPath();x.rect(0,H/2-bh/2,W,bh);x.clip();
  x.fillStyle=rg(W/2,H/2,900,[[0,'#2a1a14'],[1,'#080505']]);x.fillRect(0,0,W,H);
  x.translate(W/2,H/2+20);x.scale(9.5,9.5);x.translate(0,8);faceA(c,t);if(c.who==='s'&&!c.noCap)kummaA(t);x.restore();
  x.strokeStyle='#e9e2d0';x.lineWidth=4;x.strokeRect(-4,H/2-bh/2,W+8,bh)}
const ECU=[['choke',0,0.45,'s'],['taste',0.38,0.56,'m'],['cat',0.79,0.93,'s'],['look',0.05,0.5,'m']];

// ---------- title & endcard ----------
function aTitle(t){const p=seg(t,0,S('titlecard',1));x.fillStyle=vg(0,H,[[0,'#120808'],[0.55,'#4a1410'],[0.8,'#8a2a14'],[1,'#1a0a06']]);x.fillRect(0,0,W,H);
  // smoke + embers
  const r=rng(31);for(let i=0;i<40;i++){const ph=(t*0.05+r())%1;x.fillStyle=`rgba(20,10,8,${0.5*(1-ph)})`;circ(r()*W,H*0.75-ph*600,80+r()*140);x.fill()}
  x.save();x.globalCompositeOperation='lighter';for(let i=0;i<60;i++){const ph=(t*0.12+r())%1;x.fillStyle=`rgba(255,${120+r()*80|0},60,${0.8*(1-ph)})`;circ(r()*W+Math.sin(t+i)*30,H-ph*H,1.5+r()*2.5);x.fill()}x.restore();
  // silhouettes on a rooftop
  x.fillStyle='#0a0606';x.fillRect(0,880,W,200);x.beginPath();x.moveTo(0,880);for(let i=0;i<=W;i+=80)x.lineTo(i,880-((i/80)%3===0?60:0));x.lineTo(W,880);x.fill();
  const z=lerp(1,1.12,ease(p));x.save();x.translate(W/2,900);x.scale(z,z);x.translate(-W/2,-900);
  for(const c of[salem({x:820,y:900,s:1.05,face:{eyes:'angry',brow:'angry',mouth:'flat'},armL:armP(POSE.down),armR:armP(POSE.down)}),maryam({x:1100,y:900,s:1.0,face:{eyes:'angry',brow:'angry',mouth:'flat'},armL:armP(POSE.down),armR:armP(POSE.down)})]){x.save();drawPerson(c,t);x.restore()}
  x.restore();x.fillStyle=`rgba(5,2,2,${0.82})`;x.globalCompositeOperation='source-atop';x.restore?0:0;x.globalCompositeOperation='source-over';
  // red rim
  x.fillStyle=vg(0,H,[[0,'rgba(0,0,0,0.6)'],[0.5,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,0.7)']]);x.fillRect(0,0,W,H);
  const tc=seg(t,S('titlecard'),S('titlecard')+0.25);if(tc>0){x.save();x.fillStyle=`rgba(0,0,0,${0.55*tc})`;x.fillRect(0,0,W,H);const sc=lerp(1.4,1,eOut(tc));x.translate(W/2,H/2-40);x.scale(sc,sc);
    x.font='170px Kufi';x.textAlign='center';x.textBaseline='middle';x.direction='rtl';x.lineWidth=14;x.strokeStyle='#000';x.strokeText('سالم ومريم',0,0);x.fillStyle='#f2ede0';x.fillText('سالم ومريم',0,0);
    x.fillStyle='#a3120f';x.fillRect(-420,96,840*eOut(seg(t,S('titlecard')+0.2,S('titlecard')+0.8)),12);
    x.font='54px Cairo';x.fillStyle='#e8dcc4';x.globalAlpha=eOut(seg(t,S('titlecard')+0.5,S('titlecard')+1.1));x.fillText('الحلقة الأولى — «حفلة… ما صارت»',0,170);x.restore()}}
function aEndcard(t){const p=seg(t,S('n2'),E('endcard'));const sc=SCENES.chaos;
  // aftermath: slow push on the wreck, then title
  x.save();cam({x:lerp(800,1000,p),y:600,z:lerp(1.0,1.25,p)});applyCam();livingSet(t,{sofa:false});diningTable(t,false);
  x.fillStyle='#f4efe2';const r=rng(5);for(let i=0;i<160;i++){ell(500+r()*1000,840+r()*80,4,2,r()*3);x.fill()}rr(1290,870,240,60,26);fs('#e9e4d8',3,AINK);rr(380,820,160,90,16);fs('#7f868c',3,AINK);drawCat({x:960,y:690,eyes:'happy'},t);x.restore();
  x.fillStyle=`rgba(0,0,0,${0.35+0.4*seg(t,S('endcard'),S('endcard')+0.6)})`;x.fillRect(0,0,W,H);
  const ep=seg(t,S('endcard'),S('endcard')+0.5);if(ep>0){x.save();x.globalAlpha=ep;x.font='150px Kufi';x.textAlign='center';x.textBaseline='middle';x.direction='rtl';x.lineWidth=12;x.strokeStyle='#000';x.strokeText('النهاية',W/2,440);x.fillStyle='#f2ede0';x.fillText('النهاية',W/2,440);
    x.fillStyle='#a3120f';x.fillRect(W/2-260,530,520,10);x.font='50px Cairo';x.fillStyle='#e8dcc4';x.fillText('…ترقّبوا الحلقة القادمة',W/2,610);x.restore()}}
SCENES.title=aTitle;SCENES.endcard=aEndcard;

// ---------- subtitles ----------
function subtitles(t){for(const e of TL){if(e.kind!=='say'||t<e.start-0.05||t>e.start+e.dur+0.35)continue;const a=cl((t-e.start+0.05)/0.12)*cl((e.start+e.dur+0.35-t)/0.15);
  x.save();x.globalAlpha=a;x.font='48px Cairo';x.direction='rtl';x.textAlign='center';x.textBaseline='middle';const nar=e.spk==='n';
  const words=e.text.split(' ');const lines=[];let cur='';for(const w of words){const tr=cur?cur+' '+w:w;if(x.measureText(tr).width>1400&&cur){lines.push(cur);cur=w}else cur=tr}lines.push(cur);
  const other=TL.some(o=>o.kind==='say'&&o.spk!==e.spk&&t>=o.start&&t<=o.start+o.dur&&o.start<e.start);const y0=(other?900:1010)-(lines.length-1)*62;
  lines.forEach((ln,i)=>{const y=y0+i*62;x.lineWidth=9;x.lineJoin='round';x.strokeStyle='#000';x.strokeText(ln,W/2,y);x.fillStyle=nar?'#e9d39a':e.spk==='s'?'#f4f1ea':'#f7e6ec';x.fillText(ln,W/2,y)});x.restore()}}

// ---------- grade / atmosphere ----------
function grade(t,scene){x.save();
  x.globalCompositeOperation='saturation';x.fillStyle='rgba(128,128,128,0.42)';x.fillRect(0,0,W,H);
  x.globalCompositeOperation='multiply';x.fillStyle='#e6d6bc';x.fillRect(0,0,W,H);
  x.globalCompositeOperation='soft-light';x.fillStyle=vg(0,H,[[0,'rgba(0,0,0,0.6)'],[0.5,'rgba(128,128,128,0.2)'],[1,'rgba(0,0,0,0.6)']]);x.fillRect(0,0,W,H);
  x.globalCompositeOperation='source-over';
  // dust motes
  const r=rng(77);for(let i=0;i<50;i++){const px=(r()*W+t*(10+r()*20))%W,py=(r()*H+Math.sin(t*0.5+i)*30);x.fillStyle=`rgba(255,240,210,${0.12+0.15*Math.sin(t*2+i)**2})`;circ(px,py,1+r()*2.5);x.fill()}
  // grain
  const g=rng(Math.floor(t*24)*13+5);x.globalAlpha=0.07;for(let i=0;i<900;i++){x.fillStyle=g()<0.5?'#fff':'#000';x.fillRect(g()*W,g()*H,2,2)}x.globalAlpha=1;
  x.fillStyle=rg(W/2,H/2,1150,[[0.5,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,0.62)']]);x.fillRect(0,0,W,H);x.restore()}
function godRays(t){x.save();x.globalCompositeOperation='screen';for(let i=0;i<5;i++){const a=0.25+i*0.05;x.fillStyle=`rgba(255,215,160,${0.07+0.03*Math.sin(t*0.7+i)})`;x.beginPath();x.moveTo(1520+i*50,180);x.lineTo(1560+i*50,180);x.lineTo(900+i*160,1080);x.lineTo(760+i*160,1080);x.fill()}x.restore()}

// ---------- render ----------
function render(t){T=t;x.setTransform(1,0,0,1,0,0);x.globalAlpha=1;x.globalCompositeOperation='source-over';x.clearRect(0,0,W,H);
  const b=beatAt(t);const sc=SCENES[b.scene];
  if(b.scene==='title'||b.scene==='endcard'){sc(t)}
  else{const res=sc(t);x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,W,H);
    const shake=(b.id==='crash'&&P('crash',t)<0.5)?14:(b.id==='pop'&&P('pop',t)>0.1&&P('pop',t)<0.35)?12:(DRAMA[b.id]?3:0);
    x.save();applyCam(shake);sc(t);
    const drama=DRAMA[b.id]&&res.chars.length;
    if(drama){const who=res.chars.find(c=>c.who===(b.spk||'s'))||res.chars[0];dramaBackdrop(t,b.id,who)}
    else if(res.before)res.before();
    for(const c of res.chars)drawPerson(c,t);for(const c of(res.cats||[]))drawCat(c,t);if(res.after)res.after();x.restore();
    if(['living','balloon','end'].includes(b.scene)&&!drama)godRays(t);
    for(const[id,a0,a1,who]of ECU){if(!BT[id])continue;const ta=S(id,a0),tb=S(id,a1);if(t>=ta&&t<tb){const c=res.chars.find(q=>q.who===who);if(c){const cc={...c,face:{...c.face,eyes:'wide',brow:'raised'},talk:0,tint:null,shock:true};eyeECU(cc,t,seg(t,ta,ta+0.12))}}}}
  grade(t,b.scene);
  for(let i=1;i<TL.length;i++){if(TL[i].scene!==TL[i-1].scene){const d=t-TL[i].start;if(d>=-0.2&&d<0.2){x.fillStyle=`rgba(0,0,0,${1-Math.abs(d)/0.2})`;x.fillRect(0,0,W,H)}}}
  subtitles(t);
  const fi=1-seg(t,0,0.5),fo=seg(t,TOTAL-1.0,TOTAL);if(fi>0||fo>0){x.fillStyle=`rgba(0,0,0,${Math.max(fi,fo)})`;x.fillRect(0,0,W,H)}}

window.BALLOON_OFF=48;
