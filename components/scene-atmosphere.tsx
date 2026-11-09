'use client';
import {useEffect,useRef} from 'react';

type Particle={x:number;y:number;age:number;life:number;size:number;speed:number;phase:number;kind:number};
// Native Canvas 2D: each particle has its own lifetime, speed and phase.
export function SceneAtmosphere({enabled}:{enabled:boolean}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const canvas=ref.current;if(!canvas)return;const ctx=canvas.getContext('2d');if(!ctx)return;
  let frame=0,last=0,clock=0,width=1,height=1,visible=true;
  const rand=(a:number,b:number)=>a+Math.random()*(b-a);
  const particles:Particle[]=[];
  function spawn(p:Particle,initial=false){
   p.age=initial?rand(0,p.life):0;p.phase=rand(0,Math.PI*2);
   if(p.kind===0){p.x=rand(.04,.97);p.y=rand(.18,.9);p.life=rand(4,11);p.size=rand(.8,2);p.speed=rand(.003,.009)}
   if(p.kind===1){p.x=rand(.1,.9);p.y=rand(.1,.45);p.life=rand(10,23);p.size=rand(3,6);p.speed=rand(.012,.024)}
   if(p.kind===2){p.x=.285+rand(-.008,.008);p.y=.075;p.life=rand(5,9);p.size=rand(5,10);p.speed=rand(.015,.026)}
   if(p.kind===3){p.x=rand(.82,.97);p.y=rand(.72,.99);p.life=rand(1.1,3.8);p.size=rand(2,8);p.speed=rand(.008,.02)}
   if(p.kind===4){p.x=rand(.68,.94);p.y=rand(.06,.2);p.life=rand(19,36);p.size=rand(3,5);p.speed=rand(.025,.045)}
   if(p.kind===5){p.x=rand(.72,.92);p.y=rand(.53,.8);p.life=rand(15,28);p.size=rand(3,5);p.speed=rand(.004,.01)}
   if(initial)p.age=rand(0,p.life);
  }
  for(let kind=0;kind<6;kind++)for(let i=0;i<[25,7,7,18,3,2][kind];i++){const p={x:0,y:0,age:0,life:1,size:1,speed:1,phase:0,kind};spawn(p,true);particles.push(p)}
  function resize(){if(!canvas||!ctx)return;const box=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);width=box.width;height=box.height;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(canvas);resize();
  function draw(now:number){
   if(!ctx||!canvas)return;const dt=last?Math.min((now-last)/1000,.05):0;last=now;clock+=dt;ctx.clearRect(0,0,width,height);
   // A slow warm pulse stays anchored to the workshop window, not the clues.
   const glow=ctx.createRadialGradient(width*.065,height*.38,0,width*.065,height*.38,width*.045);glow.addColorStop(0,`rgba(255,188,66,${.08+Math.sin(clock*.7)*.025})`);glow.addColorStop(1,'rgba(255,188,66,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
   for(const p of particles){p.age+=dt;if(p.age>p.life)spawn(p);const u=p.age/p.life,fade=Math.sin(Math.PI*u),scale=Math.max(.6,width/800);let x=p.x*width,y=p.y*height;ctx.save();
    if(p.kind===0){x+=Math.sin(p.phase+p.age*.6)*18;y-=p.age*p.speed*height;ctx.globalAlpha=fade*.65;ctx.shadowBlur=5;ctx.shadowColor='#f6d28e';ctx.fillStyle=p.size>1.5?'#ffe2a6':'#fff8d3';ctx.beginPath();ctx.arc(x,y,p.size*scale,0,Math.PI*2);ctx.fill()}
    if(p.kind===1){x+=(p.age*12+Math.sin(p.age*.8+p.phase)*25)*scale;y+=p.age*p.speed*height;ctx.translate(x,y);ctx.rotate(p.phase+p.age*.65);ctx.scale(Math.cos(p.age*1.8+p.phase)*.8,1);ctx.globalAlpha=fade*.8;ctx.fillStyle=['#bc863c','#8a9750','#cda55a'][Math.floor(p.phase)%3];ctx.beginPath();ctx.ellipse(0,0,p.size*scale,p.size*.4*scale,.5,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ebe0a677';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(-p.size*scale,0);ctx.lineTo(p.size*scale,0);ctx.stroke()}
    if(p.kind===2){x+=(Math.sin(p.age*.5+p.phase)*9-p.age*3)*scale;y-=p.age*p.speed*height;ctx.globalAlpha=fade*.07;ctx.fillStyle='#e3e0d4';ctx.filter='blur(4px)';ctx.beginPath();ctx.ellipse(x,y,(p.size+p.age*2)*scale,(p.size+p.age*1.6)*scale,0,0,Math.PI*2);ctx.fill()}
    if(p.kind===3){x+=Math.sin(p.age*1.5+p.phase)*3;y+=p.age*p.speed*height;ctx.globalAlpha=fade*(.16+.12*Math.sin(p.age*4));ctx.strokeStyle='#fff9d8';ctx.lineWidth=.7*scale;ctx.beginPath();ctx.ellipse(x,y,p.size*scale,(p.size*.16+.2)*scale,-.13,0,Math.PI*2);ctx.stroke()}
    if(p.kind===4&&u<.3){x+=p.age*p.speed*width;y+=Math.sin(p.age*.8+p.phase)*5;const wing=Math.sin(p.age*7+p.phase)*p.size*scale;ctx.globalAlpha=Math.sin(Math.PI*u/.3)*.6;ctx.strokeStyle='#343e2b';ctx.lineWidth=1.2*scale;ctx.beginPath();ctx.moveTo(x-p.size*scale,y-wing);ctx.quadraticCurveTo(x-p.size*.4*scale,y-2*scale,x,y);ctx.quadraticCurveTo(x+p.size*.4*scale,y-2*scale,x+p.size*scale,y-wing);ctx.stroke()}
    if(p.kind===5){x+=Math.sin(p.age*.42+p.phase)*width*.045;y+=Math.cos(p.age*.63+p.phase)*height*.04;ctx.translate(x,y);ctx.rotate(Math.sin(p.age*.7)*.3);ctx.globalAlpha=fade*.85;const wing=(.2+Math.abs(Math.sin(p.age*12+p.phase))*.8)*p.size*scale;ctx.fillStyle=p.phase>3?'#e1b45b':'#d7dbac';ctx.beginPath();ctx.ellipse(-wing*.65,0,wing,p.size*scale,.4,0,Math.PI*2);ctx.ellipse(wing*.65,0,wing,p.size*scale,-.4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#5d5634';ctx.fillRect(-.6*scale,-3*scale,1.2*scale,6*scale)}
    ctx.restore();
   }
   frame=requestAnimationFrame(draw);
  }
  function update(){cancelAnimationFrame(frame);last=0;if(enabled&&visible&&!document.hidden)frame=requestAnimationFrame(draw)}
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update()});intersection.observe(canvas);document.addEventListener('visibilitychange',update);update();
  return()=>{cancelAnimationFrame(frame);resizeObserver.disconnect();intersection.disconnect();document.removeEventListener('visibilitychange',update)};
 },[enabled]);
 return <canvas ref={ref} className="scene-atmosphere" aria-hidden="true"/>;
}
