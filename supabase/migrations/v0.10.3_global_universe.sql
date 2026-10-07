create table if not exists public.game_worlds (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  current_season integer not null default 2026,
  world_date date not null default current_date,
  phase text not null default 'preseason',
  version integer not null default 1,
  last_updated timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.game_seasons (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null references public.game_worlds(id) on delete cascade,
  season integer not null,
  phase text not null default 'preseason',
  start_date date,
  end_date date,
  transfer_window_open boolean not null default true,
  generated_players integer not null default 0,
  retired_players integer not null default 0,
  transfers_completed integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(world_id, season)
);

create table if not exists public.game_countries (
  id uuid primary key default gen_random_uuid(),
  world_id uuid references public.game_worlds(id) on delete cascade,
  external_provider text not null default 'api-football',
  external_id integer,
  name text not null,
  code text,
  flag text,
  continent text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(external_provider, external_id),
  unique(world_id, name)
);

create table if not exists public.game_competitions (
  id uuid primary key default gen_random_uuid(),
  country_id uuid references public.game_countries(id) on delete set null,
  external_provider text not null default 'api-football',
  external_id integer,
  name text not null,
  type text,
  logo text,
  level integer,
  is_domestic boolean not null default true,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(external_provider, external_id)
);

create table if not exists public.game_club_seasons (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.game_clubs(id) on delete cascade,
  season_id uuid not null references public.game_seasons(id) on delete cascade,
  competition_id uuid references public.game_competitions(id) on delete set null,
  final_position integer,
  points integer not null default 0,
  promoted boolean not null default false,
  relegated boolean not null default false,
  champion boolean not null default false,
  wins integer not null default 0,
  draws integer not null default 0,
  losses integer not null default 0,
  goals_for integer not null default 0,
  goals_against integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(club_id, season_id, competition_id)
);

create table if not exists public.game_player_contracts (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.game_players(id) on delete cascade,
  club_id uuid not null references public.game_clubs(id) on delete cascade,
  start_date date,
  end_date date,
  wage numeric not null default 0,
  release_clause numeric,
  squad_role text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.game_player_season_stats (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.game_players(id) on delete cascade,
  season_id uuid not null references public.game_seasons(id) on delete cascade,
  club_id uuid references public.game_clubs(id) on delete set null,
  competition_id uuid references public.game_competitions(id) on delete set null,
  appearances integer not null default 0,
  starts integer not null default 0,
  minutes integer not null default 0,
  goals integer not null default 0,
  assists integer not null default 0,
  yellow_cards integer not null default 0,
  red_cards integer not null default 0,
  average_rating numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(player_id, season_id, club_id, competition_id)
);
