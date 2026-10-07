import { createInitialWorld } from "./createInitialWorld";

export function migrateSave<T extends Record<string, any>>(save: T, activeClubId: string | null = null) {
  const initial = createInitialWorld(activeClubId);
  if (!save.world) save.world = initial.world;
  if (!save.season) save.season = initial.season;
  save.version = "0.10.3";
  return save;
}
