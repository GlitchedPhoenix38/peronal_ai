create table providers (
  id text primary key,
  name text not null,
  enabled boolean not null default true,
  encrypted_api_key text,
  monthly_token_limit integer not null default 0,
  warning_thresholds jsonb not null default '[50, 75, 90]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  folder text not null default 'Inbox',
  pinned boolean not null default false,
  memory_summary text,
  active_provider text references providers(id),
  active_model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role text not null check (role in ('system', 'user', 'assistant')),
  provider_id text references providers(id),
  model_id text,
  content text not null,
  token_estimate integer not null default 0,
  created_at timestamptz not null default now()
);

create table attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references messages(id) on delete cascade,
  conversation_id uuid not null references conversations(id) on delete cascade,
  kind text not null check (kind in ('image', 'file')),
  name text not null,
  mime_type text,
  size_bytes integer not null,
  storage_url text not null,
  created_at timestamptz not null default now()
);

create table usage_events (
  id uuid primary key default gen_random_uuid(),
  provider_id text not null references providers(id),
  model_id text not null,
  conversation_id uuid references conversations(id) on delete set null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  estimated_cost numeric(10, 4) not null default 0,
  latency_ms integer,
  status text not null check (status in ('success', 'error', 'fallback')),
  error_message text,
  created_at timestamptz not null default now()
);

create table routing_events (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  mode text not null,
  selected_provider text not null references providers(id),
  selected_model text not null,
  reason text not null,
  optimizations jsonb not null default '[]',
  created_at timestamptz not null default now()
);
