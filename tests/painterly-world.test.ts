import {test} from 'node:test';
import assert from 'node:assert/strict';
import {detectiveAtlas} from '../lib/detective-atlas.ts';
import {forestTrees,clearForTree,roadDistance} from '../lib/scenery-layout.ts';
import {worldInteractions,terrainHeight} from '../lib/world-layout.ts';

test('detective atlas follows camera-relative heading, repeats gait and keeps UVs in the original sheets',()=>{
 assert.equal(detectiveAtlas(0,0,0).row,0,'camera in front uses front poses');
 assert.equal(detectiveAtlas(0,0,Math.PI).row,1,'camera behind uses back poses');
 assert.equal(detectiveAtlas(0,0,Math.PI/2).sheet,'side');
 assert.notEqual(detectiveAtlas(0,0,Math.PI/2).flip,detectiveAtlas(0,0,-Math.PI/2).flip);
 for(let phase=0;phase<8;phase++){const a=detectiveAtlas(phase*.21+.001,0,Math.PI/2);assert.equal(a.column,phase);assert.equal(a.rows,1);assert.ok(a.column<a.columns)}
 assert.deepEqual(detectiveAtlas(0,1,2),detectiveAtlas(.21*8+.001,1,2),'one full stride repeats its first pose');
});

test('denser forest is deterministic and keeps roads, building fronts and interactions clear',()=>{
 const trees=forestTrees();assert.deepEqual(forestTrees(),trees);assert.ok(trees.length>70);
 for(const tree of trees){assert.ok(clearForTree(tree.x,tree.z));assert.ok(roadDistance(tree.x,tree.z)>5);for(const p of Object.values(worldInteractions))assert.ok(Math.hypot(tree.x-p.x,tree.z-p.z)>5)}
 for(const p of Object.values(worldInteractions))assert.ok(Math.abs(terrainHeight(p.x,p.z)-.2)<.08,'clue staging remains level');
});
