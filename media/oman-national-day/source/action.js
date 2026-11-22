// Action / fight layer for the Oman National Day anime short.
// Loaded by anime_action.html after the base scenes and helpers.
const G=1450; // ground line (world space)
const LEN={torso:62,neck:8,head:16,ua:32,fa:30,th:44,sh:44,sw:84};
const POSES={
  STAND:{torso:0,head:0,rua:0.15,rfa:0.1,lua:-0.12,lfa:0.1,rth:0.12,rsh:-0.05,lth:-0.12,lsh:0.05,sw:0.35},
  GUARD:{torso:0.15,head:-0.1,rua:0.9,rfa:0.6,lua:0.5,lfa:1.2,rth:0.5,rsh:-0.6,lth:-0.5,lsh:0.2,sw:2.2},
  DASH:{torso:0.85,head:-0.5,rua:-1.3,rfa:-0.3,lua:-1.0,lfa:-0.2,rth:1.1,rsh:-1.2,lth:-0.9,lsh:-0.3,sw:-1.65},
  RUN:{torso:0.55,head:-0.3,rua:0.9,rfa:0.9,lua:-0.9,lfa:-0.4,rth:0.9,rsh:-1.0,lth:-0.7,lsh:-0.4,sw:2.0},
  WIND:{torso:-0.2,head:0,rua:-2.6,rfa:-0.4,lua:0.8,lfa:0.6,rth:0.5,rsh:-0.4,lth:-0.5,lsh:0.1,sw:-2.4},
  STRIKE:{torso:0.6,head:-0.2,rua:1.4,rfa:0.2,lua:-0.6,lfa:-0.3,rth:0.9,rsh:-1.0,lth:-0.8,lsh:-0.2,sw:1.75},
  UPCUT:{torso:-0.1,head:-0.3,rua:2.8,rfa:0.2,lua:-0.8,lfa:-0.4,rth:0.6,rsh:-1.2,lth:-0.2,lsh:-0.6,sw:3.0},
  TUCK:{torso:0.3,head:0,rua:-2.0,rfa:-1.0,lua:0.6,lfa:0.8,rth:1.6,rsh:-2.2,lth:1.2,lsh:-2.0,sw:-2.0},
  PLUNGE:{torso:0.4,head:0.2,rua:0.4,rfa:0.1,lua:-1.5,lfa:0,rth:1.4,rsh:-2.0,lth:-0.3,lsh:-0.8,sw:0.08},
  LAND:{torso:0.5,head:-0.2,rua:1.0,rfa:0.3,lua:-1.2,lfa:0.2,rth:1.5,rsh:-1.5,lth:-0.3,lsh:-1.2,sw:1.45},
  CLASH:{torso:0.5,head:-0.2,rua:1.3,rfa:0.7,lua:1.1,lfa:0.9,rth:0.8,rsh:-0.8,lth:-1.0,lsh:0.1,sw:2.35},
  PUSHED:{torso:-0.35,head:0.1,rua:1.6,rfa:0.9,lua:1.3,lfa:1.1,rth:0.9,rsh:-0.4,lth:-0.6,lsh:-0.3,sw:2.7},
  POWER:{torso:-0.05,head:-0.35,rua:0.55,rfa:0.3,lua:-0.5,lfa:1.6,rth:0.45,rsh:-0.1,lth:-0.45,lsh:0.1,sw:0.75},
  VICTORY:{torso:0,head:-0.25,rua:2.95,rfa:0.1,lua:-0.3,lfa:0.2,rth:0.2,rsh:0,lth:-0.2,lsh:0,sw:3.12},
  BOSSIDLE:{torso:0.1,head:0,rua:0.7,rfa:0.9,lua:-0.4,lfa:0.3,rth:0.35,rsh:-0.3,lth:-0.35,lsh:0.2,sw:1.6},
};
const mixPose=(a,b,p)=>{const o={};for(const k in a)o[k]=lerp(a[k],b[k],p);return o};

function fk(P){const s=P.s,f=P.f;
  const up=a=>[Math.sin(a)*f,-Math.cos(a)],dn=a=>[Math.sin(a)*f,Math.cos(a)];
  const add=(p,d,l)=>[p[0]+d[0]*l*s,p[1]+d[1]*l*s];
  const J={};J.hip=[P.x,P.y];J.u=up(P.torso);J.n=[-J.u[1],J.u[0]];
  J.neck=add(J.hip,J.u,LEN.torso);J.head=add(J.neck,up(P.torso+P.head),LEN.neck+LEN.head);
  J.rEl=add(J.neck,dn(P.rua),LEN.ua);J.rHa=add(J.rEl,dn(P.rua+P.rfa),LEN.fa);
  J.lEl=add(J.neck,dn(P.lua),LEN.ua);J.lHa=add(J.lEl,dn(P.lua+P.lfa),LEN.fa);
  J.rKn=add(J.hip,dn(P.rth),LEN.th);J.rFt=add(J.rKn,dn(P.rth+P.rsh),LEN.sh);
  J.lKn=add(J.hip,dn(P.lth),LEN.th);J.lFt=add(J.lKn,dn(P.lth+P.lsh),LEN.sh);
  J.swDir=dn(P.sw);J.tip=add(J.rHa,J.swDir,LEN.sw*(P.swl||1));J.s=s;J.f=f;J.P=P;return J}

// keyframes: [time, poseName, x, y|null(ground), f]
function track(kf,t,ground=G,s=2.2){
  const res=k=>{const P={...POSES[k[1]],x:k[2],y:0,s,f:k[4]??1};if(k[3]==null){const J=fk(P);P.y=ground-Math.max(J.rFt[1],J.lFt[1])}else P.y=k[3];return P};
  if(t<=kf[0][0])return res(kf[0]);
  for(let i=0;i<kf.length-1;i++){const a=kf[i],b=kf[i+1];if(t>=a[0]&&t<b[0]){const p=eOut((t-a[0])/(b[0]-a[0]));const A=res(a),B=res(b);const o=mixPose(A,B,p);o.f=p<0.5?A.f:B.f;o.s=s;return o}}
  return res(kf[kf.length-1])}

// ---------- drawing ----------
function seg2(a,b,w,col,line,lw){x.lineCap='round';if(line){x.strokeStyle=line;x.lineWidth=w+lw;x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.stroke()}x.strokeStyle=col;x.lineWidth=w;x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.stroke()}
function poly(pts){x.beginPath();x.moveTo(pts[0][0],pts[0][1]);for(const p of pts.slice(1))x.lineTo(p[0],p[1]);x.closePath()}
const L2=(a,b,p)=>[lerp(a[0],b[0],p),lerp(a[1],b[1],p)];
const addv=(a,v,k)=>[a[0]+v[0]*k,a[1]+v[1]*k];

