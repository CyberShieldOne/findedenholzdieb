// Native Web Audio playback. CC0 brook recording by TRP (Freesound #567730).
// Original quiet music and cues; no synthetic noise beds.
export type SoundSettings={ambience:number;music:number;effects:number};
export const defaultSound:SoundSettings={ambience:24,music:18,effects:45};
export function safeSound(raw:unknown):SoundSettings{const a=raw&&typeof raw==='object'?raw as Record<string,unknown>:{};const n=(k:keyof SoundSettings)=>typeof a[k]==='number'&&Number.isFinite(a[k])?Math.max(0,Math.min(100,a[k] as number)):defaultSound[k];return{ambience:n('ambience'),music:n('music'),effects:n('effects')}}
export class WoodlandAudio{
 private context:AudioContext|null=null;
 private master:GainNode|null=null;
 private ambient:GainNode|null=null;
 private music:GainNode|null=null;
 private effects:GainNode|null=null;
 private timers=new Set<ReturnType<typeof setTimeout>>();
 private sources:AudioScheduledSourceNode[]=[];
 private brookLoading:Promise<void>|null=null;
 private settings:SoundSettings={...defaultSound};
 private active=false;
 private hidden=false;
 private noteIndex=0;
 private voices=new Set<OscillatorNode>();
 async start(settings:SoundSettings){
  this.settings=safeSound(settings);
  if(!this.context){this.context=new AudioContext();this.master=this.context.createGain();this.master.gain.value=0;const limiter=this.context.createDynamicsCompressor();limiter.threshold.value=-18;limiter.knee.value=16;limiter.ratio.value=5;this.master.connect(limiter);limiter.connect(this.context.destination);this.ambient=this.context.createGain();this.music=this.context.createGain();this.effects=this.context.createGain();for(const g of[this.ambient,this.music,this.effects])g.connect(this.master)}
  this.active=true;this.hidden=document.hidden;const context=this.context;await context.resume();await this.beds(context);if(this.context!==context||!this.active)return;this.volumes(settings);this.master!.gain.setTargetAtTime(this.hidden?0:.7,this.context.currentTime,.5);this.clearTimers();if(!this.hidden)this.loops();
 }
 private beds(context:AudioContext):Promise<void>{
  if(this.brookLoading)return this.brookLoading;
  this.brookLoading=(async()=>{
   const response=await fetch('/audio/kleiner-bach.mp3');
   if(!response.ok)throw new Error('Bachaufnahme konnte nicht geladen werden.');
   const buffer=await context.decodeAudioData(await response.arrayBuffer());
   if(this.context!==context)return;
   const source=context.createBufferSource(),gain=context.createGain(),pan=context.createStereoPanner();
   source.buffer=buffer;source.loop=true;gain.gain.value=.7;pan.pan.value=.48;
   source.connect(gain);gain.connect(pan);pan.connect(this.ambient!);source.start();this.sources.push(source);
  })().catch(error=>{this.brookLoading=null;throw error});
  return this.brookLoading;
 }

