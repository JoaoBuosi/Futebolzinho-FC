import type { WorldState } from "./WorldState";
import type { SeasonState } from "./SeasonState";

export function buildWorld(world: WorldState, season: SeasonState) {
  return {
    world: { ...world, lastUpdated: new Date().toISOString(), version: world.version + 1 },
    season,
  };
}
