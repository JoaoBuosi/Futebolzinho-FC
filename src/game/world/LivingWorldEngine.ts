import type { SeasonState } from "./SeasonState";
import type { WorldState } from "./WorldState";
import type { LivingWorldData, WorldPlayer, WorldTransfer } from "./LivingWorldTypes";

const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const uid=()=>crypto.randomUUID();

export interface SeasonAdvanceReport{season:number;nextSeason:number;retired:number;youth:number;transfers:number;promoted:number;relegated:number;}

export class LivingWorldEngine{
 constructor(private world:WorldState,private season:SeasonState,private data:LivingWorldData){}
 getSnapshot(){return {world:this.world,season:this.season,data:this.data};}

 private retirePlayers():number{
  let count=0;
  for(const player of Object.values(this.data.players)){
   if(player.status!=="active"||player.age<35) continue;
   const retirementChance=player.age>=39?0.72:player.age>=37?0.42:0.16;
   if(Math.random()<retirementChance){
    player.status="retired"; player.clubId=null;
    this.data.retirements.push({id:uid(),season:this.world.currentSeason,playerId:player.id,date:this.world.currentDate,reason:player.age>=39?"idade":"decisão de carreira"});
    count++;
   }
  }
  return count;
 }

 private developPlayers(){
  for(const player of Object.values(this.data.players)){
   if(player.status!=="active") continue;
   const growth=player.age<=22?0.8:player.age<=25?0.35:player.age>=31?-0.3:-0.05;
   player.overall=clamp(Number((player.overall+growth+(Math.random()-.5)*0.5).toFixed(1)),40,99);
   player.marketValue=Math.max(10000,Math.round(player.marketValue*(1+(player.overall-70)/500)));
   player.form=clamp(player.form+(Math.random()-.5)*8,0,100);
   player.fitness=clamp(72+Math.random()*28,0,100);
   player.morale=clamp(player.morale+(Math.random()-.5)*6,0,100);
  }
 }

 private generateYouth():number{
  let count=0;
  for(const club of Object.values(this.data.clubs)){
   const shouldGenerate=Math.random()<0.75;
   if(!shouldGenerate) continue;
   const id=uid();
   const player:WorldPlayer={id,name:"Jogador da base #"+id.slice(0,4).toUpperCase(),age:16+Math.floor(Math.random()*3),clubId:club.id,position:["GK","CB","FB","CM","AM","WG","ST"][Math.floor(Math.random()*7)],overall:52+Math.floor(Math.random()*14),potential:70+Math.floor(Math.random()*30),marketValue:50000+Math.floor(Math.random()*250000),wage:500+Math.floor(Math.random()*1500),contractUntil:this.world.currentSeason+3,morale:75,form:70,fitness:95,status:"active",generated:true};
   this.data.players[id]=player; club.squadPlayerIds.push(id); this.world.generatedPlayerIds.push(id); this.world.playerIds.push(id);
   this.data.youth.push({id:uid(),playerId:id,clubId:club.id,season:this.world.currentSeason+1,generated:true}); count++;
  }
  return count;
 }

 private runTransfers():number{
  let count=0;
  for(const player of Object.values(this.data.players)){
   if(player.status!=="active"||!player.clubId||player.age>28||player.overall<70) continue;
   if(Math.random()>0.12) continue;
   const current=this.data.clubs[player.clubId];
   const candidates=Object.values(this.data.clubs).filter(c=>c.id!==current.id&&c.countryId===current.countryId&&c.budget>player.marketValue*0.8);
   const target=candidates[Math.floor(Math.random()*candidates.length)];
   if(!target) continue;
   const fee=Math.round(player.marketValue*(0.85+Math.random()*0.5));
   if(target.budget<fee) continue;
   current.budget+=fee; target.budget-=fee;
   current.squadPlayerIds=current.squadPlayerIds.filter(id=>id!==player.id); target.squadPlayerIds.push(player.id);
   player.clubId=target.id; player.wage=Math.max(player.wage,Math.round(target.wageBudget/Math.max(1,target.squadPlayerIds.length)*0.7)); player.contractUntil=this.world.currentSeason+3;
   const transfer:WorldTransfer={id:uid(),season:this.world.currentSeason,playerId:player.id,fromClubId:current.id,toClubId:target.id,fee,wage:player.wage,date:this.world.currentDate};
   this.data.transfers.push(transfer); this.world.transferIds.push(transfer.id); count++;
  }
  return count;
 }

 private updateCompetitions(){
  for(const competition of Object.values(this.data.competitions)){
   const clubs=competition.clubIds.map(id=>this.data.clubs[id]).filter(Boolean);
   if(!clubs.length) continue;
   const ranked=[...clubs].sort((a,b)=>(b.reputation+Math.random()*10)-(a.reputation+Math.random()*10));
   competition.championClubId=ranked[0]?.id??null;
   competition.relegatedClubIds=competition.level>1?ranked.slice(-2).map(c=>c.id):[];
   competition.promotedClubIds=competition.level>1?ranked.slice(0,2).map(c=>c.id):[];
  }
 }

 advanceSeason():SeasonAdvanceReport{
  const season=this.world.currentSeason;
  this.world={...this.world,phase:"season_end",lastUpdated:new Date().toISOString(),version:this.world.version+1};
  this.updateCompetitions();
  const retired=this.retirePlayers();
  this.developPlayers();
  const transfers=this.runTransfers();
  const youth=this.generateYouth();
  const promoted=Object.values(this.data.competitions).reduce((n,c)=>n+c.promotedClubIds.length,0);
  const relegated=Object.values(this.data.competitions).reduce((n,c)=>n+c.relegatedClubIds.length,0);
  const nextSeason=season+1;
  this.world={...this.world,currentSeason:nextSeason,phase:"preseason",lastUpdated:new Date().toISOString(),version:this.world.version+1};
  this.season={...this.season,season:nextSeason,phase:"preseason",startDate:nextSeason+"-01-01",endDate:nextSeason+"-12-31",transferWindowOpen:true,generatedPlayers:youth,retiredPlayers:retired,transfersCompleted:transfers,promotedClubIds:Object.values(this.data.competitions).flatMap(c=>c.promotedClubIds),relegatedClubIds:Object.values(this.data.competitions).flatMap(c=>c.relegatedClubIds)};
  return {season,nextSeason,retired,youth,transfers,promoted,relegated};
 }
}
