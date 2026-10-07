import type { FootballDataProvider } from "./types";
import { normalizeClub, normalizeCompetition, normalizePlayer } from "./normalizers";

export class GlobalFootballImporter {
  constructor(private provider: FootballDataProvider) {}

  async importCountry(countryName: string, season: number) {
    const competitions = await this.provider.getCompetitions(countryName, season);
    const clubs = [];
    const players = [];
    const errors: Array<{ scope: string; message: string }> = [];

    for (const competition of competitions) {
      try {
        const teams = await this.provider.getTeams(String(competition.id), season);
        clubs.push(...teams.map(normalizeClub));
        for (const team of teams) {
          try {
            const squad = await this.provider.getSquad(String(team.id), season);
            players.push(...squad.map(normalizePlayer));
          } catch (error) {
            errors.push({ scope: "squad:" + team.id, message: error instanceof Error ? error.message : String(error) });
          }
        }
      } catch (error) {
        errors.push({ scope: "competition:" + competition.id, message: error instanceof Error ? error.message : String(error) });
      }
    }

    return {
      country: countryName,
      season,
      competitions: competitions.map(normalizeCompetition),
      clubs,
      players,
      errors,
    };
  }
}