function robePts(J,t,ragged){const s=J.s,n=J.n,f=J.f;
  const legs=[[J.rKn,J.rFt],[J.lKn,J.lFt]].map(([k,ft])=>({k,h:L2(k,ft,ragged?0.55:0.75)}));
  const pr=p=>(p[0]-J.hip[0])*n[0]+(p[1]-J.hip[1])*n[1];
  legs.sort((a,b)=>pr(b.k)-pr(a.k));
  const fl=Math.sin(t*11)*4*s;const wind=[-f*fl,0];
  const A=legs[0],B=legs[1];
  const pts=[addv(J.neck,n,-17*s),addv(J.neck,n,17*s),addv(J.hip,n,17*s),addv(A.k,n,9*s),addv(addv(A.h,n,13*s),wind,1)];
  if(ragged){const r=rng(5);const a=pts[pts.length-1],b=addv(addv(B.h,n,-13*s),wind,1);for(let i=1;i<7;i++){const q=L2(a,b,i/7);pts.push([q[0],q[1]+(i%2?18:4)*s*(0.6+0.4*Math.sin(t*9+i))])}}
  pts.push(addv(addv(B.h,n,-13*s),wind,1),addv(B.k,n,-9*s),addv(J.hip,n,-17*s));return pts}

function drawHero(J,t,o={}){const s=J.s,f=J.f;const C={robe:'#f6f3ec',shade:'#cfc7b8',line:'#121633',skin:'#c88b5d',pant:'#dcd4c4'};const lw=5*s;
  x.save();x.lineJoin='round';
  if(o.alpha!=null)x.globalAlpha=o.alpha;
  // scarf (red) trailing behind
  const sc=[];for(let i=0;i<14;i++)sc.push([J.neck[0]-f*i*10*s,J.neck[1]+i*1.5*s+Math.sin(t*(o.wind||9)-i*0.7)*i*1.4*s]);
  x.strokeStyle=C.line;x.lineCap='round';for(let i=0;i<13;i++){x.lineWidth=(12-i*0.7)*s+lw;x.beginPath();x.moveTo(...sc[i]);x.lineTo(...sc[i+1]);x.stroke()}
  for(let i=0;i<13;i++){x.strokeStyle=i%4<2?'#c8102e':'#a50d25';x.lineWidth=(12-i*0.7)*s;x.beginPath();x.moveTo(...sc[i]);x.lineTo(...sc[i+1]);x.stroke()}
  // far arm, shins
  seg2(J.neck,J.lEl,11*s,C.shade,C.line,lw);seg2(J.lEl,J.lHa,10*s,C.shade,C.line,lw);
  x.fillStyle=C.skin;x.beginPath();x.arc(J.lHa[0],J.lHa[1],6*s,0,7);x.fill();
  seg2(J.lKn,J.lFt,10*s,C.pant,C.line,lw);seg2(J.rKn,J.rFt,10*s,C.pant,C.line,lw);
  for(const ft of[J.lFt,J.rFt]){x.fillStyle='#5a3a22';x.beginPath();x.ellipse(ft[0]+f*5*s,ft[1],9*s,4*s,0,0,7);x.fill()}
  // dishdasha
  const rp=robePts(J,t,false);poly(rp);x.fillStyle=C.robe;x.strokeStyle=C.line;x.lineWidth=lw;x.fill();x.stroke();
  // cel shade on back half
  x.save();poly(rp);x.clip();x.fillStyle='rgba(120,120,150,0.22)';const n=J.n;poly([addv(J.neck,n,-40*s),J.neck,J.hip,addv(J.hip,[J.hip[0]-J.neck[0],J.hip[1]-J.neck[1]],2.4),addv(addv(J.hip,n,-60*s),[0,120*s],1)]);x.fill();x.restore();
  // tassel (furakha)
  const tt=addv(J.neck,J.u,-6*s);seg2(tt,addv(tt,[f*Math.sin(t*6)*3*s,1],24*s),2.5*s,'#8a6a3a');x.fillStyle='#8a6a3a';const te=addv(tt,[0,1],26*s);x.beginPath();x.arc(te[0],te[1],3*s,0,7);x.fill();
  // belt + khanjar
  const b0=addv(J.hip,J.u,8*s);seg2(addv(b0,n,-17*s),addv(b0,n,17*s),5*s,'#7a5a2a');
  x.save();x.translate(...addv(b0,n,2*s*f));x.scale(f,1);x.strokeStyle='#f2c14e';x.lineWidth=4.5*s;x.lineCap='round';
  if(o.glow){x.shadowColor='#ffd76a';x.shadowBlur=30*s}x.beginPath();x.moveTo(0,-8*s);x.lineTo(0,6*s);x.quadraticCurveTo(1*s,18*s,12*s,18*s);x.stroke();x.restore();
  // head + massar turban
  const h=J.head,r=15*s;x.fillStyle=C.skin;x.strokeStyle=C.line;x.lineWidth=lw*0.8;x.beginPath();x.arc(h[0],h[1],r,0,7);x.fill();x.stroke();
  x.fillStyle='#2a1a12';x.beginPath();x.arc(h[0]+f*4*s,h[1]+6*s,r*0.85,0.15*Math.PI,0.85*Math.PI);x.fill(); // beard
  x.save();x.translate(h[0],h[1]);x.rotate(J.P.torso*f*0.5);x.fillStyle='#8c1c2c';x.beginPath();x.ellipse(0,-6*s,r*1.12,r*0.78,0,Math.PI,0);x.lineTo(r*1.12,-2*s);x.lineTo(-r*1.12,-2*s);x.fill();x.stroke();
  x.strokeStyle='#f2c14e';x.lineWidth=1.6*s;for(let i=0;i<3;i++){x.beginPath();x.ellipse(0,-6*s+i*3*s,r*1.05,r*0.6-i*2*s,0,Math.PI*1.05,-0.05*Math.PI);x.stroke()}
  x.fillStyle='#8c1c2c';x.beginPath();x.moveTo(-f*r,-6*s);x.quadraticCurveTo(-f*(r+10*s),2*s+Math.sin(t*9)*3*s,-f*(r+6*s),12*s);x.lineTo(-f*(r-3*s),-2*s);x.fill();x.restore();
  // eye
  x.save();if(o.glow){x.shadowColor='#ffd76a';x.shadowBlur=24*s;x.fillStyle='#fff2b0'}else x.fillStyle=C.line;x.beginPath();x.ellipse(h[0]+f*8*s,h[1]-1*s,3.4*s,1.6*s,0,0,7);x.fill();x.restore();
  // sword (straight Omani saif)
  const bb=J.rHa,tip=J.tip,d=J.swDir,pn=[-d[1],d[0]];
  x.save();if(o.glow){x.shadowColor='#ffcf5a';x.shadowBlur=50*s}
  x.fillStyle=o.glow?'#fff7d6':'#e9eef5';x.strokeStyle=C.line;x.lineWidth=2*s;poly([addv(bb,pn,3.2*s),addv(tip,pn,1.2*s),addv(tip,d,6*s),addv(tip,pn,-1.2*s),addv(bb,pn,-3.2*s)]);x.fill();x.stroke();
  x.strokeStyle='rgba(255,255,255,0.9)';x.lineWidth=1.2*s;x.beginPath();x.moveTo(...addv(bb,pn,1*s));x.lineTo(...tip);x.stroke();x.restore();
  seg2(addv(bb,pn,-9*s),addv(bb,pn,9*s),3.5*s,'#f2c14e',C.line,2*s);seg2(bb,addv(bb,d,-12*s),4*s,'#f2c14e',C.line,2*s);
  // near arm
  seg2(J.neck,J.rEl,11*s,C.robe,C.line,lw);seg2(J.rEl,J.rHa,10*s,C.robe,C.line,lw);x.fillStyle=C.skin;x.beginPath();x.arc(J.rHa[0],J.rHa[1],6.5*s,0,7);x.fill();
  x.restore()}

