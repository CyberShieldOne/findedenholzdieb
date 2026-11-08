export const CLUES = [
  { id:'stapel', name:'Die Lücke im Holzstapel', label:'Holzstapel', x:51,y:44, text:'Sechs Bündel Buche fehlen. Die hellen Stellen auf dem Boden sind frisch. Das Holz wurde heute Morgen abgeholt – nicht gestern, wie es auf dem Abholschein steht.',note:'Sechs Bündel Buche · heute Morgen verschwunden' },
  { id:'reifen', name:'Spuren im Hof', label:'Fahrspuren', x:52,y:77,text:'Breite Reifenabdrücke führen zum Tor. In der Kurve laufen Vorder- und Hinterradspuren leicht versetzt, teilweise übereinander: Die starre Hinterachse schneidet die Kurve innen. Ein zweiachsiges Kraftfahrzeug war unterwegs, kein schmales Lastenrad. Allein verrät die Spur keinen Täter.',note:'Breite Reifen · überlagerte Spuren in der Kurve' },
  { id:'stoff', name:'Der orange Schal',label:'Baumstumpf',x:17,y:75,text:'Ein orangefarbener Schal hängt am Baumstumpf. Im Saum steht „B. Forst“. Bruno trägt ihn häufig. Er könnte ihn allerdings auch schon früher hier vergessen haben.',note:'Orangefarbener Schal · Initialen B. Forst' },
  { id:'schein',name:'Ein merkwürdiger Abholschein',label:'Werkstatt',x:25,y:48,text:'Auf der Werkbank liegt eine Kopie: „6 Bündel Buche · Abholung gestern · B. Forst“. Auf Gottliebs gestrigem Bestandsfoto sind aber noch alle sechs Bündel da. Der Schein ist falsch datiert.',note:'Abholschein B. Forst · Datum widerspricht Bestand' },
  { id:'kamera',name:'Die Wildkamera am Tor',label:'Hoftor',x:84,y:35,text:'Die gespeicherte Aufnahme von 06:18 Uhr zeigt Bruno am Steuer seines grünen Transporters. Auf der Ladefläche: sechs Bündel Buche. Das passt nicht zu seinem Alibi am Hochsitz.',note:'06:18 Uhr · Bruno fährt sechs Bündel vom Hof' },
  { id:'quittung',name:'Ein belegtes Alibi',label:'Lieferkorb',x:37,y:53,text:'Im Lieferkorb steckt Mias Rechnung: 06:10–06:30 Uhr, Reparatur beim Dorfcafé. Die Wirtin bestätigt den Zeitraum. Auf der Café-Aufnahme von 06:18 Uhr ist auch Theo mit seinem Lastenrad zu sehen.',note:'Café-Aufnahme · Mia und Theo um 06:18 Uhr dort' },
] as const;
export const SUSPECTS = [
  {id:'bruno',name:'Bruno Forst',job:'Der Waldarbeiter',statement:'„Ich war seit sechs am Hochsitz. Am Holzhof? Heute noch nicht!“',details:'Fährt einen grünen Transporter. Trägt oft einen orangefarbenen Schal.',answer:'„Der Abholschein? Den habe ich gestern ausgefüllt. Mein Schal liegt doch ständig irgendwo herum.“'},
  {id:'mia',name:'Mia Spahn',job:'Die Tischlerin',statement:'„Ich war früh im Dorfcafé. Die wackeligen Tische reparieren sich nicht von allein.“',details:'Arbeitet gern mit Buche. War heute mit Werkzeug im Dorf unterwegs.',answer:'„Frag die Wirtin. Meine Rechnung liegt im Lieferkorb auf dem Hof.“'},
  {id:'theo',name:'Theo Funke',job:'Der Tüftler',statement:'„Ich war mit meinem Elektro-Lastenrad im Café. Sechs Bündel? Das wäre selbst mir zu viel.“',details:'Baut Holzspielzeug. Sein Lastenrad hat schmale Straßenreifen.',answer:'„Mia war auch da. Wir sind auf der Café-Kamera zu sehen. Mein Rad stand vor dem Fenster.“'},
] as const;
export type GameState={found:string[];interviewed:string[];hints:number;mistakes:number;solved:boolean;best:number;badges:string[]};
export const freshGame=():GameState=>({found:[],interviewed:[],hints:0,mistakes:0,solved:false,best:0,badges:[]});
export const score=(s:GameState)=>Math.max(0,s.found.length*100+s.interviewed.length*50+(s.solved?250:0)-s.hints*50-s.mistakes*100);
export const canAccuse=(s:GameState)=>!s.solved&&s.found.includes('kamera')&&s.found.includes('schein')&&s.interviewed.length===3;
export function collect(s:GameState,id:string):GameState{return s.solved||s.found.includes(id)||!CLUES.some(c=>c.id===id)?s:{...s,found:[...s.found,id]};}
export function interview(s:GameState,id:string):GameState{return s.solved||s.interviewed.includes(id)||!SUSPECTS.some(p=>p.id===id)?s:{...s,interviewed:[...s.interviewed,id]};}
export function accuse(s:GameState,id:string):GameState{
 if(!canAccuse(s)||!SUSPECTS.some(p=>p.id===id))return s;
 if(id!=='bruno')return{...s,mistakes:s.mistakes+1};
 const n={...s,solved:true};return{...n,best:Math.max(s.best,score(n)),badges:[...new Set([...s.badges,'Spürnase',...(s.found.length===6?['Adlerauge']:[]),...(s.hints===0&&s.mistakes===0?['Meisterdetektiv']:[])])]};
}
export function restore(raw:string|null):GameState{
 try{const a=JSON.parse(raw||'null');if(!a||typeof a!=='object')return freshGame();
 const uniq=(v:unknown,valid:readonly string[]):string[]=>Array.isArray(v)?[...new Set(v.filter(x=>typeof x==='string'&&valid.includes(x)))]:[];
 const num=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.floor(v)):0;
 const found=uniq(a.found,CLUES.map(c=>c.id)),interviewed=uniq(a.interviewed,SUSPECTS.map(p=>p.id));
 return{found,interviewed,hints:num(a.hints),mistakes:num(a.mistakes),solved:a.solved===true&&found.includes('kamera')&&found.includes('schein')&&interviewed.length===3,best:num(a.best),badges:uniq(a.badges,['Spürnase','Adlerauge','Meisterdetektiv'])};
 }catch{return freshGame();}
}
