export interface ExternalCompetition { id: number; name: string; type?: string; logo?: string; country?: string; }
export interface ExternalTeam { id: number; name: string; logo?: string; country?: string; }
export interface ExternalPlayer { id: number; name: string; age?: number; number?: number; position?: string; photo?: string; }

export interface FootballDataProvider {
  getCompetitions(countryName: string, season: number): Promise<ExternalCompetition[]>;
  getTeams(competitionId: string, season: number): Promise<ExternalTeam[]>;
  getSquad(clubId: string, season: number): Promise<ExternalPlayer[]>;
}

export interface NormalizedCompetition { externalId: number; name: string; type: string | null; logo: string | null; }
export interface NormalizedClub { externalId: number; name: string; logo: string | null; country: string | null; }
export interface NormalizedPlayer {
  externalId: number; name: string; age: number | null; shirtNumber: number | null;
  position: string | null; photo: string | null;
}