function drawShadow(J,t,o={}){const s=J.s,f=J.f;const lw=4*s;x.save();x.lineJoin='round';if(o.alpha!=null)x.globalAlpha=o.alpha;
  const body='#0e0818',line='#7b2cbf';x.shadowColor='#b040ff';x.shadowBlur=22*s;
  // smoke wisps
  const r=rng(o.seed||1);x.save();x.globalCompositeOperation='source-over';for(let i=0;i<10;i++){const ph=r()*6,yy=((t*60*r()+r()*200)%200);x.fillStyle=`rgba(60,20,90,${0.35*(1-yy/200)})`;x.beginPath();x.arc(J.hip[0]-f*(10+r()*40)*s+Math.sin(t*3+ph)*8*s,J.hip[1]-yy*s*0.6,(6+r()*10)*s,0,7);x.fill()}x.restore();
  seg2(J.neck,J.lEl,10*s,body,line,lw);seg2(J.lEl,J.lHa,9*s,body,line,lw);seg2(J.lKn,J.lFt,10*s,body,line,lw);seg2(J.rKn,J.rFt,10*s,body,line,lw);
  poly(robePts(J,t,true));x.fillStyle=body;x.strokeStyle=line;x.lineWidth=lw;x.fill();x.stroke();
  // hooded head
  const h=J.head,R=16*s;x.beginPath();x.moveTo(h[0]-f*R,h[1]+R);x.quadraticCurveTo(h[0]-f*R*1.2,h[1]-R*1.6,h[0]+f*R*0.6,h[1]-R*1.4);x.quadraticCurveTo(h[0]+f*R*1.3,h[1]-R*0.2,h[0]+f*R*0.9,h[1]+R);x.closePath();x.fill();x.stroke();
  if(o.horns){x.beginPath();x.moveTo(h[0]-f*R*0.2,h[1]-R*1.2);x.quadraticCurveTo(h[0]-f*R*1.5,h[1]-R*3,h[0]-f*R*2.4,h[1]-R*2.6);x.quadraticCurveTo(h[0]-f*R*1.2,h[1]-R*2.2,h[0]+f*R*0.3,h[1]-R*1.3);x.fill();x.stroke()}
  x.shadowColor='#ff2030';x.shadowBlur=20*s;x.fillStyle='#ff3b3b';for(const dx of[0.35,0.75]){x.beginPath();x.ellipse(h[0]+f*R*dx,h[1]-R*0.05,3.2*s,1.8*s,f*0.2,0,7);x.fill()}
  // curved blade
  const bb=J.rHa,d=J.swDir,pn=[-d[1],d[0]],Lb=LEN.sw*s*(J.P.swl||1);x.shadowColor='#ff2040';x.shadowBlur=18*s;x.fillStyle='#1a0d24';x.strokeStyle='#ff3355';x.lineWidth=2.5*s;
  x.beginPath();x.moveTo(...addv(bb,pn,3*s));x.quadraticCurveTo(...addv(addv(bb,d,Lb*0.6),pn,10*s),...addv(addv(bb,d,Lb),pn,14*s));x.quadraticCurveTo(...addv(addv(bb,d,Lb*0.55),pn,-2*s),...addv(bb,pn,-3*s));x.closePath();x.fill();x.stroke();
  x.shadowBlur=22*s;x.shadowColor='#b040ff';seg2(J.neck,J.rEl,10*s,body,line,lw);seg2(J.rEl,J.rHa,9*s,body,line,lw);
  x.restore()}

// ---------- FX ----------
function slashArc(cx,cy,r,a0,a1,p,col='120,220,255'){if(p<=0||p>=1)return;x.save();x.globalCompositeOperation='lighter';x.lineCap='round';const N=18,e=eOut(p*1.6),fade=1-p;
  for(let pass=0;pass<2;pass++){x.strokeStyle=pass?`rgba(255,255,255,${fade})`:`rgba(${col},${fade*0.8})`;if(!pass){x.shadowColor=`rgb(${col})`;x.shadowBlur=30}else x.shadowBlur=0;
    for(let i=0;i<N;i++){const u=i/N,u2=(i+1)/N;if(u>e)break;const w=Math.sin(u*Math.PI)*(pass?12:30)*(1+r/400);x.lineWidth=w;x.beginPath();x.arc(cx,cy,r,lerp(a0,a1,u),lerp(a0,a1,Math.min(u2,e)));x.stroke()}}x.restore()}
function sparks(cx,cy,dt,seed,n=26,col='255,210,120',spd=900){if(dt<0||dt>0.6)return;const r=rng(seed);x.save();x.globalCompositeOperation='lighter';x.lineCap='round';
  for(let i=0;i<n;i++){const a=r()*Math.PI*2,v=spd*(0.4+r()*0.6),d=v*dt*(1-dt*0.8);const px=cx+Math.cos(a)*d,py=cy+Math.sin(a)*d+300*dt*dt;x.strokeStyle=`rgba(${col},${1-dt/0.6})`;x.lineWidth=4;x.beginPath();x.moveTo(px,py);x.lineTo(px-Math.cos(a)*30*(1-dt),py-Math.sin(a)*30*(1-dt));x.stroke()}
  if(dt<0.12){x.fillStyle=rgrad(cx,cy,220,[[0,`rgba(255,255,255,${1-dt/0.12})`],[0.3,`rgba(${col},${0.6*(1-dt/0.12)})`],[1,'rgba(0,0,0,0)']]);x.fillRect(cx-220,cy-220,440,440)}x.restore()}
