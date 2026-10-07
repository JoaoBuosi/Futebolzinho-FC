export type WorldPhase = "preseason" | "first_transfer_window" | "in_season" | "second_transfer_window" | "finals" | "season_end";

export interface WorldState {
  id: string;
  currentSeason: number;
  currentDate: string;
  phase: WorldPhase;
  activeClubId: string | null;
  countryIds: string[];
  competitionIds: string[];
  clubIds: string[];
  playerIds: string[];
  transferIds: string[];
  retirementIds: string[];
  generatedPlayerIds: string[];
  version: number;
  lastUpdated: string;
}
