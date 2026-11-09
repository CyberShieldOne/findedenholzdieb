import {MeshBuilder,Mesh,VertexBuffer,VertexData,Vector3,Quaternion,Matrix,Color3,Texture,DynamicTexture,PBRMaterial,StandardMaterial,PhysicsAggregate,PhysicsShapeType,PointLight,type Scene,type ShadowGenerator,type AbstractMesh} from '@babylonjs/core';
import {buildings,regions,worldInteractions,terrainHeight} from './world-layout';
import {forestTrees,roadDistance} from './scenery-layout';

export function landscapeMaterials(scene:Scene){
 const make=(name:string,hex:string,rough=.9)=>{const m=new PBRMaterial(name,scene);m.albedoColor=Color3.FromHexString(hex);m.roughness=rough;m.metallic=0;return m};
 const texture=(name:string,size:number,paint:(c:CanvasRenderingContext2D)=>void)=>{const t=new DynamicTexture(name,{width:size,height:size},scene,true,Texture.TRILINEAR_SAMPLINGMODE);paint(t.getContext() as CanvasRenderingContext2D);t.update();t.anisotropicFilteringLevel=4;return t};
 const ground=make('fine-grained forest floor','#ffffff');ground.albedoTexture=texture('earth, pebbles and leaf litter',512,c=>{c.fillStyle='#b9b5a0';c.fillRect(0,0,512,512);for(let i=0;i<11500;i++){const x=(i*73.133)%512,y=(i*137.761)%512;c.fillStyle=['#d4cbb1','#9d9d85','#777d66','#c6bfa7'][i%4];c.globalAlpha=.18+(i%5)*.07;c.beginPath();c.ellipse(x,y,.6+i%4,.4+(i%3),i%6,0,Math.PI*2);c.fill()}c.globalAlpha=1});(ground.albedoTexture as Texture).uScale=64;(ground.albedoTexture as Texture).vScale=56;
 const oak=make('weathered ochre oak','#94704b');oak.albedoTexture=texture('oak fibrous grain',512,c=>{c.fillStyle='#b79a70';c.fillRect(0,0,512,512);for(let i=0;i<260;i++){c.strokeStyle=i%4?'#8e704d':'#d3b98b';c.globalAlpha=.3;c.lineWidth=.5+i%3;c.beginPath();c.moveTo(i*2,0);c.bezierCurveTo(i*2+8,170,i*2-7,320,i*2,512);c.stroke()}for(let i=0;i<7;i++){c.strokeStyle='#755435';c.lineWidth=1;c.beginPath();c.ellipse(i*79%512,i*137%512,8,26,.1,0,Math.PI*2);c.stroke()}c.globalAlpha=1});
 const stone=make('moss-stained sandstone','#b7b09a');stone.albedoTexture=texture('irregular stone courses',512,c=>{c.fillStyle='#6b6c5b';c.fillRect(0,0,512,512);for(let row=0;row<8;row++)for(let col=-1;col<6;col++){const x=col*104+(row%2)*52,y=row*64;c.fillStyle=['#aca68d','#c6bda1','#969a81','#b5b197'][(row*7+col+8)%4];c.beginPath();c.roundRect(x+3,y+3,99,59,8);c.fill();c.strokeStyle='#d5c8a261';c.lineWidth=2;c.stroke();for(let j=0;j<24;j++){c.fillStyle='#66744b33';c.fillRect(x+(j*31)%96,y+(j*17)%56,2,2)}}});
 const plaster=make('warm lime plaster','#e4d3ad');plaster.albedoTexture=texture('lime plaster speckle',256,c=>{c.fillStyle='#d5c7aa';c.fillRect(0,0,256,256);for(let i=0;i<2500;i++){c.fillStyle=i%2?'#f1e1bc33':'#8c856a22';c.fillRect((i*37.3)%256,(i*59.7)%256,1+i%3,1+i%2)}});
 const roof=make('aged terracotta tiles','#aa7050');roof.albedoTexture=texture('overlapping terracotta tiles',512,c=>{c.fillStyle='#593f30';c.fillRect(0,0,512,512);for(let row=0;row<12;row++)for(let col=-1;col<10;col++){const x=col*57+(row%2)*28,y=row*43;c.fillStyle=['#9c6349','#b07855','#80543e','#b88b63'][(row+col+10)%4];c.beginPath();c.roundRect(x+1,y+1,54,46,[2,2,10,10]);c.fill();c.strokeStyle='#d0a47b55';c.lineWidth=1;c.stroke()}});(roof.albedoTexture as Texture).uScale=4;(roof.albedoTexture as Texture).vScale=3;
 const foliage=['#536a36','#758141','#9c9847','#b0a04d'].map((hex,i)=>make('sunlit oak leaves '+i,hex));
 const flower=make('ivory hydrangea','#e1d8a9'),petal=make('foxglove flowers','#a47b9a'),iron=make('aged iron','#3a493e',.48);
 return{ground,oak,stone,plaster,roof,foliage,flower,petal,iron};
}