function shatter(cx,cy,s,dt,seed,big=1){if(dt<0||dt>1.6)return;const r=rng(seed);x.save();const life=1-dt/1.6;
  for(let i=0;i<40*big;i++){const a=r()*Math.PI*2,v=(200+r()*700)*s/2.2*big,rot=(r()-0.5)*14,sz=(6+r()*16)*s*big;const px=cx+Math.cos(a)*v*dt*(1-dt*0.3),py=cy+(r()-0.5)*120*s+Math.sin(a)*v*dt*(1-dt*0.3)+500*dt*dt;
    x.save();x.translate(px,py);x.rotate(rot*dt+a);x.globalAlpha=life;x.fillStyle=i%5?'#1a0d2a':'#ff3355';x.strokeStyle='#9b4dff';x.lineWidth=2;x.beginPath();x.moveTo(0,-sz);x.lineTo(sz*0.7,sz*0.6);x.lineTo(-sz*0.6,sz*0.4);x.closePath();x.fill();x.stroke();x.restore()}
  x.globalCompositeOperation='lighter';for(let i=0;i<30*big;i++){const a=r()*Math.PI*2,v=(100+r()*500)*big;x.fillStyle=`rgba(255,${80+r()*120|0},60,${life})`;x.beginPath();x.arc(cx+Math.cos(a)*v*dt,cy+Math.sin(a)*v*dt-120*dt,3+r()*3,0,7);x.fill()}
  x.restore()}
function afterimages(kfFn,t,drawFn,n=5,gap=0.035){for(let i=n;i>=1;i--){const P=kfFn(t-i*gap);x.save();x.globalCompositeOperation='lighter';drawFn(fk(P),t,{alpha:0.16*(1-i/(n+1))});x.restore()}}
function aura(J,t,k){x.save();x.globalCompositeOperation='lighter';const c=[J.hip[0],(J.hip[1]+J.head[1])/2],s=J.s;const cols=['255,60,80','255,255,255','40,220,110','255,200,80'];
  for(let i=0;i<46;i++){const a=i/46*Math.PI*2,ph=i*1.7;const len=(70+50*Math.sin(t*9+ph)+40*Math.sin(t*23+ph*2))*s*k;const bx=c[0]+Math.cos(a)*45*s,by=c[1]+Math.sin(a)*80*s;
    x.strokeStyle=`rgba(${cols[i%4]},${0.35*k})`;x.lineWidth=10*s;x.lineCap='round';x.beginPath();x.moveTo(bx,by);x.quadraticCurveTo(bx+Math.cos(a)*len*0.5,by-len*0.4,bx+Math.cos(a)*len*0.3+Math.sin(t*7+i)*10*s,by-len);x.stroke()}
  x.fillStyle=rgrad(c[0],c[1],260*s*k+1,[[0,`rgba(255,230,150,${0.5*k})`],[1,'rgba(255,200,80,0)']]);x.fillRect(c[0]-300*s,c[1]-300*s,600*s,600*s);x.restore()}

// shakes & impact frames (global)
const SHAKES=[[10.1,26],[11.0,26],[12.45,48],[13.2,14],[13.4,14],[13.6,14],[13.8,14],[14.0,30],[17.7,40],[19.0,55],[24.0,14],[24.6,20],[26.1,70],[26.6,60]];
function shakeAt(t){let sx=0,sy=0;for(const[a,amp]of SHAKES){const d=t-a;if(d>=0&&d<0.6){const k=amp*Math.exp(-d*8);sx+=Math.sin(d*90+a)*k;sy+=Math.cos(d*77+a*3)*k}}if(t>17.1&&t<18.4){const k=10;sx+=Math.sin(t*70)*k;sy+=Math.cos(t*63)*k}return[sx,sy]}
const INVERT=[[10.1,10.17],[11.0,11.07],[12.45,12.55],[19.0,19.1],[26.1,26.14],[26.2,26.24]];
function postFX(t){for(const[a,b]of INVERT)if(t>=a&&t<b){x.save();x.globalCompositeOperation='saturation';x.fillStyle='#808080';x.fillRect(0,0,W,H);x.globalCompositeOperation='difference';x.fillStyle='#fff';x.fillRect(0,0,W,H);x.restore();
  x.save();x.globalCompositeOperation='multiply';x.fillStyle='rgba(255,120,120,1)';x.globalAlpha=0.25;x.fillRect(0,0,W,H);x.restore()}}

// ---------- world background for fights ----------
const dune1=ridge(41,300,120,G),dune2=ridge(42,130,70,G);
function battleBG(t,cam,redK=1){x.fillStyle=vgrad(0,H,[[0,'#07030f'],[0.45,'#2a0b2e'],[0.7,'#6b1630'],[1,'#200810']]);x.fillRect(0,0,W,H);
  stars(t,0.5);
  // blood-red moon haze
  const mx=W*0.72-cam.x*0.03,my=520;x.fillStyle=rgrad(mx,my,420,[[0,`rgba(255,120,90,${0.45*redK})`],[1,'rgba(255,80,60,0)']]);x.fillRect(0,0,W,H);x.fillStyle='#ffd9c2';x.beginPath();x.arc(mx,my,110,0,7);x.fill();
  x.fillStyle='rgba(180,60,60,0.35)';x.beginPath();x.arc(mx-30,my+20,40,0,7);x.arc(mx+40,my-30,22,0,7);x.fill();
  // fast clouds
  for(let i=0;i<5;i++){const cy=300+i*130,off=((t*(80+i*40)+i*400)%(W+900))-450;x.fillStyle=`rgba(20,5,25,${0.5})`;x.beginPath();x.ellipse(off,cy,380,26,0,0,7);x.ellipse(off+200,cy-18,180,24,0,0,7);x.fill()}
  // parallax layers
  const toS=(wx,wy,par)=>[(wx-cam.x*par)*cam.z+W/2,(wy-cam.y)*cam.z+H*0.62];
  x.save();const o=toS(0,0,0.25);x.translate(o[0],0);x.fillStyle='#1c0a1c';x.beginPath();x.moveTo(-2000,H);for(let i=-2000;i<=2600;i+=10)x.lineTo(i,dune1(i)-G+toS(0,G,0.25)[1]-200);x.lineTo(2600,H);x.fill();
  fort(500,toS(0,G,0.25)[1]-190,0.55,'#140812','#ff7a3a');x.restore();
  x.save();const o2=toS(0,0,0.6);x.translate(o2[0],0);x.fillStyle='#2a0e1e';x.beginPath();x.moveTo(-2000,H);for(let i=-2000;i<=2600;i+=10)x.lineTo(i,dune2(i)-G+toS(0,G,0.6)[1]-40);x.lineTo(2600,H);x.fill();x.restore();
  // ground
  const gy=toS(0,G,1)[1];x.fillStyle=vgrad(gy,H,[[0,'#4a1a22'],[0.25,'#2a0c14'],[1,'#0d0408']]);x.fillRect(0,gy,W,H-gy);
  x.fillStyle='rgba(255,140,90,0.5)';x.fillRect(0,gy,W,3);
  const r=rng(8);for(let i=0;i<40;i++){const wx=r()*3000-800,wy=G+r()*500;const p=toS(wx,wy,1);x.fillStyle='rgba(10,3,6,0.6)';x.beginPath();x.ellipse(p[0],p[1],(8+r()*20)*cam.z,(3+r()*6)*cam.z,0,0,7);x.fill()}
  return toS}
