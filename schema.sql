-- Habilitar extensión UUID
create extension if not exists "uuid-ossp";

-- Tabla de Perfiles
create table public.perfiles (
  id uuid references auth.users on delete cascade primary key,
  nombre text not null,
  cargo text,
  empresa text,
  telefono text,
  logo_url text,
  redes jsonb default '{}'::jsonb, -- {"instagram": "...", "linkedin": "...", "website": "...", "whatsapp": "..."}
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla de Tarjetas
create table public.tarjetas (
  id uuid default gen_random_uuid() primary key,
  serial_token text unique not null,
  usuario_id uuid references public.perfiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS (Row Level Security)
alter table public.perfiles enable row level security;
alter table public.tarjetas enable row level security;

-- Políticas de lectura pública para perfiles y tarjetas (necesario para ver la tarjeta sin loguearse)
create policy "Perfiles son públicos" on public.perfiles
  for select using (true);

create policy "Tarjetas son públicas" on public.tarjetas
  for select using (true);

-- Políticas de inserción y edición de perfiles
create policy "Usuarios pueden insertar su propio perfil" on public.perfiles
  for insert with check (auth.uid() = id);

create policy "Usuarios pueden actualizar su propio perfil" on public.perfiles
  for update using (auth.uid() = id);

-- Políticas de actualización de tarjetas
create policy "Usuarios pueden enlazar su propia tarjeta" on public.tarjetas
  for update 
  using (usuario_id is null or auth.uid() = usuario_id)
  with check (auth.uid() = usuario_id);

-- Trigger para crear un perfil automáticamente al registrarse en Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.perfiles (id, nombre, cargo, empresa, telefono, logo_url, redes)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', 'Nuevo Usuario'),
    coalesce(new.raw_user_meta_data->>'cargo', ''),
    coalesce(new.raw_user_meta_data->>'empresa', ''),
    coalesce(new.raw_user_meta_data->>'telefono', ''),
    coalesce(new.raw_user_meta_data->>'logo_url', ''),
    coalesce(new.raw_user_meta_data->'redes', '{}'::jsonb)
  );
  return new;
end;
$$ language plpgsql security definer;

-- Crear el trigger
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