export function dressLandscape(scene:Scene,ground:Mesh,shadows:ShadowGenerator,quality:'balanced'|'high',materials:ReturnType<typeof landscapeMaterials>){
 const {oak,stone,plaster,roof,foliage,flower,petal,iron}=materials;
 const cast=(m:AbstractMesh)=>{m.receiveShadows=true;shadows.addShadowCaster(m);return m};
 const box=(n:string,w:number,h:number,d:number,x:number,y:number,z:number,mat:PBRMaterial)=>{const m=MeshBuilder.CreateBox(n,{width:w,height:h,depth:d},scene);m.position.set(x,y,z);m.material=mat;cast(m);return m};
 // Re-material the existing collision-backed buildings and timber structures.
 for(const m of scene.meshes){if(m.name==='pitched roof')m.material=roof;else if(['foundation','chimney','bank stone'].includes(m.name))m.material=stone;else if(['pitched roof','roof seam','ridge','oak upright','crossbeam','door','window frame','window mullion','porch workbench','bridge deck','bridge railing','stacked log','crate','wheel spoke','wheel paddle','mill wheel','cart side','cart bed'].includes(m.name))m.material=oak;}
 for(const b of buildings){const wall=scene.getMeshByName(b.id);if(wall){const m=plaster.clone(b.id+' weathered plaster')!;m.albedoColor=Color3.FromHexString(b.color);wall.material=m;}
  const front=b.z-b.depth/2-.18;
  for(let j=0;j<5;j++){const x=b.x-b.width*.43+j*b.width*.215;box('facade upright',.18,b.height,.2,x,b.height/2+.2,front,oak);if(j<4){const brace=box('diagonal half timber',b.width*.21,.15,.2,x+b.width*.1,b.height*.57,front-.02,oak);brace.rotation.z=j%2?.62:-.62;}}
  // Gable triangles close the roof, instead of showing an open wedge.
  for(const side of [-1,1]){const g=MeshBuilder.CreateDisc('gable face',{radius:1,tessellation:3},scene);g.scaling.set(b.width*.58,b.width*.28,1);g.rotation.z=Math.PI/2;g.position.set(b.x,b.height+.7,b.z+side*(b.depth/2+.03));g.material=plaster;g.material.backFaceCulling=false;cast(g);}
  for(const dx of [-b.width*.3,b.width*.3]){
   const x=b.x+dx;for(const side of [-1,1]){const shutter=box('sage shutter',.42,1.85,.13,x+side*1.15,2.6,front-.07,oak);shutter.rotation.y=side*.2;}
   box('window flower box',1.8,.28,.48,x,1.55,front-.28,oak);
  }
  // Warm lanterns are emissive geometry; only two nearby fill lights are used.
  for(const dx of [-1.3,1.3]){box('lantern iron',.27,.46,.27,b.x+dx,2.45,front-.3,iron);const lightMat=plaster.clone('lantern glow')!;lightMat.emissiveColor=new Color3(.65,.34,.08);box('lantern glass',.18,.32,.29,b.x+dx,2.45,front-.31,lightMat)}
  // Mossy masonry along the lower wall, with shared geometry instancing below.
  for(let i=0;i<Math.ceil(b.width/1.2);i++)box('stone footing',1.1,.45,.25,b.x-b.width/2+.6+i*1.15,.55,front,stone);
 }
 // Native hardware instancing keeps close foliage detailed without thousands
 // of separate draw calls. Batch by 24m cells for useful visibility bounds.
 const matrices=new Map<string,{mesh:Mesh;values:Matrix[]}>();
 const batch=(kind:string,source:Mesh,x:number,y:number,z:number,scale:Vector3,rotation=0)=>{
  const key=kind+':'+Math.floor(x/24)+':'+Math.floor(z/24);let b=matrices.get(key);if(!b){const m=source.clone(key)!;m.position.setAll(0);m.isVisible=true;m.makeGeometryUnique();b={mesh:m,values:[]};matrices.set(key,b);}b.values.push(Matrix.Compose(scale,Quaternion.FromEulerAngles(0,rotation,0),new Vector3(x,y,z)));
 };
 const trunk=MeshBuilder.CreateCylinder('oak trunk prototype',{height:5,diameterTop:.25,diameterBottom:.75,tessellation:12},scene);trunk.material=oak;trunk.isVisible=false;
 const crowns=foliage.map((mat,i)=>{const m=MeshBuilder.CreateSphere('leafy crown prototype '+i,{diameter:3.4,segments:12},scene);const positions=m.getVerticesData(VertexBuffer.PositionKind)!;for(let k=0;k<positions.length;k+=3){const f=1+.12*Math.sin(positions[k]*7+positions[k+1]*9+positions[k+2]*5);positions[k]*=f;positions[k+1]*=f;positions[k+2]*=f}const normals:number[]=[];VertexData.ComputeNormals(positions,m.getIndices()!,normals);m.setVerticesData(VertexBuffer.PositionKind,positions);m.setVerticesData(VertexBuffer.NormalKind,normals);m.material=mat;m.isVisible=false;return m});
 const trees=forestTrees();for(let i=0;i<trees.length;i++){const t=trees[i],y=terrainHeight(t.x,t.z);batch('trunk',trunk,t.x,y+2.5*t.scale,t.z,new Vector3(t.scale,t.scale,t.scale));

  for(let j=0;j<6;j++){const angle=j*2.399+i*.7,r=j?1.3*t.scale:0;batch('crown'+t.variant,crowns[t.variant],t.x+Math.cos(angle)*r,y+(j?5:6.2)*t.scale,t.z+Math.sin(angle)*r,new Vector3(t.scale*(j?1:.9),t.scale*(j?.82:1),t.scale),angle);}
 }
 // Ferns, grass tufts and flower clumps, omitted on paths and near clue feet.
 const fern=MeshBuilder.CreateSphere('fern prototype',{diameter:1,segments:8},scene);fern.scaling.set(1,.24,1);fern.bakeCurrentTransformIntoVertices();fern.material=foliage[0];fern.isVisible=false;
 const grass=MeshBuilder.CreateCylinder('grass tuft prototype',{height:.45,diameterTop:0,diameterBottom:.25,tessellation:5},scene);grass.material=foliage[1];grass.isVisible=false;
 const blossom=MeshBuilder.CreateSphere('blossom prototype',{diameter:.18,segments:6},scene);blossom.material=flower;blossom.isVisible=false;
 const violet=blossom.clone('foxglove prototype')!;violet.material=petal;violet.isVisible=false;
 const count=quality==='high'?4400:2300;for(let i=0;i<count;i++){const x=Math.sin(i*57.73)*74,z=Math.cos(i*19.11+2)*60,d=roadDistance(x,z);if(Math.abs(x-12)<3.9||d<2.2||Object.values(worldInteractions).some(p=>Math.hypot(x-p.x,z-p.z)<1.4)||buildings.some(b=>Math.abs(x-b.x)<b.width/2+1&&Math.abs(z-b.z)<b.depth/2+1))continue;const h=terrainHeight(x,z),s=.5+(i%8)*.08;if(i%6===0){batch('fern',fern,x,h+.1,z,new Vector3(s,s,s),i);for(let j=0;j<4;j++)batch('flower',i%12?violet:blossom,x+Math.sin(j*2)*.18,h+.32+j*.09,z+Math.cos(j*2)*.18,new Vector3(s,s,s))}else batch('grass',grass,x,h+.16,z,new Vector3(s,s,s),i)}
 for(const b of buildings)for(const dx of [-b.width*.3,b.width*.3])for(let i=0;i<14;i++){const x=b.x+dx+Math.sin(i*2.3)*.7,z=b.z-b.depth/2-.45;batch('flower-box',i%3?blossom:violet,x,1.88+Math.cos(i)*.1,z,new Vector3(1.3,1.3,1.3));}
 for(const {mesh,values}of matrices.values()){const buffer=new Float32Array(values.length*16);values.forEach((m,i)=>m.copyToArray(buffer,i*16));mesh.thinInstanceSetBuffer('matrix',buffer,16,true);mesh.thinInstanceRefreshBoundingInfo();mesh.receiveShadows=true;if(mesh.name.startsWith('trunk')||mesh.name.startsWith('crown'))shadows.addShadowCaster(mesh);}
 // Planked bridge, uneven visible bank stones and leafy river margins.
 for(let i=0;i<25;i++)box('bridge plank seam',.025,.018,7.3,4.55+i*.62,.214,4,iron);
 for(const z of [.35,7.65])for(let i=0;i<8;i++)box('bridge post',.18,1.25,.18,4.7+i*2.05,.8,z,oak);
 // Distant landscape is real geometry outside the playable boundary.
 const hills=foliage[0].clone('distant blue green hills')!;hills.albedoColor=Color3.FromHexString('#68817b');for(let i=0;i<11;i++){const h=MeshBuilder.CreateSphere('distant wooded hill',{diameter:1,segments:12},scene);h.scaling.set(35+i%3*12,15+i%4*7,30);h.position.set(-150+i*29,5,115+Math.sin(i)*18);h.material=hills;}
 const village=plaster.clone('distant village')!;village.albedoColor=Color3.FromHexString('#aeb09b');for(let i=0;i<9;i++){const x=-15+i*4.5,z=100+Math.sin(i*4)*5;box('distant village house',3,4+i%3,4,x,2,z,village)}box('church tower',3,15,3,3,7.5,102,stone);const steeple=MeshBuilder.CreateCylinder('church steeple',{height:8,diameterTop:0,diameterBottom:5,tessellation:4},scene);steeple.position.set(3,19,102);steeple.material=roof;
 for(let i=0;i<4;i++){box('distant castle tower',4,11,4,-37+i*8,20,147,stone);if(i<3)box('castle curtain wall',8,6,2,-33+i*8,18,147,stone)}
 return{trees:trees.length,batches:matrices.size};
}