function withCam(cam,fn){x.save();x.translate(W/2,H*0.62);x.scale(cam.z,cam.z);x.translate(-cam.x,-cam.y);fn();x.restore()}
function embers(t,a){dust(t,a,'255,110,50')}

// ---------- SCENE: darkness rises (0 – 4.5) ----------
const EYES=(()=>{const r=rng(66),a=[];for(let i=0;i<14;i++)a.push([80+r()*920,1250+r()*520,0.6+r()*3,0.6+r()*0.8]);return a})();
function sDark(t){scene1(t,false);
  x.fillStyle=`rgba(120,0,25,${0.45*seg(t,0.5,4)})`;x.globalCompositeOperation='multiply';x.fillRect(0,0,W,H);x.globalCompositeOperation='source-over';
  // creeping shadow fog
  for(let i=0;i<16;i++){const fx=(i*97+t*(20+i*3))%(W+400)-200,fy=H-80-((t*60+i*30)%200)-seg(t,0,4.5)*400;x.fillStyle=rgrad(fx,fy,260,[[0,'rgba(10,0,18,0.75)'],[1,'rgba(10,0,18,0)']]);x.fillRect(fx-260,fy-260,520,520)}
  x.fillStyle=vgrad(H-900,H,[[0,'rgba(5,0,10,0)'],[1,`rgba(5,0,10,${0.9*seg(t,0,3)})`]]);x.fillRect(0,H-900,W,900);
  for(const[ex,ey,et,sz]of EYES){const v=seg(t,et,et+0.3);if(v<=0)continue;const blink=Math.abs(Math.sin(t*2.3+ex))>0.06?1:0.1;x.save();x.globalCompositeOperation='lighter';x.shadowColor='#ff1020';x.shadowBlur=30;x.fillStyle=`rgba(255,40,40,${v})`;for(const d of[-1,1]){x.beginPath();x.ellipse(ex+d*16*sz,ey,8*sz,3.5*sz*blink,d*-0.25,0,7);x.fill()}x.restore()}
  title('حين يزحفُ الظلام…',820,104,'Amiri',1.2,t,{out:3.9,colors:[[0,'#ffffff'],[0.5,'#ffc2c2'],[1,'#ff6a6a']],glow:'rgba(255,40,60,0.9)'});
}

// ---------- SCENE: guardian on the fort (4.5 – 9) ----------
function animeEye(t,cy,open){x.save();x.fillStyle='#0b0b14';x.fillRect(0,cy-170,W,340);x.beginPath();x.rect(0,cy-170,W,340);x.clip();
  speedLines(W/2,cy,t,0.12,'#c9d8ff',60);
  const ex=W/2,ew=330,eh=120*open;
  x.fillStyle='#c88b5d';x.fillRect(0,cy-170,W,340);
  x.fillStyle='#2a1a12';x.beginPath();x.moveTo(ex-ew*0.9,cy-150);x.quadraticCurveTo(ex,cy-230,ex+ew*0.95,cy-140);x.lineTo(ex+ew*0.95,cy-115);x.quadraticCurveTo(ex,cy-190,ex-ew*0.9,cy-125);x.fill(); // brow
  x.save();x.beginPath();x.moveTo(ex-ew,cy);x.quadraticCurveTo(ex-ew*0.2,cy-eh*1.3,ex+ew,cy-eh*0.2);x.quadraticCurveTo(ex+ew*0.2,cy+eh*0.9,ex-ew,cy);x.closePath();x.fillStyle='#fffaf0';x.fill();x.clip();
  const ir=105;x.fillStyle=rgrad(ex+20,cy-10,ir,[[0,'#1a0d00'],[0.28,'#3a1d00'],[0.3,'#ffcf4a'],[0.75,'#c27a10'],[1,'#3a1d00']]);x.beginPath();x.arc(ex+20,cy-10,ir,0,7);x.fill();
  x.fillStyle='#000';x.beginPath();x.arc(ex+20,cy-10,36,0,7);x.fill();
  x.fillStyle='#fff';x.beginPath();x.ellipse(ex-15,cy-50,24,16,-0.4,0,7);x.fill();x.beginPath();x.arc(ex+60,cy+30,9,0,7);x.fill();
  x.fillStyle='rgba(0,0,0,0.25)';x.fillRect(ex-ew,cy-200,ew*2,60*open+30);x.restore();
  x.strokeStyle='#120a06';x.lineWidth=14;x.lineCap='round';x.beginPath();x.moveTo(ex-ew,cy);x.quadraticCurveTo(ex-ew*0.2,cy-eh*1.3,ex+ew,cy-eh*0.2);x.stroke();
  for(let i=0;i<4;i++){x.lineWidth=8;x.beginPath();x.moveTo(ex+ew-20-i*30,cy-eh*0.3-i*10);x.lineTo(ex+ew+20-i*28,cy-eh*0.6-i*16);x.stroke()}
  x.restore();x.strokeStyle='#fff';x.lineWidth=8;x.strokeRect(-10,cy-170,W+20,340)}
