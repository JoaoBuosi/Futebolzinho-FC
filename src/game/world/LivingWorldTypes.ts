export type ClubTier="elite"|"first_division"|"second_division"|"third_division"|"state";
export type PlayerStatus="active"|"retired";
export interface WorldClub{ id:string; name:string; countryId:string; competitionId:string; tier:ClubTier; reputation:number; budget:number; wageBudget:number; squadPlayerIds:string[]; }
export interface WorldPlayer{ id:string; name:string; age:number; clubId:string|null; position:string; overall:number; potential:number; marketValue:number; wage:number; contractUntil:number; morale:number; form:number; fitness:number; status:PlayerStatus; generated:boolean; }
export interface WorldCompetition{ id:string; name:string; countryId:string; level:number; clubIds:string[]; promotedClubIds:string[]; relegatedClubIds:string[]; championClubId:string|null; }
export interface WorldTransfer{ id:string; season:number; playerId:string; fromClubId:string|null; toClubId:string; fee:number; wage:number; date:string; }
export interface WorldRetirement{ id:string; season:number; playerId:string; date:string; reason:string; }
export interface WorldYouthPlayer{ id:string; playerId:string; clubId:string; season:number; generated:true; }
export interface LivingWorldData{clubs:Record<string,WorldClub>;players:Record<string,WorldPlayer>;competitions:Record<string,WorldCompetition>;transfers:WorldTransfer[];retirements:WorldRetirement[];youth:WorldYouthPlayer[];}
