import {detectiveFrameGeometry} from './visual-scale.ts';
// View selection is game presentation logic; Babylon supplies the billboard,
// alpha-tested material, texture sampling, depth and shadow rendering.
export function detectiveAtlas(distance:number,heading:number,cameraAzimuth:number){
 const delta=Math.atan2(Math.sin(heading-cameraAzimuth),Math.cos(heading-cameraAzimuth));
 const phase=Math.floor(Math.max(0,distance)/.21)%8;
 const cosine=Math.cos(delta);
 if(cosine>.62||cosine<-.62){
  return{sheet:'depth' as const,column:Math.floor(phase/2),row:cosine>.62?0:1,columns:4,rows:2,...detectiveFrameGeometry('depth',Math.floor(phase/2),cosine>.62?0:1),flip:false};
 }
 return{sheet:'side' as const,column:phase,row:0,columns:8,rows:1,...detectiveFrameGeometry('side',phase),flip:Math.sin(delta)<0};
}