function heroFortTrack(t){return track([[4.5,'STAND',0,null,1],[7.2,'STAND',0,null,1],[7.45,'WIND',0,null,1],[7.8,'GUARD',0,null,1]],t,0,2.4)}
function sHero(t){const p=seg(t,4.5,9);
  x.fillStyle=vgrad(0,H,[[0,'#06030f'],[0.5,'#2a0b33'],[1,'#7a1a35']]);x.fillRect(0,0,W,H);stars(t,0.8);
  const mx=290,my=520;x.fillStyle=rgrad(mx,my,380,[[0,'rgba(255,200,170,0.5)'],[1,'rgba(255,150,120,0)']]);x.fillRect(0,0,W,H);x.fillStyle='#ffe6d0';x.beginPath();x.arc(mx,my,95,0,7);x.fill();
  for(let i=0;i<6;i++){const cy=260+i*150,off=((t*(160+i*60)+i*300)%(W+900))-450;x.fillStyle='rgba(15,4,22,0.7)';x.beginPath();x.ellipse(off,cy,420,24,0,0,7);x.fill()}
  // lightning flash
  const lf=seg(t,5.1,5.35);if(lf>0&&lf<1){x.fillStyle=`rgba(230,210,255,${0.5*(1-lf)})`;x.fillRect(0,0,W,H);x.strokeStyle=`rgba(255,255,255,${1-lf})`;x.lineWidth=6;x.shadowColor='#c9a0ff';x.shadowBlur=30;x.beginPath();let bx=820,by=0;x.moveTo(bx,by);const r=rng(4);while(by<900){bx+=(r()-0.5)*120;by+=60+r()*60;x.lineTo(bx,by)}x.stroke();x.shadowBlur=0}
  const z=lerp(1,1.18,ease(p));x.save();x.translate(W/2,H*0.7);x.scale(z,z);x.translate(-W/2,-H*0.7);
  fort(W/2,H+300,1.7,'#2a0f1c','#ff8a3a');
  const top=H+300-470*1.7;const P=heroFortTrack(t);P.x=W/2+20;const J0=fk({...P,y:0});P.y=top-Math.max(J0.rFt[1],J0.lFt[1]);
  // rim light
  x.save();x.shadowColor='rgba(255,120,120,0.9)';x.shadowBlur=60;drawHero(fk(P),t,{wind:14});x.restore();
  // blade gleam
  const gl=seg(t,7.8,8.4);if(gl>0&&gl<1){const J=fk(P);const k=Math.sin(gl*Math.PI);x.save();x.globalCompositeOperation='lighter';x.translate(...J.tip);x.rotate(gl*2);x.fillStyle='#fff';for(const a of[0,Math.PI/2]){x.save();x.rotate(a);x.beginPath();x.moveTo(-120*k,0);x.lineTo(0,-8*k);x.lineTo(120*k,0);x.lineTo(0,8*k);x.fill();x.restore()}x.fillStyle=rgrad(0,0,90*k+1,[[0,'rgba(255,240,200,0.9)'],[1,'rgba(255,240,200,0)']]);x.fillRect(-100,-100,200,200);x.restore()}
  x.restore();
  embers(t,0.6);
  // eye cut-in
  const ec=seg(t,5.6,5.8),eo=1-seg(t,6.9,7.05);if(ec>0&&eo>0){x.save();x.globalAlpha=Math.min(ec,eo);x.translate((1-eOut(ec))*-W,0);animeEye(t,880,lerp(0.15,1,eOut(seg(t,5.9,6.2))));x.restore()}
  title('يقفُ حارسُ عُمان',380,118,'Kufi',7.7,t,{out:8.7});
}

// ---------- SCENE: battle (9 – 17) ----------
const HERO_KF=[[9.0,'GUARD',150,null],[9.55,'GUARD',180,null],[9.75,'DASH',380,null],[9.93,'WIND',510,null],[10.06,'STRIKE',570,null],[10.5,'STRIKE',585,null],
  [10.74,'WIND',600,null],[10.93,'UPCUT',630,G-300],[11.15,'UPCUT',650,G-330],[11.45,'LAND',670,null],[11.62,'LAND',670,null],
  [11.9,'TUCK',710,G-720],[12.22,'TUCK',750,G-780],[12.43,'PLUNGE',775,null],[12.8,'LAND',775,null],[12.9,'WIND',775,null],
  [14.05,'STRIKE',775,null],[14.35,'LAND',775,null],[16.0,'LAND',775,null],[16.8,'GUARD',775,null]];
function heroB(t){const P=track(HERO_KF,t);if(t>12.9&&t<14.05){const k=0.5+0.5*Math.sin(t*44);Object.assign(P,mixPose(POSES.WIND,POSES.STRIKE,k));P.f=Math.floor(t/0.11)%2?1:-1;const J=fk({...P,y:0});P.y=G-Math.max(J.rFt[1],J.lFt[1])}return P}
const ENEMIES=[
  {kf:[[9.0,'RUN',980,null,-1],[9.9,'RUN',660,null,-1],[10.0,'WIND',650,null,-1]],hit:10.1,seed:11},
  {kf:[[10.3,'TUCK',1100,G-760,-1],[10.98,'PLUNGE',700,G-430,-1]],hit:11.0,seed:12},
  {kf:[[10.8,'RUN',1250,null,-1],[11.9,'RUN',860,null,-1],[12.3,'GUARD',850,null,-1]],hit:12.45,seed:13},
  {kf:[[12.5,'RUN',150,null,1],[13.1,'WIND',620,null,1]],hit:13.2,seed:14},
  {kf:[[12.5,'RUN',1400,null,-1],[13.3,'WIND',930,null,-1]],hit:13.4,seed:15},
  {kf:[[12.6,'RUN',60,null,1],[13.5,'WIND',600,null,1]],hit:13.6,seed:16},
  {kf:[[12.6,'RUN',1500,null,-1],[13.7,'WIND',950,null,-1]],hit:13.8,seed:17},
  {kf:[[12.8,'TUCK',780,G-1100,-1],[13.95,'PLUNGE',790,G-520,-1]],hit:14.0,seed:18}];
function camB(t){const P=heroB(t);const z=t<9.6?1.0:t<10.6?lerp(1.0,1.15,eOut(seg(t,9.6,10.0))):t<12.9?1.05:t<14.2?lerp(1.05,0.78,eOut(seg(t,12.9,13.3))):lerp(0.78,1.35,ease(seg(t,14.2,16.8)));
  return{x:cl(P.x,430,1000),y:G-260+Math.min(0,P.y-(G-170))*0.75,z}}
function sBattle(t){const cam=camB(t);battleBG(t,cam);
  withCam(cam,()=>{
    // shockwave from plunge
    const sw=t-12.45;if(sw>=0&&sw<0.8){x.save();x.strokeStyle=`rgba(255,200,140,${1-sw/0.8})`;x.lineWidth=14*(1-sw/0.8);x.beginPath();x.ellipse(775,G,40+sw*900,10+sw*120,0,0,7);x.stroke();
      x.strokeStyle=`rgba(255,170,80,${1-sw/0.8})`;x.lineWidth=5;const r=rng(3);for(let i=0;i<9;i++){let cx=775,cy=G;x.beginPath();x.moveTo(cx,cy);const dir=(r()-0.5)*2;for(let k=0;k<5;k++){cx+=dir*60+(r()-0.5)*30;cy+=r()*14;x.lineTo(cx,cy)}x.stroke()}x.restore();
      sparks(775,G-10,sw,77,40,'255,190,120',1100)}
    for(const e of ENEMIES){if(t<e.kf[0][0])continue;const P=track(e.kf,Math.min(t,e.hit),G,2.1);
      if(t<e.hit){drawShadow(fk(P),t,{seed:e.seed,alpha:cl((t-e.kf[0][0])*4)})}
      else{const J=fk(P);shatter(J.hip[0],J.hip[1]-60,2.1,t-e.hit,e.seed);sparks(J.hip[0],J.hip[1]-60,t-e.hit,e.seed+1);
        const a=e.seed*1.3;slashArc(J.hip[0],J.hip[1]-60,170,a,a+2.4,(t-e.hit)/0.35)}}
    const P=heroB(t);
    if((t>9.6&&t<10.1)||(t>11.6&&t<12.5))afterimages(heroB,t,drawHero,6,0.03);
    drawHero(fk(P),t,{wind:12});
    if(t>12.9&&t<14.1){for(let k=0;k<3;k++){const a=t*26+k*2.1;slashArc(P.x,P.y-40,190+k*25,a,a+2.2,0.35)}}
  });
  embers(t,0.7);
  const bw=seg(t,9.6,10.2);if(bw>0&&bw<1)speedLines(W/2,H*0.55,t,0.25*Math.sin(bw*Math.PI));
  if(t>12.9&&t<14.1)speedLines(W/2,H*0.55,t,0.2,'#ffd0d0',120);
  if(t>14.2){x.fillStyle=`rgba(0,0,0,${0.25*seg(t,14.2,15)})`;x.fillRect(0,0,W,H)}
  title('سيفُ الحقِّ لا ينكسر',360,108,'Kufi',14.7,t,{out:16.6});
}

