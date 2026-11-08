// View selection is game presentation logic; Babylon supplies the billboard,
// alpha-tested material, texture sampling, depth and shadow rendering.
export function detectiveAtlas(distance:number,heading:number,cameraAzimuth:number){
 const delta=Math.atan2(Math.sin(heading-cameraAzimuth),Math.cos(heading-cameraAzimuth));
 const phase=Math.floor(Math.max(0,distance)/.21)%8;
 const cosine=Math.cos(delta);
 if(cosine>.62||cosine<-.62){
  return{sheet:'depth' as const,column:Math.floor(phase/2),row:cosine>.62?0:1,columns:4,rows:2,width:2.12,height:2.12,flip:false};
 }
 return{sheet:'side' as const,column:phase,row:0,columns:8,rows:1,width:2.12*(2172/8)/724,height:2.12,flip:Math.sin(delta)<0};
}
