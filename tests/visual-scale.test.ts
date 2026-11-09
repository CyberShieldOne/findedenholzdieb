import {test} from 'node:test';
import assert from 'node:assert/strict';
import {actorHeightPercent,actorHeightMeters,sceneCalibration,detectiveFrameGeometry} from '../lib/visual-scale.ts';
import {detectiveAtlas} from '../lib/detective-atlas.ts';

test('each scene ties people to a named reference rather than fixed viewport pixels',()=>{
 for(const place of Object.keys(sceneCalibration) as (keyof typeof sceneCalibration)[]){
  const {reference:r}=sceneCalibration[place];const h=actorHeightPercent(place,r.footY,'mia');
  assert.ok(Math.abs(h/(r.footY-r.topY)-actorHeightMeters.mia/r.heightMeters)<1e-10);
  const a=actorHeightPercent(place,67,'mia'),b=actorHeightPercent(place,67,'bruno');
  assert.ok(Math.abs(a/b-actorHeightMeters.mia/actorHeightMeters.bruno)<1e-10);
  assert.ok(actorHeightPercent(place,83,'detective')>actorHeightPercent(place,60,'detective'));
 }
 assert.ok(actorHeightPercent('werkstatt',67,'mia')>40,'workshop people no longer miniature');
});

test('all gait frames retain metric height and foot anchoring after transparent margin compensation',()=>{
 for(const sheet of ['side','depth'] as const)for(let row=0;row<(sheet==='depth'?2:1);row++)for(let col=0;col<(sheet==='side'?8:4);col++){
  const f=detectiveFrameGeometry(sheet,col,row);
  assert.ok(Math.abs(f.height/(f.canvasPercent/100)-1.78)<1e-10);
  assert.ok(f.footInset>=0&&f.footInset<.2);assert.ok(f.width>0);
 }
 // A camera heading selects an image, never an arbitrary world scale.
 for(const camera of [0,Math.PI/2,Math.PI,-Math.PI/2]){
  const a=detectiveAtlas(.1,0,camera);assert.ok(a.height>1.78&&a.height<2.1);
 }
});
