const {chromium}=require('playwright');const {spawn}=require('child_process');
(async()=>{const dir=process.argv[2],out=process.argv[3];const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
await p.goto('file://'+dir+'/'+(process.env.PAGE||'episode.html'));await p.evaluate(()=>window.ready);const total=await p.evaluate(()=>window.TOTAL);
const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate','24','-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p',out],{stdio:['pipe','inherit','inherit']});
const N=Math.round(total*24);for(let i=0;i<N;i++){await p.evaluate(t=>render(t),i/24);const buf=await p.screenshot({type:'jpeg',quality:93});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(i%240==0)console.log('frame',i,'/',N)}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();console.log('done')})();
