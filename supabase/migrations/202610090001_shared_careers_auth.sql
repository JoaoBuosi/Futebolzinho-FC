create table if not exists public.game_careers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  club_id text not null,
  club_data jsonb not null,
  competition_id text not null,
  season integer not null default 2026,
  invite_code text not null unique check (invite_code ~ '^FZ-[A-Z0-9]{6}$'),
  game_state jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.game_career_members (
  career_id uuid not null references public.game_careers(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  manager_name text not null default 'Manager',
  joined_at timestamptz not null default now(),
  primary key (career_id, user_id)
);

create index if not exists game_careers_owner_updated_idx
  on public.game_careers (owner_id, updated_at desc);
create index if not exists game_careers_invite_code_idx
  on public.game_careers (invite_code);
create index if not exists game_career_members_user_idx
  on public.game_career_members (user_id, joined_at desc);

alter table public.game_careers enable row level security;
alter table public.game_career_members enable row level security;

drop policy if exists "career members can read shared careers" on public.game_careers;
create policy "career members can read shared careers"
  on public.game_careers for select to authenticated
  using (
    owner_id = (select auth.uid())
    or exists (
      select 1 from public.game_career_members m
      where m.career_id = game_careers.id
        and m.user_id = (select auth.uid())
    )
  );

drop policy if exists "users can create their own careers" on public.game_careers;
create policy "users can create their own careers"
  on public.game_careers for insert to authenticated
  with check (owner_id = (select auth.uid()));

drop policy if exists "owners can update their own careers" on public.game_careers;
create policy "owners can update their own careers"
  on public.game_careers for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

drop policy if exists "users can read their own memberships" on public.game_career_members;
create policy "users can read their own memberships"
  on public.game_career_members for select to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.game_careers c
      where c.id = game_career_members.career_id
        and c.owner_id = (select auth.uid())
    )
  );

create or replace function public.add_career_owner_as_member()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.game_career_members (career_id, user_id, manager_name)
  values (new.id, new.owner_id, coalesce(nullif(new.name, ''), 'Manager'))
  on conflict (career_id, user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists game_career_owner_membership on public.game_careers;
create trigger game_career_owner_membership
  after insert on public.game_careers
  for each row execute function public.add_career_owner_as_member();

create or replace function public.join_career_by_code(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_career_id uuid;
  v_manager_name text;
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if p_code is null or length(trim(p_code)) > 16 then
    raise exception 'INVALID_INVITE_CODE';
  end if;

  select id into v_career_id
  from public.game_careers
  where upper(invite_code) = upper(trim(p_code))
  limit 1;

  if v_career_id is null then
    raise exception 'INVITE_NOT_FOUND';
  end if;

  select coalesce(nullif(raw_user_meta_data ->> 'name', ''), split_part(email, '@', 1), 'Manager')
    into v_manager_name
  from auth.users
  where id = v_user_id;

  insert into public.game_career_members (career_id, user_id, manager_name)
  values (v_career_id, v_user_id, coalesce(v_manager_name, 'Manager'))
  on conflict (career_id, user_id) do nothing;

  return v_career_id;
end;
$$;

revoke all on function public.join_career_by_code(text) from public, anon;
grant execute on function public.join_career_by_code(text) to authenticated;

grant select, insert, update on public.game_careers to authenticated;
grant select on public.game_career_members to authenticated;
