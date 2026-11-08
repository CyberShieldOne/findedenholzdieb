'use client';
import {useEffect,useRef,useState} from 'react';
import {spawn,type WorldPoint} from '../lib/world-layout';
import type {WorldFrame} from '../lib/openworld-runtime';

export function OpenWorld({start,paused,onFrame,onInteract,quality}:{start:WorldPoint;paused:boolean;onFrame:(frame:WorldFrame)=>void;onInteract:(id:string)=>void;quality:'balanced'|'high'}){
 const canvas=useRef<HTMLCanvasElement>(null),state=useRef({paused,onFrame,onInteract}),pose=useRef(start);state.current={paused,onFrame,onInteract};
 const [error,setError]=useState(''),[loading,setLoading]=useState(true);
 useEffect(()=>{let cancelled=false,world:{dispose:()=>void}|undefined;setLoading(true);setError('');
  import('../lib/openworld-runtime').then(({mountOpenWorld})=>mountOpenWorld(canvas.current!,{start:pose.current||spawn,quality,paused:()=>state.current.paused,onFrame:f=>{pose.current=f;state.current.onFrame(f)},onInteract:id=>state.current.onInteract(id)})).then(w=>{if(cancelled)w.dispose();else{world=w;setLoading(false)}}).catch(e=>{if(!cancelled){console.error('3D world initialization failed',e);setError('3D konnte in diesem Browser nicht gestartet werden. Die illustrierte Ermittlung bleibt verfügbar.');setLoading(false)}});
  return()=>{cancelled=true;world?.dispose()};
 },[quality]);
 return <><canvas ref={canvas} tabIndex={0} aria-label="Frei begehbare 3D-Welt. WASD oder Pfeiltasten bewegen, Mausziehen dreht die Kamera, E untersucht nahe Objekte, Leertaste springt."/>{loading&&<div className="forest-loading" role="status"><span className="world-loader"/><b>Der Falkenforst erwacht.</b><p>Landschaft und Physik werden geladen …</p></div>}{error&&<div className="forest-loading" role="alert"><b>{error}</b><a href="/abenteuer">Illustrierten Fall spielen →</a></div>}</>;
}