// ---------- SCENE: the shadow titan (17 – 23) ----------
const BOSS_S=5.4,BX=880;
function bossP(t){const kf=[[17,'BOSSIDLE',BX,null,-1],[18.3,'BOSSIDLE',BX,null,-1],[18.65,'WIND',BX,null,-1],[18.98,'STRIKE',BX-30,null,-1],[19.0,'STRIKE',BX-30,null,-1],[20.5,'STRIKE',BX-20,null,-1],[21.2,'BOSSIDLE',BX,null,-1]];
  const P=track(kf,t,G,BOSS_S);P.swl=1.15;P.y+=lerp(1100,0,eOut(seg(t,17.0,18.1)))+Math.sin(t*2)*8;
  const k=t<18.7?0:t<18.98?eOut(seg(t,18.7,18.98)):t<20.6?1:1-seg(t,20.6,21.1);if(k>0){const J=fk(P),Jh=fk(heroBoss(Math.max(t,18.98)));const dx=Jh.tip[0]-J.rHa[0],dy=Jh.tip[1]-J.rHa[1];const a=Math.atan2(dx*P.f,dy);P.sw=lerp(P.sw,a,k);P.swl=lerp(P.swl,Math.hypot(dx,dy)/(LEN.sw*P.s)+0.15,k)}return P}
const HERO_BOSS_KF=[[17,'GUARD',330,null],[18.7,'GUARD',330,null],[18.95,'CLASH',360,null],[20.5,'CLASH',360,null],[20.9,'PUSHED',150,null],[21.3,'LAND',140,null],[21.9,'LAND',140,null],[22.7,'POWER',140,null]];
const heroBoss=t=>track(HERO_BOSS_KF,t);
const camBoss=t=>({x:560,y:G-430,z:0.78});
function drawBoss(P,t){x.save();x.beginPath();x.rect(-3000,-5000,8000,5000+G+4);x.clip();drawShadow(fk(P),t,{seed:99,horns:true});x.restore()}
function panelHero(t){const P=heroBoss(t);const J=fk(P);x.fillStyle='#0d1830';x.fillRect(-100,-100,W+200,H+200);speedLines(W/2,600,t,0.3,'#bcd4ff',80);x.save();x.translate(W*0.42,560);x.scale(4.2,4.2);x.translate(-J.head[0],-J.head[1]);drawHero(J,t,{wind:16});x.restore()}
function panelBoss(t){const P=bossP(t);const J=fk(P);x.fillStyle='#2a0008';x.fillRect(-100,-100,W+200,H+200);speedLines(W/2,1450,t,0.3,'#ff6a6a',80);x.save();x.translate(W*0.62,1480);x.scale(1.5,1.5);x.translate(-J.head[0],-J.head[1]);drawShadow(J,t,{seed:99,horns:true});x.restore()}
function sBoss(t){const cam=camBoss(t);battleBG(t,cam,1.4);
  withCam(cam,()=>{const B=bossP(t);
    // rising darkness pillar
    const rp=seg(t,17,18.3);if(rp>0&&rp<1){x.fillStyle=`rgba(40,0,60,${0.6*Math.sin(rp*Math.PI)})`;x.fillRect(BX-500,G-1600,1000,1600)}
    drawBoss(B,t);
    // roar rings
    const rr=t-17.7;if(rr>0&&rr<1.2){const J=fk(B);x.save();for(let k=0;k<3;k++){const q=rr-k*0.15;if(q<0)continue;x.strokeStyle=`rgba(255,40,60,${0.7*(1-q/1.05)})`;x.lineWidth=12;x.beginPath();x.arc(J.head[0],J.head[1],60+q*1500,0,7);x.stroke()}x.restore()}
    const P=heroBoss(t);if(t>20.5&&t<21.0){const r=rng(Math.floor(t*30));for(let i=0;i<8;i++){x.fillStyle=`rgba(180,120,100,${0.5*r()})`;x.beginPath();x.arc(P.x+40+r()*120,G-r()*40,10+r()*30,0,7);x.fill()}}
    drawHero(fk(P),t,{wind:12});
    const Jh=fk(P);sparks(Jh.tip[0],Jh.tip[1],t-19.0,5,60,'255,220,140',1500);
    if(t>19.0&&t<20.5){const r=rng(Math.floor(t*40));x.save();x.globalCompositeOperation='lighter';for(let i=0;i<10;i++){const a=r()*7,d=40+r()*140;x.strokeStyle='rgba(255,230,160,0.9)';x.lineWidth=3;x.beginPath();x.moveTo(Jh.tip[0],Jh.tip[1]);x.lineTo(Jh.tip[0]+Math.cos(a)*d,Jh.tip[1]+Math.sin(a)*d);x.stroke()}x.fillStyle=rgrad(Jh.tip[0],Jh.tip[1],160,[[0,'rgba(255,255,230,0.9)'],[1,'rgba(255,200,100,0)']]);x.fillRect(Jh.tip[0]-160,Jh.tip[1]-160,320,320);x.restore()}
  });
  embers(t,0.8);
  if(t>17.6&&t<18.4)speedLines(W*0.7,H*0.35,t,0.18,'#ff5a5a',100);
  // manga panels during the clash
  const pin=eOut(seg(t,19.08,19.3)),pout=seg(t,20.35,20.5);if(pin>0&&pout<1){const off=(1-pin)*W*1.2+pout*W*1.2;
    const drawPanel=(pts,fn,dx)=>{x.save();x.translate(dx,0);poly(pts);x.save();x.clip();fn(t);x.restore();poly(pts);x.lineWidth=16;x.strokeStyle='#fff';x.stroke();x.lineWidth=5;x.strokeStyle='#000';x.stroke();x.restore()};
    drawPanel([[0,0],[W,0],[W,720],[0,1000]],panelHero,-off);drawPanel([[0,1130],[W,850],[W,H],[0,H]],panelBoss,off);}
  title('من أجلِ عُمان!',380,130,'Kufi',21.5,t,{out:22.9});
}

