import type { WorldPhase, WorldState } from "./WorldState";
import type { SeasonState } from "./SeasonState";

export class WorldEngine {
  constructor(private world: WorldState, private season: SeasonState) {}
  getWorld() { return this.world; }
  getSeason() { return this.season; }
  setPhase(phase: WorldPhase) {
    this.world = { ...this.world, phase, lastUpdated: new Date().toISOString(), version: this.world.version + 1 };
  }
  advanceDay(days = 1) {
    if (!Number.isInteger(days) || days < 1) throw new Error("days must be a positive integer");
    const date = new Date(this.world.currentDate + "T00:00:00Z");
    date.setUTCDate(date.getUTCDate() + days);
    this.world = { ...this.world, currentDate: date.toISOString().slice(0, 10), lastUpdated: new Date().toISOString(), version: this.world.version + 1 };
  }
  setActiveClub(clubId: string | null) {
    this.world = { ...this.world, activeClubId: clubId, lastUpdated: new Date().toISOString(), version: this.world.version + 1 };
  }
}
