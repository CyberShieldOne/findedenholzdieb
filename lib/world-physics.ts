import {MeshBuilder,VertexBuffer,VertexData,PhysicsAggregate,PhysicsShapeType,PhysicsCharacterController,CharacterSupportedState,Vector3,type Scene} from '@babylonjs/core';
import {buildings,terrainHeight,worldBounds,timberPiles,crates,type WorldPoint} from './world-layout.ts';
import {witnesses} from './adventure.ts';
import {worldInteractions} from './world-layout.ts';

export function createWorldCollision(scene:Scene){
 const ground=MeshBuilder.CreateGround('Falkenforst ground',{width:160,height:140,subdivisions:120,updatable:true},scene);
 const positions=ground.getVerticesData(VertexBuffer.PositionKind)!;
 for(let i=0;i<positions.length;i+=3)positions[i+1]=terrainHeight(positions[i],positions[i+2]);
 const normals:number[]=[];VertexData.ComputeNormals(positions,ground.getIndices()!,normals);
 ground.updateVerticesData(VertexBuffer.PositionKind,positions);ground.updateVerticesData(VertexBuffer.NormalKind,normals);ground.refreshBoundingInfo();ground.checkCollisions=true;
 new PhysicsAggregate(ground,PhysicsShapeType.MESH,{mass:0,friction:.8,restitution:0},scene);
 const box=(name:string,x:number,y:number,z:number,w:number,h:number,d:number,visible=false)=>{
  const m=MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);m.position.set(x,y,z);m.isVisible=visible;m.checkCollisions=true;m.isPickable=false;
  new PhysicsAggregate(m,PhysicsShapeType.BOX,{mass:0,friction:.8,restitution:0},scene);return m;
 };
 const walls=buildings.map(b=>box(b.id,b.x,b.height/2+.2,b.z,b.width,b.height,b.depth,true));
 for(const p of timberPiles)box('timber stack collider',p.x+1.15,1.1,p.z,3.8,1.8,4.2);
 for(const p of crates)box('crate collider',p.x,.65,p.z,1.2,.9,.85);
 box('transporter collider',63,1,-27,2.4,1.8,3.8);
 for(const w of witnesses){const p=worldInteractions[w.id];box('witness body',p.x,1.1,p.z,.6,1.8,.6);}
 // Water is not swimmable in this detective chapter. A real bridge is the
 // continuous crossing; the banks carry a matching native collision volume.
 box('river north',12,1,(-70-1)/2,6,5,69);
 box('river south',12,1,(9+70)/2,6,5,61);
 const bridge=box('bridge deck',12,.04,4,15,.32,8,true);
 for(const side of [-1,1])box('bridge railing',12,1,4+side*3.75,15,1.5,.22,true);
 for(const x of [worldBounds.minX,worldBounds.maxX])box('forest boundary',x,3,0,1,8,140);
 for(const z of [worldBounds.minZ,worldBounds.maxZ])box('forest boundary',0,3,z,160,8,1);
 return{ground,walls,bridge,box};
}

export function createWalker(scene:Scene,start:WorldPoint){
 const controller=new PhysicsCharacterController(new Vector3(start.x,Math.max(.2,terrainHeight(start.x,start.z))+.96,start.z),{capsuleHeight:1.8,capsuleRadius:.32},scene);
 controller.maxSlopeCosine=Math.cos(Math.PI/4);controller.maxAcceleration=12;controller.acceleration=.15;controller.maxStepHeight=.28;
 const gravity=new Vector3(0,-9.81,0),down=new Vector3(0,-1,0),up=Vector3.Up(),forward=Vector3.Forward();
 return{controller,step(dt:number,desired:Vector3,jump=false){
  const support=controller.checkSupport(dt,down),old=controller.getVelocity();
  let velocity:Vector3;
  if(support.supportedState===CharacterSupportedState.SUPPORTED){velocity=controller.calculateMovement(dt,forward,support.averageSurfaceNormal,old,support.averageSurfaceVelocity,desired,up);if(jump)velocity.y=4.2;}
  else{velocity=new Vector3(old.x+(desired.x-old.x)*Math.min(1,dt*4),old.y+gravity.y*dt,old.z+(desired.z-old.z)*Math.min(1,dt*4));}
  controller.setVelocity(velocity);controller.integrate(dt,support,gravity);return controller.getPosition();
 },dispose(){controller.dispose()}};
}
