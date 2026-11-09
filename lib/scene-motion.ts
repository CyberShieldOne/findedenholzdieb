import Matter from 'matter-js';
import type {Place} from './adventure';
export type Point={x:number;y:number};
export const ground:Record<Place,Point[]>={
 hof:[{x:12,y:59},{x:83,y:54},{x:93,y:88},{x:8,y:88}],
 werkstatt:[{x:13,y:62},{x:85,y:58},{x:92,y:88},{x:8,y:88}],
 bach:[{x:30,y:61},{x:70,y:61},{x:87,y:88},{x:13,y:88}],
 muehle:[{x:11,y:60},{x:83,y:57},{x:92,y:88},{x:8,y:88}],
 lager:[{x:14,y:58},{x:85,y:57},{x:93,y:88},{x:7,y:88}]
};
// Projective ground plane: X and depth in metres, screen footpoint in percent.
export const perspective=(y:number)=>Math.max(.2,(y-30)/65);
export function toWorld(p:Point):Point{const k=perspective(p.y);return {x:(p.x-50)/(7*k)*100,y:8*(1/k-1)*100}}
export function toScreen(p:Point):Point{const k=1/(1+p.y/800);return{x:50+p.x/100*7*k,y:30+65*k}}
export function walkTarget(place:Place,p:Point):Point{const poly=ground[place];if(Matter.Vertices.contains(Matter.Vertices.create(poly,{} as Matter.Body),p))return p;let best=poly[0],dist=Infinity;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy)));const q={x:a.x+t*dx,y:a.y+t*dy},d=Math.hypot(q.x-p.x,q.y-p.y);if(d<dist){dist=d;best=q}}// inset towards the centroid so a capsule can settle without pushing the boundary
const center=poly.reduce((v,q)=>({x:v.x+q.x/poly.length,y:v.y+q.y/poly.length}),{x:0,y:0});return{x:best.x+(center.x-best.x)*.035,y:best.y+(center.y-best.y)*.035}}
export const lighting:Record<Place,{dx:number;dy:number;opacity:number;warmth:number}>={hof:{dx:-22,dy:11,opacity:.25,warmth:1},werkstatt:{dx:-31,dy:8,opacity:.3,warmth:1.1},bach:{dx:-14,dy:8,opacity:.18,warmth:.9},muehle:{dx:-23,dy:9,opacity:.23,warmth:1},lager:{dx:24,dy:10,opacity:.28,warmth:1.05}};
export function createSceneMotion(place:Place,start:Point){const engine=Matter.Engine.create({gravity:{x:0,y:0,scale:0}});const q=toWorld(walkTarget(place,start));const body=Matter.Bodies.circle(q.x,q.y,8,{friction:0,frictionAir:.13,restitution:0,inertia:Infinity});const polygon=ground[place].map(toWorld);const walls=polygon.map((a,i)=>{const b=polygon[(i+1)%polygon.length];return Matter.Bodies.rectangle((a.x+b.x)/2,(a.y+b.y)/2,Math.hypot(a.x-b.x,a.y-b.y)+15,10,{isStatic:true,angle:Math.atan2(b.y-a.y,b.x-a.x),friction:0,restitution:0})});Matter.Composite.add(engine.world,[...walls,body]);let travelled=0,heading=1,direction="side";return{step(target:Point|null,axis:Point){let desired={x:0,y:0};if(target){const w=toWorld(walkTarget(place,target)),dx=w.x-body.position.x,dy=w.y-body.position.y,d=Math.hypot(dx,dy);if(d>3){const speed=Math.min(2.6,Math.sqrt(2*.24*d));desired={x:dx/d*speed,y:dy/d*speed}}}else{const n=Math.hypot(axis.x,axis.y);if(n){desired={x:axis.x/n*2.6,y:-axis.y/n*2.6}}}
const prev={...body.position},velocity=Matter.Body.getVelocity(body),dx=desired.x-velocity.x,dy=desired.y-velocity.y,d=Math.hypot(dx,dy),limit=.24;Matter.Body.setVelocity(body,{x:velocity.x+dx*(d>limit?limit/d:1),y:velocity.y+dy*(d>limit?limit/d:1)});Matter.Engine.update(engine,1000/60);const meters=Math.hypot(body.position.x-prev.x,body.position.y-prev.y)/100;travelled+=meters;if(Math.hypot(body.velocity.x,body.velocity.y)>.1)direction=Math.abs(body.velocity.y)>Math.abs(body.velocity.x)*.8?(body.velocity.y>0?"back":"front"):"side";if(Math.abs(body.velocity.x)>.15)heading=body.velocity.x<0?-1:1;return{point:toScreen(body.position),speed:meters*60,distance:travelled,heading,direction,frame:Math.floor(travelled/.15)%8};},destroy(){Matter.Engine.clear(engine);Matter.Composite.clear(engine.world,false)}}}
