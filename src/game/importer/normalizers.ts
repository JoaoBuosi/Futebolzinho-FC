import type { ExternalCompetition, ExternalPlayer, ExternalTeam, NormalizedClub, NormalizedCompetition, NormalizedPlayer } from "./types";

export const normalizeCompetition = (x: ExternalCompetition): NormalizedCompetition => ({
  externalId: x.id, name: x.name, type: x.type ?? null, logo: x.logo ?? null,
});

export const normalizeClub = (x: ExternalTeam): NormalizedClub => ({
  externalId: x.id, name: x.name, logo: x.logo ?? null, country: x.country ?? null,
});

export const normalizePlayer = (x: ExternalPlayer): NormalizedPlayer => ({
  externalId: x.id, name: x.name, age: x.age ?? null, shirtNumber: x.number ?? null,
  position: x.position ?? null, photo: x.photo ?? null,
});
