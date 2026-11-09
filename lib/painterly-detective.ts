import {MeshBuilder,Mesh,StandardMaterial,Texture,Color3,Vector3,type Scene,type ShadowGenerator} from '@babylonjs/core';
import {detectiveAtlas} from './detective-atlas';
import {terrainHeight} from './world-layout';

export function createPainterlyDetective(scene:Scene,shadows:ShadowGenerator){
 const side=new Texture('/art/detective-walk.png',scene,false,true,Texture.TRILINEAR_SAMPLINGMODE);
 const depth=new Texture('/art/detective-depth-walk.png',scene,false,true,Texture.TRILINEAR_SAMPLINGMODE);
 for(const t of[side,depth]){t.hasAlpha=true;t.wrapU=Texture.CLAMP_ADDRESSMODE;t.wrapV=Texture.CLAMP_ADDRESSMODE;t.anisotropicFilteringLevel=4;}
 const material=new StandardMaterial('original painted detective',scene);material.diffuseTexture=depth;material.useAlphaFromDiffuseTexture=true;material.transparencyMode=StandardMaterial.MATERIAL_ALPHATEST;material.alphaCutOff=.45;material.backFaceCulling=false;material.specularColor=Color3.Black();material.emissiveColor=new Color3(.18,.16,.13);material.diffuseColor=new Color3(.9,.86,.78);
 const mesh=MeshBuilder.CreatePlane('Detektiv – originale Gehposen',{width:1,height:1},scene);mesh.billboardMode=Mesh.BILLBOARDMODE_Y;mesh.material=material;mesh.isPickable=false;mesh.receiveShadows=true;shadows.addShadowCaster(mesh);
 // A close, soft contact patch anchors the illustrated feet. The silhouette
 // additionally casts a native alpha-tested geometric shadow.
 const contact=MeshBuilder.CreateDisc('detective foot contact',{radius:.36,tessellation:32},scene);contact.rotation.x=Math.PI/2;contact.scaling.y=.65;const cm=new StandardMaterial('foot contact',scene);cm.diffuseColor=Color3.Black();cm.emissiveColor=Color3.Black();cm.alpha=.2;cm.disableLighting=true;cm.backFaceCulling=false;contact.material=cm;contact.isPickable=false;
 return{mesh,update(feet:Vector3,distance:number,heading:number,camera:Vector3){
  const a=detectiveAtlas(distance,heading,Math.atan2(camera.x-feet.x,camera.z-feet.z));
  const texture=a.sheet==='side'?side:depth;material.diffuseTexture=texture;
  texture.uScale=(a.flip?-1:1)/a.columns;texture.uOffset=(a.column+(a.flip?1:0))/a.columns;
  texture.vScale=1/a.rows;texture.vOffset=(a.rows-1-a.row)/a.rows;
  mesh.scaling.set(a.width,a.height,1);mesh.position.copyFrom(feet).addInPlaceFromFloats(0,a.height/2-a.footInset,0);
  const onBridge=feet.x>4.5&&feet.x<19.5&&feet.z>0&&feet.z<8;
  const groundY=onBridge?.2:terrainHeight(feet.x,feet.z);contact.position.set(feet.x,groundY+.018,feet.z);cm.alpha=.22*Math.max(0,1-Math.max(0,feet.y-groundY)/1.5);
 },dispose(){mesh.dispose();contact.dispose();material.dispose();cm.dispose();side.dispose();depth.dispose()}};
}
