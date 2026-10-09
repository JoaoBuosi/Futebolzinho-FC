export type CareerClub = { id:string; name:string; short:string; logo:number; ovr:number; color:string; country:string };
export type Fixture = { id:string; round:number; homeId:string; awayId:string; played:boolean; homeGoals:number|null; awayGoals:number|null };
export type TableRow = { clubId:string; played:number; wins:number; draws:number; losses:number; goalsFor:number; goalsAgainst:number; points:number };
export type CareerGameState = { season:number; currentRound:number; clubs:CareerClub[]; fixtures:Fixture[]; table:TableRow[]; lastUpdated:string };
const uid=()=>`fx-${Math.random().toString(36).slice(2,10)}`;
const shuffle=<T,>(items:T[])=>{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
export function createCareerGame(activeClub:CareerClub,availableClubs:CareerClub[],competitionId:string,season=2026):CareerGameState{
 const european=["champions","premier","laliga","seriea-it","bundesliga","ligue1"].includes(competitionId);
 const domesticBrazil=["br-a","br-b","br-c","br-d","paulista","carioca","mineiro","gaucho"].includes(competitionId);
 let pool=availableClubs.filter(c=>c.id!==activeClub.id&&(
  european?c.country!=="Brasil":domesticBrazil?c.country==="Brasil":c.country===activeClub.country
 ));
 if(!pool.some(c=>c.id===activeClub.id))pool.unshift(activeClub);
 const clubs=[activeClub,...shuffle(pool).slice(0,Math.min(7, pool.length))];
 if(clubs.length<4){for(const c of shuffle(availableClubs).filter(c=>!clubs.some(x=>x.id===c.id)).slice(0,7-clubs.length))clubs.push(c);}
 const rotating=[...clubs];if(rotating.length%2)rotating.push({id:"BYE",name:"Folga",short:"BYE",logo:0,ovr:0,color:"#777",country:""});
 const fixtures:Fixture[]=[];const n=rotating.length;let round=1;
 for(let r=0;r<n-1;r++){for(let i=0;i<n/2;i++){const a=rotating[i],b=rotating[n-1-i];if(a.id!=="BYE"&&b.id!=="BYE"){const home=(r+i)%2===0?a:b,away=home===a?b:a;fixtures.push({id:uid(),round,homeId:home.id,awayId:away.id,played:false,homeGoals:null,awayGoals:null});}}const fixed=rotating[0];const rest=rotating.slice(1);rest.unshift(rest.pop()!);rotating.splice(0,rotating.length,fixed,...rest);round++;}
 const firstLeg=fixtures.map(f=>({...f,id:uid(),round:f.round+round-1,homeId:f.awayId,awayId:f.homeId}));
 const all=[...fixtures,...firstLeg].sort((a,b)=>a.round-b.round);
 return {season,currentRound:1,clubs:clubs.filter(c=>c.id!=="BYE"),fixtures:all,table:clubs.filter(c=>c.id!=="BYE").map(c=>({clubId:c.id,played:0,wins:0,draws:0,losses:0,goalsFor:0,goalsAgainst:0,points:0})),lastUpdated:new Date().toISOString()};
}
export function simulateNextRound(state:CareerGameState):CareerGameState{
 const pending=state.fixtures.filter(f=>!f.played);
 if(!pending.length)return state;
 const round=Math.min(...pending.map(f=>f.round));
 const played=state.fixtures.map(f=>{if(f.round!==round||f.played)return f;const home=state.clubs.find(c=>c.id===f.homeId)!,away=state.clubs.find(c=>c.id===f.awayId)!;const hg=goals(home.ovr,away.ovr),ag=goals(away.ovr,home.ovr);return {...f,played:true,homeGoals:hg,awayGoals:ag};});
 const table:TableRow[]=state.clubs.map(c=>({clubId:c.id,played:0,wins:0,draws:0,losses:0,goalsFor:0,goalsAgainst:0,points:0}));
 for(const f of played.filter(x=>x.played)){const h=table.find(x=>x.clubId===f.homeId),a=table.find(x=>x.clubId===f.awayId);if(!h||!a||f.homeGoals===null||f.awayGoals===null)continue;h.played++;a.played++;h.goalsFor+=f.homeGoals;h.goalsAgainst+=f.awayGoals;a.goalsFor+=f.awayGoals;a.goalsAgainst+=f.homeGoals;if(f.homeGoals>f.awayGoals){h.wins++;h.points+=3;a.losses++;}else if(f.homeGoals<f.awayGoals){a.wins++;a.points+=3;h.losses++;}else{h.draws++;a.draws++;h.points++;a.points++;}}
 table.sort((a,b)=>b.points-a.points||(b.goalsFor-b.goalsAgainst)-(a.goalsFor-a.goalsAgainst)||b.goalsFor-a.goalsFor||a.clubId.localeCompare(b.clubId));
 const next=played.filter(f=>!f.played).reduce((min,f)=>Math.min(min,f.round),Infinity);
 return {...state,fixtures:played,currentRound:Number.isFinite(next)?next:round+1,table,lastUpdated:new Date().toISOString()};
}
function goals(forOvr:number,againstOvr:number){const expected=Math.max(.15,Math.min(2.6,.95+(forOvr-againstOvr)*.045));let g=0;for(let i=0;i<5;i++)if(Math.random()<expected/5)g++;return g;}
export function nextRoundFixtures(state:CareerGameState){return state.fixtures.filter(f=>!f.played&&f.round===state.currentRound);}
export function careerClubName(state:CareerGameState,id:string){return state.clubs.find(c=>c.id===id)?.name??"Clube desconhecido";}