// ---------- SCENE: power-up & final strike (23 – 27.5) ----------
const HERO_FIN_KF=[[23,'POWER',140,null],[24.95,'POWER',140,null],[25.15,'WIND',160,null],[25.3,'DASH',300,null],[25.45,'STRIKE',1010,null],[27.5,'STRIKE',1010,null]];
const heroF=t=>track(HERO_FIN_KF,t);
function camF(t){const P=heroF(t);if(t<24.9){const z=lerp(1.9,1.5,seg(t,23,24.9));return{x:P.x+40,y:P.y-120,z}}return{x:lerp(P.x+40,600,eOut(seg(t,24.9,25.4))),y:lerp(G-300,G-450,eOut(seg(t,24.9,25.4))),z:lerp(1.5,0.74,eOut(seg(t,24.9,25.4)))}}
function sPower(t){const cam=camF(t);battleBG(t,cam,1.4);
  const SL={a:[BX-420,G-1300],b:[BX+300,G-60]};// slash line through boss (world)
  withCam(cam,()=>{const B=bossP(Math.min(t,22.9));
    const sp=seg(t,26.1,26.6);
    if(t<26.6){ if(sp<=0)drawBoss(B,t); else {
        const d=[SL.b[0]-SL.a[0],SL.b[1]-SL.a[1]],len=Math.hypot(...d),u=[d[0]/len,d[1]/len],nrm=[-u[1],u[0]];const sep=eOut(sp)*90;
        for(const side of[1,-1]){x.save();const far=4000;poly([addv(SL.a,u,-far),addv(SL.b,u,far),addv(addv(SL.b,u,far),nrm,side*far),addv(addv(SL.a,u,-far),nrm,side*far)]);x.clip();x.translate(nrm[0]*side*sep+u[0]*side*sep*0.6,nrm[1]*side*sep+u[1]*side*sep*0.6);drawBoss(B,t);x.restore()}
        x.save();x.globalCompositeOperation='lighter';x.strokeStyle='#fff7d0';x.shadowColor='#ffd060';x.shadowBlur=80;x.lineWidth=20+sp*200;x.beginPath();x.moveTo(...addv(SL.a,u,-400));x.lineTo(...addv(SL.b,u,400));x.stroke();x.restore()}}
    // glowing cut line before split
    const cl1=seg(t,25.9,26.08);if(cl1>0&&t<26.1){const p2=L2(SL.a,SL.b,eOut(cl1));x.save();x.globalCompositeOperation='lighter';x.strokeStyle='#fff';x.shadowColor='#ffcf5a';x.shadowBlur=40;x.lineWidth=10;x.beginPath();x.moveTo(...SL.a);x.lineTo(...p2);x.stroke();x.restore()}
    if(t>=26.6)shatter(BX,G-560,5.0,t-26.6,321,2.2);
    // ground cracks & rising debris during power-up
    if(t<25.2){const k=seg(t,23,24.6);const P=heroF(t);x.save();x.globalCompositeOperation='lighter';x.strokeStyle=`rgba(255,200,90,${k})`;x.lineWidth=5;x.shadowColor='#ffb030';x.shadowBlur=20;const r=rng(17);
      for(let i=0;i<10;i++){let cx=P.x,cy=G;x.beginPath();x.moveTo(cx,cy);const dir=(r()-0.5)*2;for(let q=0;q<6*k;q++){cx+=dir*40+(r()-0.5)*25;cy+=r()*10;x.lineTo(cx,cy)}x.stroke()}x.restore();
      const rr=rng(23);for(let i=0;i<26;i++){const st=23+rr()*1.5,ph=t-st;if(ph<0)continue;const px=P.x+(rr()-0.5)*600,py=G-ph*(120+rr()*160);x.save();x.translate(px,py);x.rotate(ph*(rr()-0.5)*4);x.fillStyle='#3a1a14';x.strokeStyle='#ffb060';x.lineWidth=2;const sz=6+rr()*16;x.fillRect(-sz/2,-sz/2,sz,sz*0.7);x.strokeRect(-sz/2,-sz/2,sz,sz*0.7);x.restore()}}
    const P=heroF(t);const J=fk(P);
    if(t<25.2)aura(J,t,eOut(seg(t,23.1,24.2)));
    if(t>25.25&&t<26.6){x.save();x.globalCompositeOperation='lighter';const a=1-seg(t,25.9,26.6);x.strokeStyle=`rgba(255,230,150,${a})`;x.shadowColor='#ffcf5a';x.shadowBlur=60;x.lineWidth=40*a+4;x.beginPath();x.moveTo(300,G-110);x.lineTo(1010,G-110);x.stroke();x.restore()}
    if(t>25.25&&t<25.5)afterimages(heroF,t,drawHero,8,0.02);
    drawHero(J,t,{glow:t<26.6,wind:16});
  });
  if(t<25.2){speedLines(W/2,H*0.55,t,0.22*seg(t,23.2,24),'#ffe9b0',110);for(const pt of[24.0,24.6]){const d=t-pt;if(d>=0&&d<0.3){x.fillStyle=`rgba(255,240,200,${0.5*(1-d/0.3)})`;x.fillRect(0,0,W,H)}}}
  // light rays bursting through
  const lr=seg(t,26.5,27.5);if(lr>0){const S=(()=>{const c=camF(t);return[(BX-c.x)*c.z+W/2,(G-560-c.y)*c.z+H*0.62]})();x.save();x.globalCompositeOperation='lighter';x.translate(...S);x.rotate(t*0.3);for(let i=0;i<20;i++){x.rotate(Math.PI/10);x.fillStyle=`rgba(255,230,170,${0.25*lr})`;x.beginPath();x.moveTo(0,0);x.lineTo(-50-lr*80,-2400);x.lineTo(50+lr*80,-2400);x.fill()}x.restore();
    x.fillStyle=`rgba(255,250,240,${ease(seg(t,26.8,27.5))})`;x.fillRect(0,0,W,H)}
  title('بروحِ الأجداد',380,128,'Kufi',23.3,t,{out:24.85});
}

// ---------- victory on the fort ----------
window.onFort=function(t){if(SCENES!==ACTION_SCENES)return;const P=track([[12,'STAND',0,null],[13.6,'STAND',0,null],[14.3,'VICTORY',0,null]],t,0,1.05);P.x=W/2-150;const J0=fk({...P,y:0});P.y=(H-330-470)-Math.max(J0.rFt[1],J0.lFt[1]);drawHero(fk(P),t,{wind:7})};

const ACTION_SCENES=[[0,4.5,sDark,0],[4.5,9,sHero,0],[9,17,sBattle,0],[17,23,sBoss,0],[23,27.5,sPower,0],[27.5,33,t=>scene3(t-15.5),0.6],[33,40,t=>scene5(t-9),0.6]];
SCENES=ACTION_SCENES;
