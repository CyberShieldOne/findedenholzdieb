'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {SlidersHorizontal,Volume2,VolumeX} from 'lucide-react';
import {WoodlandAudio,defaultSound,safeSound,type SoundSettings} from '../lib/woodland-audio';
export function useWoodlandSound(){
 const engine=useRef<WoodlandAudio|null>(null),pending=useRef(false);
 const[playing,setPlaying]=useState(false),[settings,setSettings]=useState<SoundSettings>(defaultSound),[error,setError]=useState('');
 useEffect(()=>{try{const current=localStorage.getItem('gottlieb-sound-v2');if(current){setSettings(safeSound(JSON.parse(current)))}else{const old=localStorage.getItem('gottlieb-sound-v1');if(old){const saved=safeSound(JSON.parse(old));const softer={...saved,ambience:Math.round(saved.ambience*.65)};setSettings(softer);localStorage.setItem('gottlieb-sound-v2',JSON.stringify(softer))}}}catch{}
  const visibility=()=>engine.current?.visibility(document.hidden);document.addEventListener('visibilitychange',visibility);
  return()=>{document.removeEventListener('visibilitychange',visibility);void engine.current?.dispose();engine.current=null};
 },[]);
 const adjust=useCallback((next:SoundSettings)=>{const safe=safeSound(next);setSettings(safe);engine.current?.volumes(safe);try{localStorage.setItem('gottlieb-sound-v2',JSON.stringify(safe))}catch{}},[]);
 async function toggle(){if(pending.current)return;pending.current=true;setError('');try{if(playing){engine.current?.pause();setPlaying(false)}else{engine.current??=new WoodlandAudio();await engine.current.start(settings);setPlaying(true)}}catch{engine.current?.pause();setError('Ton konnte nicht gestartet werden. Bitte erneut einschalten.');setPlaying(false)}finally{pending.current=false}}
 function cue(kind:Parameters<WoodlandAudio['cue']>[0]){engine.current?.cue(kind)}
 return{playing,settings,adjust,toggle,cue,error};
}
export function SoundControls({playing,settings,onToggle,onChange,error}:{playing:boolean;settings:SoundSettings;onToggle:()=>void;onChange:(s:SoundSettings)=>void;error:string}){
 return <div className="sound-controls"><button className={`sound-toggle ${playing?'is-playing':''}`} onClick={onToggle} aria-label={playing?'Waldklang ausschalten':'Waldklang einschalten'} aria-pressed={playing}>{playing?<Volume2 size={16}/>:<VolumeX size={16}/>}<span>{playing?'Waldklang an':'Waldklang einschalten'}</span>{playing&&<i className="audio-bars"><b/><b/><b/></i>}</button><details className="sound-mixer"><summary aria-label="Klangmixer öffnen"><SlidersHorizontal size={16}/></summary><div className="mixer-panel"><h3>Dein Waldklang</h3><p>Sanftes Plätschern, leise Musik und dein Spiel.</p>{([['ambience','Bach & Natur'],['music','Sanfte Melodie'],['effects','Spielsignale']] as const).map(([key,label])=><label key={key} htmlFor={`volume-${key}`}><span>{label}<output>{settings[key]} %</output></span><input id={`volume-${key}`} type="range" aria-label={label} aria-valuetext={`${settings[key]} Prozent`} min="0" max="100" step="1" value={settings[key]} onChange={e=>onChange({...settings,[key]:Number(e.target.value)})}/></label>)}<small>{playing?'Leise durchatmen. Und genau hinsehen.':'Klicke auf „Waldklang einschalten“, um zuzuhören.'}</small><a className="audio-credit" href="https://freesound.org/people/TRP/sounds/567730/" target="_blank" rel="noreferrer">Bachaufnahme: TRP · CC0</a></div></details>{error&&<span className="sound-error" role="alert">{error}</span>}</div>
}
