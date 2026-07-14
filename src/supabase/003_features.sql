-- ============================================================
-- Quản Lý Chi Tiêu - Migration 003: Budget + Recurring + Savings
-- ============================================================

-- Ngân sách tháng theo danh mục
create table if not exists public.budgets (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid references public.categories(id) on delete cascade,
  month         text not null, -- format: 'YYYY-MM'
  limit_amount  numeric(15,0) not null check (limit_amount > 0),
  created_at    timestamptz not null default now(),
  unique(category_id, month)
);

-- Giao dịch định kỳ
create table if not exists public.recurring_transactions (
  id            uuid primary key default gen_random_uuid(),
  amount        numeric(15,0) not null check (amount > 0),
  type          text not null check (type in ('income', 'expense')),
  category_id   uuid references public.categories(id) on delete set null,
  description   text,
  frequency     text not null check (frequency in ('daily', 'weekly', 'monthly', 'yearly')),
  next_date     date not null,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- Mục tiêu tiết kiệm
create table if not exists public.savings_goals (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  target_amount   numeric(15,0) not null check (target_amount > 0),
  current_amount  numeric(15,0) not null default 0,
  deadline        date,
  icon            text not null default '🎯',
  color           text not null default '#3b82f6',
  is_completed    boolean not null default false,
  created_at      timestamptz not null default now()
);

-- Indexes
create index if not exists idx_budgets_month on public.budgets(month);
create index if not exists idx_recurring_next_date on public.recurring_transactions(next_date) where is_active = true;

-- ============================================================
-- Function: Kiểm tra ngân sách - trả về % đã chi
-- ============================================================
create or replace function public.get_budget_status(month_param text)
returns table (
  category_id uuid,
  category_name text,
  category_icon text,
  category_color text,
  limit_amount numeric,
  spent_amount numeric,
  percentage numeric
)
language sql
stable
as $$
  select
    b.category_id,
    c.name as category_name,
    c.icon as category_icon,
    c.color as category_color,
    b.limit_amount,
    coalesce(
      (select sum(t.amount) from public.transactions t
       where t.category_id = b.category_id
         and t.type = 'expense'
         and to_char(t.transaction_date, 'YYYY-MM') = b.month),
      0
    ) as spent_amount,
    case when b.limit_amount > 0
      then round((coalesce(
        (select sum(t.amount) from public.transactions t
         where t.category_id = b.category_id
           and t.type = 'expense'
           and to_char(t.transaction_date, 'YYYY-MM') = b.month),
        0
      ) / b.limit_amount) * 100, 1)
      else 0
    end as percentage
  from public.budgets b
  left join public.categories c on c.id = b.category_id
  where b.month = month_param
  order by percentage desc;
$$;

-- ============================================================
-- Function: Tổng tiết kiệm
-- ============================================================
create or replace function public.get_total_savings()
returns table (
  total_saved numeric,
  total_target numeric,
  overall_percentage numeric
)
language sql
stable
as $$
  select
    coalesce(sum(current_amount), 0) as total_saved,
    coalesce(sum(target_amount), 0) as total_target,
    case when coalesce(sum(target_amount), 0) > 0
      then round((coalesce(sum(current_amount), 0) / coalesce(sum(target_amount), 1)) * 100, 1)
      else 0
    end as overall_percentage
  from public.savings_goals
  where is_completed = false;
$$;

-- ============================================================
-- RLS Policies
-- ============================================================

alter table public.budgets enable row level security;
alter table public.recurring_transactions enable row level security;
alter table public.savings_goals enable row level security;

create policy "public read budgets"              on public.budgets               for select using (true);
create policy "public read recurring"            on public.recurring_transactions for select using (true);
create policy "public read savings_goals"        on public.savings_goals         for select using (true);

create policy "anon write budgets"               on public.budgets               for all using (true) with check (true);
create policy "anon write recurring"             on public.recurring_transactions for all using (true) with check (true);
create policy "anon write savings_goals"         on public.savings_goals         for all using (true) with check (true);
