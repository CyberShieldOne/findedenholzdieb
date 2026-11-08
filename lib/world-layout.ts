import type {Place} from './adventure';

// Authored detective-world content, in metres. Rendering and native physics read
// the same placements; this is level design, not a custom streaming/physics engine.
export const WORLD_REVISION=1;
export type WorldPoint={x:number;z:number};
export const spawn:WorldPoint={x:-26,z:-18};
export const worldBounds={minX:-76,maxX:76,minZ:-62,maxZ:62};
export const regions:{id:Place;name:string;x:number;z:number}[]=[
 {id:'hof',name:'Gottliebs Holzhof',x:-30,z:-27},
 {id:'werkstatt',name:'Mias Werkstatt',x:-40,z:15},
 {id:'bach',name:'Die Bachbrücke',x:12,z:4},
 {id:'muehle',name:'Die alte Mühle',x:33,z:26},
 {id:'lager',name:'Das Außenlager',x:54,z:-24}
];
export const buildings=[
 {id:'hof',x:-34,z:-37,width:15,depth:9,height:5.2,color:'#ddd0ae'},
 {id:'werkstatt',x:-45,z:23,width:13,depth:10,height:4.5,color:'#cdb899'},
 {id:'muehle',x:36,z:36,width:12,depth:10,height:6.1,color:'#d9cbb2'},
 {id:'lager',x:57,z:-36,width:17,depth:10,height:4.3,color:'#87957b'}
] as const;
export const roads:WorldPoint[][]=[
 [{x:-31,z:-27},{x:-20,z:-16},{x:-18,z:3},{x:-37,z:14}],
 [{x:-18,z:3},{x:2,z:4},{x:22,z:4},{x:32,z:22}],
 [{x:27,z:5},{x:43,z:-8},{x:53,z:-25}]
];
export const timberPiles=[{x:-44,z:-27},{x:-21,z:-35},{x:47,z:-33},{x:51,z:-25}];
export const crates=[{x:-29,z:-29},{x:-40,z:16},{x:29,z:30.5},{x:58,z:-25}];
export const worldInteractions:Record<string,WorldPoint>={
 band:{x:-36,z:-28},zettel:{x:-29,z:-30},schluessel:{x:-39,z:-29},bruno:{x:-23,z:-26},
 vorlage:{x:-42,z:16},spende:{x:-49,z:16},mia:{x:-37,z:16},
 profil:{x:5,z:1},sperre:{x:7,z:9},
 waage:{x:29,z:29},uhr:{x:38,z:29},rad:{x:43,z:26},theo:{x:33,z:26},
 ladung:{x:49,z:-23},fahrzeug:{x:62,z:-24}
};
export function terrainHeight(x:number,z:number){
 const river=Math.exp(-Math.pow((x-12)/3.4,4));
 const edge=Math.max(0,(Math.max(Math.abs(x)/70,Math.abs(z)/55)-.68)/.32);
 return .2-river*2.6+edge*edge*(2.5+Math.sin(x*.12)*Math.cos(z*.16)*1.7);
}
export function nearestRegion(p:WorldPoint):Place{return regions.reduce((a,b)=>Math.hypot(p.x-a.x,p.z-a.z)<Math.hypot(p.x-b.x,p.z-b.z)?a:b).id}
export function nearestInteraction(p:WorldPoint,radius=3.2){let id:string|null=null,best=radius;for(const [key,q]of Object.entries(worldInteractions)){const d=Math.hypot(p.x-q.x,p.z-q.z);if(d<best){best=d;id=key}}return id}
export function restoreWorldPose(raw:string|null):WorldPoint{try{const p=JSON.parse(raw||'null');if(p?.revision===WORLD_REVISION&&Number.isFinite(p.x)&&Number.isFinite(p.z)&&p.x>worldBounds.minX+1&&p.x<worldBounds.maxX-1&&p.z>worldBounds.minZ+1&&p.z<worldBounds.maxZ-1&&!buildings.some(b=>Math.abs(p.x-b.x)<b.width/2+.5&&Math.abs(p.z-b.z)<b.depth/2+.5)&&(Math.abs(p.x-12)>4||(p.z>1&&p.z<7)))return{x:p.x,z:p.z};}catch{}return{...spawn}}
