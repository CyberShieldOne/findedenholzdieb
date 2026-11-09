'use client';
import {useEffect,useRef,useState} from 'react';
import type {Place} from '../lib/adventure';
export function PainterlyScene({place}:{place:Place}){
 const host=useRef<HTMLDivElement>(null);const[error,setError]=useState(false);
 useEffect(()=>{let disposed=false;let destroy:(()=>void)|undefined;setError(false);
 async function mount(){try{const {Application,Assets,Sprite,Graphics,Container,BlurFilter}=await import('pixi.js');const app=new Application();await app.init({width:1000,height:620,resolution:Math.min(window.devicePixelRatio||1,2),autoDensity:true,antialias:true,preference:'webgl',backgroundAlpha:0});if(disposed){app.destroy(true);return}destroy=()=>app.destroy(true,{children:true,texture:false});host.current?.appendChild(app.canvas);const tex=await Assets.load('/art/'+place+'.png');if(disposed)return;const bg=new Sprite(tex);bg.width=1000;bg.height=620;app.stage.addChild(bg);
 const atmosphere=new Container();app.stage.addChild(atmosphere);const haze=new Graphics().ellipse(730,230,270,55).fill({color:0xffedc0,alpha:.07});haze.filters=[new BlurFilter({strength:16,quality:2})];atmosphere.addChild(haze);
 const motes=Array.from({length:36},(_,i)=>{const g=new Graphics().circle(0,0,1+i%3*.45).fill({color:0xffefba,alpha:.13+i%5*.045});g.x=(i*197)%1000;g.y=(i*113)%620;atmosphere.addChild(g);return g});const reduced=matchMedia('(prefers-reduced-motion: reduce)');let time=0;app.ticker.maxFPS=60;app.ticker.add(ticker=>{if(reduced.matches)return;time+=ticker.deltaTime;haze.alpha=.65+Math.sin(time*.006)*.2;for(let i=0;i<motes.length;i++){const g=motes[i];g.x+=(.09+i%3*.04)*ticker.deltaTime;g.y-=.06*ticker.deltaTime;if(g.y<0)g.y=620;if(g.x>1000)g.x=0;g.alpha=.55+Math.sin(time*.025+i)*.35;}});
 }catch{if(!disposed)setError(true)}}void mount();return()=>{disposed=true;destroy?.()};},[place]);
 return <><img src={'/art/'+place+'.png'} className="painted-fallback" alt="Detaillierte illustrierte Ortsansicht"/><div ref={host} className="painted-gpu" aria-hidden="true"/>{error&&<span className="render-note">Bildansicht · GPU-Effekte nicht verfügbar</span>}</>;
}
