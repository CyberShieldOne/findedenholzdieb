import {Engine,Scene,Vector3,Color3,Color4,ArcRotateCamera,HemisphericLight,DirectionalLight,ShadowGenerator,MeshBuilder,Mesh,TransformNode,PBRMaterial,StandardMaterial,DynamicTexture,VertexBuffer,Animation,AnimationGroup,DefaultRenderingPipeline,ImageProcessingConfiguration,PhysicsAggregate,PhysicsShapeType,HavokPlugin,type AbstractMesh} from '@babylonjs/core';
import HavokPhysics from '@babylonjs/havok';
import havokUrl from '@babylonjs/havok/lib/esm/HavokPhysics.wasm?url';
import {createWorldCollision,createWalker} from './world-physics';
import {buildings,regions,roads,timberPiles,crates,worldInteractions,terrainHeight,nearestRegion,nearestInteraction,type WorldPoint} from './world-layout';
import {evidence,witnesses,type Place} from './adventure';

export type WorldFrame={x:number;z:number;place:Place;nearby:string|null;fps:number};
export type WorldOptions={start:WorldPoint;paused:()=>boolean;onFrame:(f:WorldFrame)=>void;onInteract:(id:string)=>void;quality:'balanced'|'high'};

export async function mountOpenWorld(canvas:HTMLCanvasElement,options:WorldOptions){
 const hk=await HavokPhysics({locateFile:()=>havokUrl});
 const engine=new Engine(canvas,true,{preserveDrawingBuffer:true,stencil:true,powerPreference:'high-performance'});
 engine.setHardwareScalingLevel(1/Math.min(window.devicePixelRatio||1,options.quality==='high'?1.75:1.25));
 const scene=new Scene(engine);scene.clearColor=new Color4(.68,.77,.74,1);scene.fogMode=Scene.FOGMODE_EXP2;scene.fogDensity=.008;scene.fogColor=new Color3(.67,.76,.73);
 scene.enablePhysics(new Vector3(0,-9.81,0),new HavokPlugin(true,hk));scene.getPhysicsEngine()!.setTimeStep(1/60);
 const hemi=new HemisphericLight('sky fill',new Vector3(0,1,0),scene);hemi.intensity=.72;hemi.diffuse=Color3.FromHexString('#d5e4f1');hemi.groundColor=Color3.FromHexString('#6c7050');
 const sun=new DirectionalLight('late morning sun',new Vector3(-.6,-1,.45),scene);sun.position=new Vector3(45,75,-40);sun.intensity=2.5;sun.diffuse=Color3.FromHexString('#ffe3b6');sun.autoCalcShadowZBounds=true;sun.shadowMinZ=1;sun.shadowMaxZ=220;
 const shadow=new ShadowGenerator(options.quality==='high'?2048:1024,sun);shadow.usePercentageCloserFiltering=true;shadow.bias=.001;shadow.normalBias=.035;shadow.setDarkness(.18);
 const mat=(name:string,hex:string,roughness=.88)=>{const m=new PBRMaterial(name,scene);m.albedoColor=Color3.FromHexString(hex);m.roughness=roughness;m.metallic=0;return m};
 const timber=mat('warm oak','#725139'),bark=mat('bark','#6a4a32'),endgrain=mat('cut timber','#cea577'),roofmat=mat('slate green','#344b48'),stone=mat('limestone','#8e9686'),dark=mat('ironwork','#253c38',.52),cream=mat('plaster','#e3d5b6');
 const grain=new DynamicTexture('oak grain',{width:128,height:256},scene,false);const gc=grain.getContext() as CanvasRenderingContext2D;gc.fillStyle='#b0926e';gc.fillRect(0,0,128,256);for(let i=0;i<90;i++){gc.strokeStyle=i%3?'#9a7c59':'#c2a680';gc.lineWidth=.5;gc.beginPath();gc.moveTo(i*1.7,0);gc.bezierCurveTo(i*1.7+7,70,i*1.7-9,180,i*1.7,256);gc.stroke()}grain.update();timber.albedoTexture=grain;
 const cast=(m:AbstractMesh)=>{m.receiveShadows=true;shadow.addShadowCaster(m);return m};
 const box=(n:string,w:number,h:number,d:number,x:number,y:number,z:number,m:PBRMaterial|StandardMaterial,parent?:TransformNode)=>{const o=MeshBuilder.CreateBox(n,{width:w,height:h,depth:d},scene);o.position.set(x,y,z);o.material=m;if(parent)o.parent=parent;cast(o);return o};
 const cyl=(n:string,r:number,h:number,x:number,y:number,z:number,m:PBRMaterial,parent?:TransformNode)=>{const o=MeshBuilder.CreateCylinder(n,{diameter:r*2,height:h,tessellation:12},scene);o.position.set(x,y,z);o.material=m;if(parent)o.parent=parent;cast(o);return o};
 const collision=createWorldCollision(scene);collision.ground.receiveShadows=true;
 const groundMat=mat('meadow','#ffffff');collision.ground.useVertexColors=true;collision.ground.material=groundMat;
 const p=collision.ground.getVerticesData(VertexBuffer.PositionKind)!,colors:number[]=[];
 const segmentDistance=(x:number,z:number,a:WorldPoint,b:WorldPoint)=>{const dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a.x-dx*t,z-a.z-dz*t)};
 for(let i=0;i<p.length;i+=3){const x=p[i],z=p[i+2];let road=Infinity;for(const path of roads)for(let j=1;j<path.length;j++)road=Math.min(road,segmentDistance(x,z,path[j-1],path[j]));for(const r of regions)road=Math.min(road,Math.hypot(x-r.x,z-r.z)*.45);const tint=.93+Math.sin(x*3.1+z*4.3)*.055,blend=Math.max(0,Math.min(1,(road-2)/2));const c=Color3.Lerp(Color3.FromHexString('#b7a17b'),Color3.FromHexString('#718157'),blend).scale(tint);colors.push(c.r,c.g,c.b,1)}
 collision.ground.setVerticesData(VertexBuffer.ColorKind,colors);
 collision.bridge.material=timber;cast(collision.bridge);for(const m of scene.meshes.filter(m=>m.name==='bridge railing')){m.material=timber;cast(m)}
 const water=MeshBuilder.CreateGround('brook',{width:5.7,height:139},scene);water.position.set(12,-.12,0);const wm=mat('clear stream','#689c9c',.16);wm.alpha=.87;wm.metallic=.25;water.material=wm;
 // Narrow highlights follow the actual water surface rather than a flat backdrop.
 const ripples:Mesh[]=[];for(let i=0;i<32;i++){const r=MeshBuilder.CreateGround('water highlight',{width:.3+(i%3)*.35,height:1.1},scene);r.position.set(10+(i%5)*.85,-.105,-65+i*4.1);const rm=new StandardMaterial('ripple',scene);rm.diffuseColor=new Color3(.72,.86,.81);rm.emissiveColor=new Color3(.1,.16,.15);rm.alpha=.27;r.material=rm;r.isPickable=false;ripples.push(r)}
 buildings.forEach((b,index)=>{
  const wall=collision.walls[index];wall.material=mat(b.id+' plaster',b.color);cast(wall);
  box('foundation',b.width+.5,.45,b.depth+.5,b.x,.27,b.z,stone);
  for(const dx of [-b.width/2+.2,b.width/2-.2])for(const dz of [-b.depth/2+.12,b.depth/2-.12])box('oak upright',.32,b.height+.15,.35,b.x+dx,b.height/2+.2,b.z+dz,timber);
  for(const y of [1.1,3.1,b.height])box('crossbeam',b.width+.15,.2,b.depth+.1,b.x,y,b.z,timber);
  // Two pitched roof planes with ridge, eaves and individual standing seams.
  const pitch=.47,roofWidth=b.width/2+1.05,roofY=b.height+.6;
  for(const side of [-1,1]){const r=box('pitched roof',roofWidth,.24,b.depth+1.7,b.x+side*roofWidth*.44,roofY+roofWidth*.22,b.z,roofmat);r.rotation.z=-side*pitch;for(let k=0;k<9;k++){const rib=box('roof seam',roofWidth,.055,.055,b.x+side*roofWidth*.44,roofY+roofWidth*.22+.14,b.z-b.depth/2+k*b.depth/8,timber);rib.rotation.z=-side*pitch}}
  box('ridge',.22,.25,b.depth+1.9,b.x,roofY+roofWidth*.47,b.z,timber);
  box('chimney',.9,2.4,1,b.x+b.width*.25,b.height+1,b.z+1,stone);
  // All clues are staged outside; no false promise of enterable interiors.
  box('door',1.5,2.7,.12,b.x,b.height>5?1.6:1.55,b.z-b.depth/2-.08,timber);
  for(const dx of [-b.width*.3,b.width*.3]){box('window frame',1.75,1.8,.13,b.x+dx,2.6,b.z-b.depth/2-.1,timber);const glass=mat('warm window','#e3c58c',.22);glass.emissiveColor=new Color3(.2,.12,.035);box('window',1.45,1.5,.15,b.x+dx,2.6,b.z-b.depth/2-.13,glass);box('window mullion',.075,1.5,.18,b.x+dx,2.6,b.z-b.depth/2-.2,timber)}
  box('porch workbench',4,.18,1.3,b.x+3,1.1,b.z-b.depth/2-1.5,timber);
 });
 // Mill wheel, stacks of timber, crates, delivery cart: actual 3D props.
 const wheel=MeshBuilder.CreateTorus('mill wheel',{diameter:4.8,thickness:.22,tessellation:28},scene);wheel.rotation.z=Math.PI/2;wheel.position.set(29.6,2.7,36);wheel.material=timber;cast(wheel);
 const wheelRoot=new TransformNode('wheel rotation',scene);wheelRoot.position.copyFrom(wheel.position);wheel.parent=wheelRoot;wheel.position.setAll(0);
 for(let i=0;i<12;i++){const spoke=box('wheel spoke',.15,4.6,.15,0,0,0,timber,wheelRoot);spoke.rotation.x=i*Math.PI/6;box('wheel paddle',.8,.28,.65,0,Math.cos(i*Math.PI/6)*2.35,Math.sin(i*Math.PI/6)*2.35,timber,wheelRoot)}
 for(const {x:sx,z:sz}of timberPiles)for(let row=0;row<3;row++)for(let j=0;j<4-row;j++){const log=cyl('stacked log',.38,4,sx+j*.78+row*.4,.6+row*.65,sz,timber);log.rotation.x=Math.PI/2;const cap=cyl('end grain',.34,.035,log.position.x,log.position.y,sz-2.02,endgrain);cap.rotation.x=Math.PI/2;}
 for(const {x,z}of crates){box('crate',1.2,.9,.85,x,.65,z,timber);for(const dx of [-.5,.5])box('crate band',.08,.95,.9,x+dx,.65,z,dark)}
 const cart=new TransformNode('shared transporter',scene);cart.position.set(63,.2,-27);box('cart bed',2,.25,3.6,0,.9,0,timber,cart);for(const x of [-.95,.95])box('cart side',.13,.8,3.6,x,1.35,0,timber,cart);for(const x of [-1.1,1.1])for(const z of [-1.1,1.1]){const tire=cyl('wheel',.44,.22,x,.48,z,dark,cart);tire.rotation.z=Math.PI/2}
 // Instanced vegetation: shared meshes/materials, native distance LOD.
 const leafMats=['#5c7350','#78824c','#95904d','#aa9251'].map((hex,i)=>mat('canopy '+i,hex));
 const trunkSource=cyl('trunk source',.28,5,0,-100,0,bark);trunkSource.isVisible=false;trunkSource.addLODLevel(115,null);
 const crowns=leafMats.map((m,i)=>{const o=MeshBuilder.CreateSphere('canopy source '+i,{diameter:4.6,segments:7},scene);o.scaling.set(1,1.25,.92);o.position.y=-100;o.material=m;o.isVisible=false;o.addLODLevel(115,null);return o});
 let treeCount=0;for(let i=0;i<260;i++){const x=Math.sin(i*127.1+1)*73,z=Math.cos(i*311.7+3)*60;let avoid=Math.abs(x-12)<7;for(const r of regions)if(Math.hypot(x-r.x,z-r.z)<15)avoid=true;for(const path of roads)for(let j=1;j<path.length;j++)if(segmentDistance(x,z,path[j-1],path[j])<5)avoid=true;if(avoid)continue;const h=terrainHeight(x,z),scale=.85+(i%7)*.1;
  const t=trunkSource.createInstance('oak trunk');t.position.set(x,h+2.5*scale,z);t.scaling.set(scale,scale,scale);t.checkCollisions=true;cast(t);
  const phys=MeshBuilder.CreateCylinder('trunk collider',{diameter:.65*scale,height:5*scale,tessellation:6},scene);phys.position.copyFrom(t.position);phys.isVisible=false;phys.checkCollisions=true;new PhysicsAggregate(phys,PhysicsShapeType.CYLINDER,{mass:0},scene);
  const source=crowns[i%crowns.length];const crown=source.createInstance('oak crown');crown.position.set(x,h+5.5*scale,z);crown.scaling.set(scale,scale,scale);cast(crown);treeCount++;
 }
 const rockmat=mat('river stones','#858c79');for(let i=0;i<46;i++){const x=12+(i%2?-4.2:4.2),z=-60+i*2.6;if(z>-2&&z<10)continue;const r=MeshBuilder.CreateSphere('bank stone',{diameter:1,segments:5},scene);r.position.set(x,terrainHeight(x,z)+.12,z);r.scaling.set(1.3,.5,.8);r.material=rockmat;r.receiveShadows=true}
 const makePerson=(name:string,x:number,z:number,coatHex:string,isPlayer=false)=>{
  const root=new TransformNode(name,scene),coat=mat(name+' coat',coatHex),skin=mat(name+' skin','#c79d75'),boots=dark;
  root.position.set(x,terrainHeight(x,z),z);
  const torso=box('coat torso',.55,.65,.31,0,1.14,0,coat,root);const skirt=MeshBuilder.CreateCylinder('coat hem',{diameterTop:.5,diameterBottom:.72,height:.38,tessellation:8},scene);skirt.parent=root;skirt.position.y=.79;skirt.material=coat;cast(skirt);
  const head=MeshBuilder.CreateSphere('head',{diameter:.33,segments:10},scene);head.parent=root;head.position.set(0,1.65,0);head.material=skin;cast(head);
  cyl('hat crown',.19,.19,0,1.87,0,coat,root);cyl('hat brim',.29,.045,0,1.79,0,coat,root);
  box('collar',.37,.07,.35,0,1.48,0,endgrain,root);box('belt',.57,.05,.33,0,.91,0,boots,root);
  const limbs:TransformNode[]=[];
  for(const side of [-1,1]){const leg=new TransformNode('hip',scene);leg.parent=root;leg.position.set(side*.15,.78,0);box('trouser',.19,.56,.21,0,-.27,0,boots,leg);box('shoe',.22,.15,.38,0,-.64,.07,boots,leg);limbs.push(leg);}
  for(const side of [-1,1]){const arm=new TransformNode('shoulder',scene);arm.parent=root;arm.position.set(side*.34,1.42,0);const sleeve=box('sleeve',.19,.54,.22,0,-.26,0,coat,arm);box('hand',.15,.17,.16,0,-.58,0,skin,arm);limbs.push(arm);}
  const walk=new AnimationGroup(name+' stride',scene);limbs.forEach((limb,i)=>{const a=new Animation('swing','rotation.x',30,Animation.ANIMATIONTYPE_FLOAT,Animation.ANIMATIONLOOPMODE_CYCLE);const sign=i===0||i===3?1:-1;a.setKeys([{frame:0,value:0},{frame:8,value:sign*.5},{frame:16,value:0},{frame:24,value:-sign*.5},{frame:32,value:0}]);walk.addTargetedAnimation(a,limb)});walk.start(true);walk.pause();
  return{root,walk,torso,isPlayer};
 };
 const player=makePerson('detective',options.start.x,options.start.z,'#aa7c49',true);
 const npcColors=['#556f58','#96734f','#586b79'];witnesses.forEach((w,i)=>{const p=worldInteractions[w.id];const npc=makePerson(w.name,p.x,p.z,npcColors[i]);npc.root.rotation.y=Math.PI;});
 const markerMat=mat('clue brass','#dcaf63',.36);markerMat.emissiveColor=new Color3(.19,.1,.02);
 const markers:Mesh[]=[];for(const item of evidence){const p=worldInteractions[item.id];const marker=MeshBuilder.CreateTorus(item.name,{diameter:.55,thickness:.075,tessellation:16},scene);marker.position.set(p.x,terrainHeight(p.x,p.z)+1.6,p.z);marker.rotation.x=Math.PI/2;marker.material=markerMat;markers.push(marker);}
 const walker=createWalker(scene,options.start);
 const camera=new ArcRotateCamera('follow camera',-Math.PI/2-.5,1.09,10,new Vector3(options.start.x,1.3,options.start.z),scene);camera.lowerRadiusLimit=4;camera.upperRadiusLimit=21;camera.lowerBetaLimit=.35;camera.upperBetaLimit=1.35;camera.minZ=.15;camera.maxZ=200;camera.wheelDeltaPercentage=.015;camera.panningSensibility=0;camera.attachControl(canvas,true);camera.checkCollisions=true;camera.collisionRadius=new Vector3(.3,.3,.3);camera.inputs.removeByType('ArcRotateCameraKeyboardMoveInput');
 const pipeline=new DefaultRenderingPipeline('light finish',true,scene,[camera]);pipeline.fxaaEnabled=true;pipeline.samples=options.quality==='high'?4:1;pipeline.bloomEnabled=options.quality==='high';pipeline.bloomThreshold=1.3;pipeline.bloomWeight=.12;scene.imageProcessingConfiguration.toneMappingEnabled=true;scene.imageProcessingConfiguration.toneMappingType=ImageProcessingConfiguration.TONEMAPPING_ACES;scene.imageProcessingConfiguration.exposure=1.1;scene.imageProcessingConfiguration.contrast=1.12;
 const keys=new Set<string>();let jump=false,disposed=false,time=0,last=performance.now(),acc=0,frameAt=0,distance=0,nearby:string|null=null;
 const down=(e:KeyboardEvent)=>{if(/INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement)?.tagName)||options.paused())return;const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift',' '].includes(k)){e.preventDefault();keys.add(k);if(k===' '&&!e.repeat)jump=true}if(k==='e'&&!e.repeat&&nearby){e.preventDefault();options.onInteract(nearby);keys.clear()}};
 const up=(e:KeyboardEvent)=>keys.delete(e.key.toLowerCase()),blur=()=>{keys.clear();jump=false;acc=0;last=performance.now()};
 window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',blur);document.addEventListener('visibilitychange',blur);const resize=new ResizeObserver(()=>engine.resize());resize.observe(canvas);
 engine.runRenderLoop(()=>{
  if(disposed)return;const now=performance.now(),dt=Math.min(.08,(now-last)/1000);last=now;time+=dt;
  if(document.hidden){acc=0;return;}
  if(options.paused()){keys.clear();acc=0;}else{
   acc+=dt;const forward=camera.target.subtract(camera.position);forward.y=0;forward.normalize();const right=Vector3.Cross(Vector3.Up(),forward).normalize();const a=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),b=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0);const desired=forward.scale(b).add(right.scale(a));if(desired.lengthSquared()>0)desired.normalize().scaleInPlace(keys.has('shift')?5.2:3.15);
   let n=0;while(acc>=1/60&&n++<5){const prev=walker.controller.getPosition().clone(),pos=walker.step(1/60,desired,jump);jump=false;acc-=1/60;const moved=Math.hypot(pos.x-prev.x,pos.z-prev.z);distance+=moved;player.root.position.set(pos.x,pos.y-.9,pos.z);if(moved>.002)player.root.rotation.y=Math.atan2(pos.x-prev.x,pos.z-prev.z);}
  }
  player.walk.goToFrame(distance/1.9*32%32);const pos=player.root.position;camera.target.copyFrom(pos.add(new Vector3(0,1.3,0)));wheelRoot.rotation.x=time*.11;markers.forEach((m,i)=>{m.position.y=terrainHeight(m.position.x,m.position.z)+1.6+Math.sin(time*1.8+i)*.08;m.rotation.y=time*.3});ripples.forEach((r,i)=>{r.position.z=-65+((i*4.1+time*.45)%130)});
  nearby=nearestInteraction(pos);if(now-frameAt>150){frameAt=now;options.onFrame({x:pos.x,z:pos.z,place:nearestRegion(pos),nearby,fps:Math.round(engine.getFps())})}scene.render();
 });
 return{treeCount,interact(){if(nearby&&!options.paused())options.onInteract(nearby)},dispose(){disposed=true;engine.stopRenderLoop();resize.disconnect();window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',blur);walker.dispose();scene.dispose();engine.dispose()}};
}
