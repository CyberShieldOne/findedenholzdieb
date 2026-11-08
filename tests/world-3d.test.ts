import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {NullEngine,Scene,FreeCamera,Vector3,HavokPlugin} from '@babylonjs/core';
import HavokPhysics from '@babylonjs/havok';
import {createWorldCollision,createWalker} from '../lib/world-physics.ts';
import {worldInteractions,spawn,restoreWorldPose,nearestInteraction} from '../lib/world-layout.ts';
import {evidence,witnesses} from '../lib/adventure.ts';

test('world placements cover every clue and witness; invalid poses recover safely',()=>{
 for(const e of [...evidence,...witnesses]){assert.ok(worldInteractions[e.id],e.id);assert.equal(nearestInteraction(worldInteractions[e.id]),e.id)}
 for(const raw of [null,'bad','{"revision":1,"x":null,"z":0}','{"revision":1,"x":12,"z":30}','{"revision":1,"x":-34,"z":-37}'])assert.deepEqual(restoreWorldPose(raw),spawn);
 assert.deepEqual(restoreWorldPose('{"revision":1,"x":-20,"z":-10}'),{x:-20,z:-10});
});

test('native Havok blocks buildings and river, crosses the bridge and reaches all five regions',async()=>{
 const bytes=readFileSync(new URL(import.meta.resolve('@babylonjs/havok/lib/esm/HavokPhysics.wasm')));
 const hk=await HavokPhysics({wasmBinary:bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength) as ArrayBuffer});
 const engine=new NullEngine(),scene=new Scene(engine);new FreeCamera('test',Vector3.Zero(),scene);scene.enablePhysics(new Vector3(0,-9.81,0),new HavokPlugin(true,hk));createWorldCollision(scene);
 const walker=createWalker(scene,spawn);
 const step=(x:number,z:number,n:number)=>{for(let i=0;i<n;i++){walker.step(1/60,new Vector3(x,0,z));scene.render()}return walker.controller.getPosition()};
 const walkTo=(x:number,z:number)=>{const tolerance=witnesses.some(w=>worldInteractions[w.id].x===x&&worldInteractions[w.id].z===z)?.85:.5;for(let i=0;i<5000;i++){const p=walker.controller.getPosition(),d=Math.hypot(p.x-x,p.z-z);if(d<tolerance)return;step((x-p.x)/d*3.15,(z-p.z)/d*3.15,1)}assert.fail(`unreachable ${x},${z}: ${walker.controller.getPosition()}`)};
 try{
  step(0,0,60);assert.ok(Math.abs(walker.controller.getPosition().y-1.1)<.25,'capsule settles on ground');
  const base=walker.controller.getPosition().y;walker.step(1/60,Vector3.Zero(),true);scene.render();let peak=base;for(let i=0;i<120;i++){step(0,0,1);peak=Math.max(peak,walker.controller.getPosition().y)}assert.ok(peak>base+.5,'jump rises under native collision control');assert.ok(Math.abs(walker.controller.getPosition().y-base)<.1,'gravity returns the character to its floor');
  walker.controller.setPosition(new Vector3(-34,1.2,-29));walker.controller.setVelocity(Vector3.Zero());const wall=step(0,-3.15,240);assert.ok(wall.z>-32.6,'building facade stops passage');
  walker.controller.setPosition(new Vector3(6,1.2,-15));walker.controller.setVelocity(Vector3.Zero());const river=step(3.15,0,240);assert.ok(river.x<9,'water cannot be crossed off the bridge');
  walker.controller.setPosition(new Vector3(spawn.x,1.2,spawn.z));walker.controller.setVelocity(Vector3.Zero());
  // Every interaction is visited along the authored connected road network.
  const route=[[-36,-28],[-29,-30],[-39,-29],[-23,-26],[-20,-16],[-18,3],[-37,14],[-42,16],[-49,16],[-49,13],[-37,13],[-37,16],[-18,3],[5,1],[3,1],[3,10],[7,10],[7,9],[3,10],[3,4],[22,4],[32,22],[29,29],[38,29],[43,26],[33,26],[32,22],[27,5],[43,-8],[49,-23],[49,-20],[62,-20],[62,-24]];
  const seen=new Set<string>();for(const [x,z]of route){walkTo(x,z);const p=walker.controller.getPosition();for(const [id,q]of Object.entries(worldInteractions))if(Math.hypot(p.x-q.x,p.z-q.z)<3.2)seen.add(id)}
  assert.equal(seen.size,15,'all twelve clues and three witnesses are within physical interaction reach');
  const final=walker.controller.getPosition();assert.ok(Math.hypot(final.x-62,final.z+24)<.6);
 }finally{walker.dispose();scene.dispose();engine.dispose()}
});
