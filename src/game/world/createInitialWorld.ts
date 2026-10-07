import type { WorldState } from "./WorldState";
import type { SeasonState } from "./SeasonState";

export function createInitialWorld(activeClubId: string | null = null) {
  const now = new Date();
  const world: WorldState = {
    id: crypto.randomUUID(),
    currentSeason: 2026,
    currentDate: now.toISOString().slice(0, 10),
    phase: "preseason",
    activeClubId,
    countryIds: [],
    competitionIds: [],
    clubIds: [],
    playerIds: [],
    transferIds: [],
    retirementIds: [],
    generatedPlayerIds: [],
    version: 1,
    lastUpdated: now.toISOString(),
  };

  const season: SeasonState = {
    season: 2026,
    phase: "preseason",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    activeCompetitionIds: [],
    completedCompetitionIds: [],
    promotedClubIds: [],
    relegatedClubIds: [],
    championClubIds: [],
    transferWindowOpen: true,
    generatedPlayers: 0,
    retiredPlayers: 0,
    transfersCompleted: 0,
  };

  return { world, season };
}
