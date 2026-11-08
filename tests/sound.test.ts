import {test} from 'node:test';
import assert from 'node:assert/strict';
import {WoodlandAudio,defaultSound,safeSound} from '../lib/woodland-audio.ts';

test('mixer handles corrupt settings and clamps volumes without mutating defaults',()=>{
 assert.deepEqual(safeSound(null),defaultSound);assert.deepEqual(safeSound({ambience:-20,music:150,effects:NaN}),{ambience:0,music:100,effects:45});assert.deepEqual(safeSound({ambience:'loud',music:0,effects:25}),{ambience:24,music:0,effects:25});assert.equal(defaultSound.music,18);
});

test('audio starts only on request, reuses its context, stops when hidden and disposes cleanly',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});
 class Param{value=0;setValueAtTime(){return this}exponentialRampToValueAtTime(){return this}setTargetAtTime(){return this}cancelScheduledValues(){return this}}
 let started=0,stopped=0,created=0,closed=0,fetches=0,noiseBuffers=0;
 class Node{gain=new Param();frequency=new Param();pan=new Param();threshold=new Param();knee=new Param();ratio=new Param();buffer:unknown;loop=false;type='';onended:(()=>void)|null=null;connect(n:unknown){return n}disconnect(){}start(){started++}stop(){stopped++}}
 const contexts:Context[]=[];
 class Context{sampleRate=100;currentTime=0;destination=new Node();state='suspended';constructor(){created++;contexts.push(this)}createGain(){return new Node()}createDynamicsCompressor(){return new Node()}createBufferSource(){return new Node()}createBiquadFilter(){return new Node()}createStereoPanner(){return new Node()}createOscillator(){return new Node()}createBuffer(ch:number,n:number){noiseBuffers++;const a=Array.from({length:ch},()=>new Float32Array(n));return{getChannelData:(i:number)=>a[i]}}async decodeAudioData(){return{duration:44}}async resume(){this.state='running'}async suspend(){this.state='suspended'}async close(){this.state='closed';closed++}}
 const oldAudio=globalThis.AudioContext,oldDocument=globalThis.document,oldFetch=globalThis.fetch;
 globalThis.fetch=async(input)=>{assert.equal(input,'/audio/kleiner-bach.mp3');fetches++;return new Response(new Uint8Array([0,1,2,3]))};
 Object.defineProperty(globalThis,'AudioContext',{value:Context,configurable:true,writable:true});Object.defineProperty(globalThis,'document',{value:{hidden:false},configurable:true,writable:true});
 try{
  const audio=new WoodlandAudio();assert.equal(created,0);audio.cue('clue');assert.equal(started,0);
  await audio.start(defaultSound);assert.equal(created,1);assert.equal(contexts[0].state,'running');
  t.mock.timers.tick(4000);assert.ok(started>4,'melody and wildlife add sound sources');
  audio.cue('win');const beforeStop=started;audio.pause();assert.equal(contexts[0].state,'suspended');t.mock.timers.tick(60000);assert.equal(started,beforeStop,'muted audio cannot enqueue fresh voices');
  await audio.start({...defaultSound,music:0});assert.equal(created,1,'toggles reuse a single native context');assert.equal(fetches,1,'brook recording is decoded once and reused');assert.equal(noiseBuffers,0,'continuous synthetic noise beds must not return');
  audio.visibility(true);assert.equal(contexts[0].state,'suspended');const hiddenStart=started;t.mock.timers.tick(90000);assert.equal(started,hiddenStart);
  audio.visibility(false);await Promise.resolve();assert.equal(contexts[0].state,'running');
  await audio.dispose();assert.equal(closed,1);assert.equal(contexts[0].state,'closed');assert.ok(stopped>=1,'brook playback source is stopped');const final=started;t.mock.timers.tick(90000);assert.equal(started,final);
 }finally{globalThis.fetch=oldFetch;Object.defineProperty(globalThis,'AudioContext',{value:oldAudio,configurable:true,writable:true});Object.defineProperty(globalThis,'document',{value:oldDocument,configurable:true,writable:true})}
});
