import {roads,regions,buildings,worldInteractions,worldRoadDistance,type WorldPoint} from './world-layout.ts';
export function segmentDistance(x:number,z:number,a:WorldPoint,b:WorldPoint){const dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a.x-dx*t,z-a.z-dz*t)}
export const roadDistance=worldRoadDistance;
export function clearForTree(x:number,z:number){return Math.abs(x-12)>7&&roadDistance(x,z)>5.2&&regions.every(r=>Math.hypot(x-r.x,z-r.z)>14)&&Object.values(worldInteractions).every(p=>Math.hypot(x-p.x,z-p.z)>5)&&buildings.every(b=>Math.abs(x-b.x)>b.width/2+4||Math.abs(z-b.z)>b.depth/2+4)}
export function forestTrees(){const result:{x:number;z:number;scale:number;variant:number}[]=[];for(let i=0;i<380;i++){const x=Math.sin(i*127.1+1)*73,z=Math.cos(i*311.7+3)*60;if(clearForTree(x,z))result.push({x,z,scale:.85+(i%7)*.1,variant:i%4})}return result}
