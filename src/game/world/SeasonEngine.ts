import type { SeasonPhase, SeasonState } from "./SeasonState";

export class SeasonEngine {
  constructor(private state: SeasonState) {}
  getState() { return this.state; }
  setPhase(phase: SeasonPhase) {
    this.state = { ...this.state, phase };
  }
  startSeason() { this.setPhase("competition"); }
  openSecondTransferWindow() { this.setPhase("second_transfer_window"); }
  finishSeason() { this.setPhase("finished"); }
}
