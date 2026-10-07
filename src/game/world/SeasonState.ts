export type SeasonPhase = "preseason" | "first_transfer_window" | "competition" | "second_transfer_window" | "finals" | "finished";

export interface SeasonState {
  season: number;
  phase: SeasonPhase;
  startDate: string;
  endDate: string;
  activeCompetitionIds: string[];
  completedCompetitionIds: string[];
  promotedClubIds: string[];
  relegatedClubIds: string[];
  championClubIds: string[];
  transferWindowOpen: boolean;
  generatedPlayers: number;
  retiredPlayers: number;
  transfersCompleted: number;
}
