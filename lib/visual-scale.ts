import type {Place} from './adventure';

// Game art calibration, not a replacement renderer. Coordinates refer to the
// complete uncropped background. Heights are plausible art-direction estimates.
export const actorHeightMeters={detective:1.78,bruno:1.82,mia:1.70,theo:1.76} as const;
export type ActorId=keyof typeof actorHeightMeters;
export const sceneCalibration:Record<Place,{horizonY:number;reference:{name:string;topY:number;footY:number;heightMeters:number}}>={
 hof:{horizonY:28,reference:{name:'Werkstatttür am Hof',topY:26,footY:49,heightMeters:2.1}},
 werkstatt:{horizonY:25,reference:{name:'Vordere Werkbankkante bis Boden',topY:40,footY:58,heightMeters:.9}},
 bach:{horizonY:25,reference:{name:'Brückengeländer am nahen Ende',topY:33,footY:43,heightMeters:1.05}},
 muehle:{horizonY:27,reference:{name:'Tür rechts am Mühlengebäude',topY:34,footY:55,heightMeters:2.1}},
 lager:{horizonY:29,reference:{name:'Fahrerhaus des Hoftransporters',topY:36,footY:53,heightMeters:2.3}}
};

// Return percent of stage height, so native CSS scales actors and background
// together on resize. Both NPCs and player use the same ground-plane projection.
export function actorHeightPercent(place:Place,footY:number,actor:ActorId){
 const {horizonY,reference:r}=sceneCalibration[place];
 const depth=(footY-horizonY)/(r.footY-horizonY);
 return actorHeightMeters[actor]*(r.footY-r.topY)/r.heightMeters*Math.max(.05,depth);
}

// Alpha >= 128 bounds measured from the original sprite sheets (09.11.2026).
// Transparent margins must not change the perceived height or lift the feet.
const sideBounds=[[45,673],[51,675],[48,675],[40,675],[44,673],[56,675],[50,675],[44,672]] as const;
const depthBounds=[[5,435],[4,434],[5,436],[4,431],[2,432],[3,433],[2,432],[3,433]] as const;
export function detectiveFrameGeometry(sheet:'side'|'depth',column:number,row=0){
 const [top,bottom]=(sheet==='side'?sideBounds:depthBounds)[row*(sheet==='side'?8:4)+column];
 const frameHeight=sheet==='side'?724:443.5;
 const visibleFraction=(bottom-top)/frameHeight;
 const height=actorHeightMeters.detective/visibleFraction;
 return{height,width:height*(sheet==='side'?(2172/8)/724:1),footInset:(frameHeight-bottom)/frameHeight*height,
  canvasPercent:100/visibleFraction,bottomPercent:-(frameHeight-bottom)/(bottom-top)*100};
}
