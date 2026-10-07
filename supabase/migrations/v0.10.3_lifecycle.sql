create table if not exists public.game_transfers (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references public.game_seasons(id) on delete set null,
  player_id uuid not null references public.game_players(id) on delete cascade,
  from_club_id uuid references public.game_clubs(id) on delete set null,
  to_club_id uuid references public.game_clubs(id) on delete set null,
  transfer_date date not null default current_date,
  fee numeric not null default 0,
  wage numeric,
  transfer_type text not null default 'permanent',
  source text not null default 'game_engine',
  created_at timestamptz not null default now()
);

create table if not exists public.game_retirements (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.game_players(id) on delete cascade,
  season_id uuid references public.game_seasons(id) on delete set null,
  retirement_date date not null default current_date,
  reason text,
  final_club_id uuid references public.game_clubs(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(player_id, season_id)
);

create table if not exists public.game_youth_players (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.game_players(id) on delete cascade,
  club_id uuid not null references public.game_clubs(id) on delete cascade,
  season_id uuid not null references public.game_seasons(id) on delete cascade,
  generated boolean not null default true,
  academy_name text,
  generation_seed bigint,
  created_at timestamptz not null default now(),
  unique(player_id, season_id)
);

create index if not exists idx_game_seasons_world on public.game_seasons(world_id);
create index if not exists idx_game_countries_world on public.game_countries(world_id);
create index if not exists idx_game_competitions_country on public.game_competitions(country_id);
create index if not exists idx_game_club_seasons_season on public.game_club_seasons(season_id);
create index if not exists idx_game_player_contracts_player on public.game_player_contracts(player_id);
create index if not exists idx_game_player_contracts_club on public.game_player_contracts(club_id);
create index if not exists idx_game_player_stats_player on public.game_player_season_stats(player_id);
create index if not exists idx_game_player_stats_season on public.game_player_season_stats(season_id);
create index if not exists idx_game_transfers_season on public.game_transfers(season_id);
create index if not exists idx_game_transfers_player on public.game_transfers(player_id);
create index if not exists idx_game_retirements_season on public.game_retirements(season_id);
create index if not exists idx_game_youth_season on public.game_youth_players(season_id);
create index if not exists idx_game_youth_club on public.game_youth_players(club_id);
