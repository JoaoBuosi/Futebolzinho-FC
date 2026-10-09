export type CareerClub = { id:string; name:string; short:string; logo:string; ovr:number; color:string; country:string };
export type Fixture = { id:string; round:number; homeId:string; awayId:string; played:boolean; homeGoals:number|null; awayGoals:number|null };
export type TableRow = { clubId:string; played:number; wins:number; draws:number; losses:number; goalsFor:number; goalsAgainst:number; points:number };
export type CareerGameState = { season:number; currentRound:number; clubs:CareerClub[]; fixtures:Fixture[]; table:TableRow[]; lastUpdated:string };
const uid=()=>`gm-${Math.random().toString(36).slice(2,10)}`;
const shuffle=<T,>(items:T[])=>{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
export function createCareerGame(activeClub:CareerClub,availableClubs:CareerClub[],competitionId:string,season=2026):CareerGameState{
 const pool=availableClubs.filter(c=>c.id!==activeClub.id&&c.country===activeClub.country);
 const clubs=[activeClub,...shuffle(pool).slice(0,Math.min(29,pool.length))];
 const rotating=[...clubs];if(rotating.length%2)rotating.push({id:"BYE",name:"Folga",short:"BYE",logo:"",ovr:0,color:"#777",country:""});
 const fixtures:Fixture[]=[];const n=rotating.length;let round=1;
 for(let r=0;r<n-1;r++){for(let i=0;i<n/2;i++){const a=rotating[i],b=rotating[n-1-i];if(a.id!=="BYE"&&b.id!=="BYE"){const home=(r+i)%2===0?a:b,away=home===a?b:a;fixtures.push({id:uid(),round,homeId:home.id,awayId:away.id,played:false,homeGoals:null,awayGoals:null});}}const fixed=rotating[0];const rest=rotating.slice(1);rest.unshift(rest.pop()!);rotating.splice(0,rotating.length,fixed,...rest);round++;}
 const firstLeg=fixtures.map(f=>({...f,id:uid(),round:f.round+round-1,homeId:f.awayId,awayId:f.homeId}));
 const all=[...fixtures,...firstLeg].sort((a,b)=>a.round-b.round);
 return {season,currentRound:1,clubs,fixtures:all,table:clubs.map(c=>({clubId:c.id,played:0,wins:0,draws:0,losses:0,goalsFor:0,goalsAgainst:0,points:0})),lastUpdated:new Date().toISOString()};
}
export function simulateNextRound(state:CareerGameState):CareerGameState{
 const pending=state.fixtures.filter(f=>!f.played);if(!pending.length)return state;
 const round=Math.min(...pending.map(f=>f.round));
 const played=state.fixtures.map(f=>{if(f.round!==round||f.played)return f;const home=state.clubs.find(c=>c.id===f.homeId)!,away=state.clubs.find(c=>c.id===f.awayId)!;const [hg,ag]=score(home.ovr,away.ovr);return {...f,played:true,homeGoals:hg,awayGoals:ag};});
 const table:TableRow[]=state.clubs.map(c=>({clubId:c.id,played:0,wins:0,draws:0,losses:0,goalsFor:0,goalsAgainst:0,points:0}));
 for(const f of played.filter(x=>x.played)){const h=table.find(x=>x.clubId===f.homeId),a=table.find(x=>x.clubId===f.awayId);if(!h||!a||f.homeGoals===null||f.awayGoals===null)continue;h.played++;a.played++;h.goalsFor+=f.homeGoals;h.goalsAgainst+=f.awayGoals;a.goalsFor+=f.awayGoals;a.goalsAgainst+=f.homeGoals;if(f.homeGoals>f.awayGoals){h.wins++;h.points++;a.losses++;}else if(f.homeGoals<f.awayGoals){a.wins++;a.points++;h.losses++;}}
 table.sort((a,b)=>b.wins-a.wins||(b.goalsFor-b.goalsAgainst)-(a.goalsFor-a.goalsAgainst)||b.goalsFor-a.goalsFor||a.clubId.localeCompare(b.clubId));
 const next=played.filter(f=>!f.played).reduce((min,f)=>Math.min(min,f.round),Infinity);
 return {...state,fixtures:played,currentRound:Number.isFinite(next)?next:round+1,table,lastUpdated:new Date().toISOString()};
}
function score(forOvr:number,againstOvr:number):[number,number]{
 const pace=97+Math.random()*17;
 const edge=(forOvr-againstOvr)*0.72+(Math.random()-0.5)*18;
 let home=Math.round(pace+edge/2+(Math.random()-0.5)*22);
 let away=Math.round(pace-edge/2+(Math.random()-0.5)*22);
 home=Math.max(78,Math.min(145,home));away=Math.max(78,Math.min(145,away));
 if(home===away){if(Math.random()>.5)home++;else away++;}
 return [home,away];
}
export function nextRoundFixtures(state:CareerGameState){return state.fixtures.filter(f=>!f.played&&f.round===state.currentRound);}
export function careerClubName(state:CareerGameState,id:string){return state.clubs.find(c=>c.id===id)?.name??"Franquia desconhecida";}