 volumes(settings:SoundSettings){this.settings=safeSound(settings);if(!this.context)return;const t=this.context.currentTime;this.ambient?.gain.setTargetAtTime(this.settings.ambience/100,t,.15);this.music?.gain.setTargetAtTime(this.settings.music/100,t,.15);this.effects?.gain.setTargetAtTime(this.settings.effects/100,t,.1)}
 private later(f:()=>void,ms:number){const id=setTimeout(()=>{this.timers.delete(id);if(this.active&&!this.hidden)f()},ms);this.timers.add(id)}
 private clearTimers(){this.timers.forEach(clearTimeout);this.timers.clear()}
 private loops(){
  const birds=()=>{this.bird();this.later(birds,5000+Math.random()*11000)};
  const wood=()=>{this.wood();this.later(wood,17000+Math.random()*21000)};
  const music=()=>{this.phrase();this.later(music,7800)};
  this.later(birds,1300+Math.random()*1800);this.later(wood,8000+Math.random()*6000);this.later(music,1000);
 }
 private tone(bus:GainNode,freq:number,when:number,length:number,gain:number,type:OscillatorType='sine',pan=0){
  const c=this.context!;const o=c.createOscillator(),g=c.createGain(),p=c.createStereoPanner();o.type=type;o.frequency.value=freq;p.pan.value=pan;g.gain.setValueAtTime(.0001,when);g.gain.exponentialRampToValueAtTime(Math.max(.0001,gain),when+.035);g.gain.exponentialRampToValueAtTime(.0001,when+length);o.connect(g);g.connect(p);p.connect(bus);this.voices.add(o);o.start(when);o.stop(when+length+.02);o.onended=()=>{this.voices.delete(o);o.disconnect();g.disconnect();p.disconnect()};return o;
 }
 private bird(){if(!this.context||!this.ambient)return;const t=this.context.currentTime,base=1900+Math.random()*1200,pan=Math.random()*1.6-.8;for(let i=0;i<3;i++){const at=t+i*.14;const o=this.tone(this.ambient,base,at,.11,.018,'sine',pan);o.frequency.exponentialRampToValueAtTime(base*1.32,at+.045);o.frequency.exponentialRampToValueAtTime(base*.9,at+.1)}}
 private wood(){if(!this.context||!this.ambient)return;const t=this.context.currentTime;this.tone(this.ambient,230+Math.random()*60,t,.23,.03,'triangle',-.6);this.tone(this.ambient,410,t+.04,.12,.013,'sine',-.6)}
 private phrase(){
  if(!this.context||!this.music)return;const c=this.context,t=c.currentTime;
  // Slow D-major pentatonic motifs, bell/soft plucked tones and a warm bass drone.
  const phrases=[[62,66,69,73,69,66],[64,69,71,76,73,69],[59,62,66,71,69,66],[57,62,64,69,66,62]],notes=phrases[this.noteIndex++%phrases.length];
  notes.forEach((n,i)=>{const f=440*Math.pow(2,(n-69)/12),at=t+i*1.05;this.tone(this.music!,f,at,2.5,.095,'sine',i%2?.22:-.22);this.tone(this.music!,f*2,at,1.1,.01,'sine',i%2?.22:-.22)});
  this.tone(this.music,146.83,t,7.2,.048,'sine',-.12);this.tone(this.music,220,t,7.1,.019,'sine',.12);
 }
 cue(kind:'clue'|'talk'|'win'|'wrong'|'tip'='clue'){
  if(!this.active||this.hidden||!this.context||!this.effects)return;const t=this.context.currentTime;const notes=kind==='win'?[523.25,659.25,783.99,1046.5]:kind==='wrong'?[220,196]:kind==='talk'?[440,554.37]:kind==='tip'?[659.25,880]:[659.25,987.77];notes.forEach((f,i)=>this.tone(this.effects!,f,t+i*.11,.55,kind==='wrong'?.05:.08,'sine',0));
 }
 private stopVoices(){this.voices.forEach(o=>{try{o.stop()}catch{}});this.voices.clear()}
 pause(){this.active=false;this.clearTimers();this.stopVoices();if(this.context&&this.master){this.master.gain.cancelScheduledValues(this.context.currentTime);this.master.gain.setTargetAtTime(0,this.context.currentTime,.08);void this.context.suspend()}}
 visibility(hidden:boolean){this.hidden=hidden;this.clearTimers();if(!this.context||!this.active)return;if(hidden){this.stopVoices();void this.context.suspend()}else{const context=this.context;void context.resume().then(()=>{if(this.context!==context||!this.active||this.hidden||!this.master)return;this.master.gain.cancelScheduledValues(context.currentTime);this.master.gain.setTargetAtTime(.7,context.currentTime,.5);this.loops()}).catch(()=>{})}}
 async dispose(){this.active=false;this.clearTimers();this.stopVoices();this.sources.forEach(s=>{try{s.stop()}catch{}});this.sources=[];if(this.context){try{await this.context.close()}catch{}}this.context=null;this.brookLoading=null}
}
