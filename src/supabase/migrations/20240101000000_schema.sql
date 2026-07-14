-- ============================================================
-- Quản Lý Chi Tiêu - Supabase Database Schema
-- Chạy file này trong Supabase SQL Editor
-- ============================================================

-- Danh mục chi tiêu
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  type        text not null check (type in ('income', 'expense')),
  icon        text not null default '📌',
  color       text not null default '#6b7280',
  created_at  timestamptz not null default now()
);

-- Giao dịch
create table if not exists public.transactions (
  id               uuid primary key default gen_random_uuid(),
  amount           numeric(15,0) not null check (amount > 0),
  type             text not null check (type in ('income', 'expense')),
  category_id      uuid references public.categories(id) on delete set null,
  description      text,
  transaction_date date not null default current_date,
  created_at       timestamptz not null default now()
);

-- Index cho tìm kiếm và thống kê
create index if not exists idx_transactions_date on public.transactions(transaction_date desc);
create index if not exists idx_transactions_type on public.transactions(type);
create index if not exists idx_transactions_category on public.transactions(category_id);

-- ============================================================
-- Stored Functions cho thống kê
-- ============================================================

-- Tổng hợp thu chi theo tháng
create or replace function public.get_monthly_summary(year_param int)
returns table (
  month text,
  total_income numeric,
  total_expense numeric,
  balance numeric
)
language sql
stable
as $$
  select
    to_char(transaction_date, 'YYYY-MM') as month,
    coalesce(sum(case when type = 'income' then amount else 0 end), 0) as total_income,
    coalesce(sum(case when type = 'expense' then amount else 0 end), 0) as total_expense,
    coalesce(sum(case when type = 'income' then amount else -amount end), 0) as balance
  from public.transactions
  where extract(year from transaction_date) = year_param
  group by to_char(transaction_date, 'YYYY-MM')
  order by month desc;
$$;

-- Tổng hợp theo danh mục trong tháng
create or replace function public.get_category_summary(
  type_param text,
  year_param int,
  month_param int
)
returns table (
  category_id uuid,
  category_name text,
  category_icon text,
  category_color text,
  total numeric,
  percentage numeric
)
language sql
stable
as $$
  with totals as (
    select
      t.category_id,
      c.name as category_name,
      c.icon as category_icon,
      c.color as category_color,
      sum(t.amount) as total
    from public.transactions t
    left join public.categories c on c.id = t.category_id
    where t.type = type_param
      and extract(year from t.transaction_date) = year_param
      and extract(month from t.transaction_date) = month_param
    group by t.category_id, c.name, c.icon, c.color
  ),
  grand_total as (
    select sum(total) as sum_total from totals
  )
  select
    t.category_id,
    t.category_name,
    t.category_icon,
    t.category_color,
    t.total,
    case when gt.sum_total > 0 then round((t.total / gt.sum_total) * 100, 1) else 0 end as percentage
  from totals t, grand_total gt
  order by t.total desc;
$$;

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

alter table public.categories enable row level security;
alter table public.transactions enable row level security;

-- Public read
create policy "public read categories"   on public.categories   for select using (true);
create policy "public read transactions" on public.transactions for select using (true);

-- Anon write (demo - single user)
create policy "anon write categories"   on public.categories   for all using (true) with check (true);
create policy "anon write transactions" on public.transactions for all using (true) with check (true);
