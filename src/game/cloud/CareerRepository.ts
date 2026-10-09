import type { SupabaseClient } from "@supabase/supabase-js";
import type { CareerGameState } from "../career/CareerEngine";

export type StoredClub = { id:string; name:string; short:string; logo:number; ovr:number; color:string; country:string };
export type StoredCareer = { id:string; name:string; club:StoredClub; competition:string; season:number; code:string; game?:CareerGameState };

type CareerRow = {
  id:string; name:string; club_id:string; club_data:StoredClub; competition_id:string;
  season:number; invite_code:string; game_state:CareerGameState; created_at:string; updated_at:string;
};

function toCareer(row: CareerRow): StoredCareer {
  return { id:row.id, name:row.name, club:row.club_data, competition:row.competition_id,
    season:row.season, code:row.invite_code, game:row.game_state };
}

export async function loadMyCareers(client: SupabaseClient): Promise<StoredCareer[]> {
  const {data,error}=await client.from("game_careers")
    .select("id,name,club_id,club_data,competition_id,season,invite_code,game_state,created_at,updated_at")
    .order("updated_at",{ascending:false});
  if(error) throw error;
  return ((data??[]) as CareerRow[]).map(toCareer);
}

export async function saveCareer(client: SupabaseClient, career: StoredCareer, ownerId: string): Promise<void> {
  const row={id:career.id,owner_id:ownerId,name:career.name,club_id:career.club.id,
    club_data:career.club,competition_id:career.competition,season:career.season,
    invite_code:career.code,game_state:career.game,updated_at:new Date().toISOString()};
  const {error}=await client.from("game_careers").upsert(row,{onConflict:"id"});
  if(error) throw error;
}

export async function joinCareer(client: SupabaseClient, code: string): Promise<StoredCareer> {
  const {data,error}=await client.rpc("join_career_by_code",{p_code:code.trim().toUpperCase()});
  if(error) throw error;
  const {data:row, error:readError}=await client.from("game_careers")
    .select("id,name,club_id,club_data,competition_id,season,invite_code,game_state,created_at,updated_at")
    .eq("id",data).single();
  if(readError) throw readError;
  return toCareer(row as CareerRow);
}
