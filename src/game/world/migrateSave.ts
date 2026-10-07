import { createInitialWorld } from "./createInitialWorld";

type WorldSaveFields = ReturnType<typeof createInitialWorld>;

export function migrateSave<T extends Record<string, any>>(
  save: T,
  activeClubId: string | null = null,
): T & WorldSaveFields & { version: string } {
  const initial = createInitialWorld(activeClubId);
  const migrated = save as T & WorldSaveFields & { version: string };

  if (!migrated.world) migrated.world = initial.world;
  if (!migrated.season) migrated.season = initial.season;
  migrated.version = "0.10.3";

  return migrated;
}
