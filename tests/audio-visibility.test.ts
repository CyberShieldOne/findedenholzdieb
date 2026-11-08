import {test} from 'node:test';
import assert from 'node:assert/strict';
import {WoodlandAudio,defaultSound} from '../lib/woodland-audio.ts';

function deferred(){let resolve!:()=>void;const promise=new Promise<void>(r=>{resolve=r});return{promise,resolve}}

for(const delayedPhase of ['download','decode'] as const){
 test(`returning after a hidden ${delayedPhase} restores audible output without another toggle`,async t=>{
  t.mock.timers.enable({apis:['setTimeout']});
  const entered=deferred(),release=deferred();
  class Param{value=0;setTargetAtTime(value:number){this.value=value;return this}cancelScheduledValues(){return this}}
  class AudioNode{gain=new Param();pan=new Param();threshold=new Param();knee=new Param();ratio=new Param();buffer:unknown;loop=false;connect(n:unknown){return n}start(){}stop(){}}
  let context!:Context;
  class Context{
   currentTime=0;destination=new AudioNode();gains:AudioNode[]=[];state='suspended';resumeGate:Promise<void>|null=null;
   constructor(){context=this}
   createGain(){const node=new AudioNode();this.gains.push(node);return node}
   createDynamicsCompressor(){return new AudioNode()}
   createBufferSource(){return new AudioNode()}
   createStereoPanner(){return new AudioNode()}
   async decodeAudioData(){if(delayedPhase==='decode'){entered.resolve();await release.promise}return{duration:44}}
   async resume(){if(this.resumeGate)await this.resumeGate;this.state='running'}
   async suspend(){this.state='suspended'}
   async close(){this.state='closed'}
  }
  const originalAudio=Object.getOwnPropertyDescriptor(globalThis,'AudioContext'),originalDocument=Object.getOwnPropertyDescriptor(globalThis,'document');
  Object.defineProperty(globalThis,'AudioContext',{value:Context,writable:true,configurable:true});
  Object.defineProperty(globalThis,'document',{value:{hidden:false},configurable:true});
  t.mock.method(globalThis,'fetch',async()=>{if(delayedPhase==='download'){entered.resolve();await release.promise}return new Response(new Uint8Array([1,2]))});
  const audio=new WoodlandAudio();
  try{
   const starting=audio.start(defaultSound);
   await entered.promise;
   audio.visibility(true);
   release.resolve();await starting;
   const master=context.gains[0].gain;
   assert.equal(master.value,0,'startup completed in the background must remain muted');
   audio.visibility(false);await Promise.resolve();
   assert.equal(context.state,'running');
   assert.equal(master.value,.7,'visible playback must restore the master output gain');
   const resumed=deferred();context.resumeGate=resumed.promise;
   audio.visibility(false);audio.pause();resumed.resolve();await Promise.resolve();await Promise.resolve();
   assert.equal(master.value,0,'a pending resume must not override a newer user pause');
   audio.visibility(false);await Promise.resolve();
   assert.equal(master.value,0,'a user pause must not be undone by visibility changes');
  }finally{
   await audio.dispose();
   if(originalAudio)Object.defineProperty(globalThis,'AudioContext',originalAudio);else Reflect.deleteProperty(globalThis,'AudioContext');
   if(originalDocument)Object.defineProperty(globalThis,'document',originalDocument);else Reflect.deleteProperty(globalThis,'document');
  }
 });
}
