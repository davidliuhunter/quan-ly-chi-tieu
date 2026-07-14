# GitHub Copilot Instructions — Quản Lý Chi Tiêu

> File này chứa tri thức toàn diện về dự án dành cho AI agent.
> Đọc kỹ trước khi thực hiện bất kỳ thay đổi nào.

---

## 1. Tổng quan dự án

Website quản lý chi tiêu cá nhân — theo dõi thu nhập, chi tiêu hàng ngày với dashboard thống kê trực quan.

| Thông tin | Giá trị |
|-----------|---------|
| Production URL | https://quan-ly-chi-tieu.vercel.app |
| GitHub Repo | https://github.com/davidliuhunter/quan-ly-chi-tieu |
| Supabase Project | https://supabase.com/dashboard/project/dwlswemrfgbqdogpgtia |
| Supabase Project ID | `dwlswemrfgbqdogpgtia` |
| Vercel Dashboard | https://vercel.com/davidliuhunter/quan-ly-chi-tieu |

---

## 2. Tech Stack

| Layer | Công nghệ | Ghi chú |
|-------|-----------|---------|
| Framework | Next.js 14.2.35 (App Router) | SSR + Server Actions |
| UI | Tailwind CSS 3.4 | Custom `@layer components` |
| Charts | Recharts 2.15 | Biểu đồ cột + tròn |
| Database | Supabase (PostgreSQL) | RLS enabled, anon key |
| Hosting | Vercel | Auto-deploy on push to `main` |
| Language | TypeScript | Strict mode |
| Font | Inter | Google Fonts |

---

## 3. Cấu trúc thư mục

```
quan-ly-chi-tieu/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Redirect → login/admin
│   ├── globals.css             # Tailwind + custom classes
│   ├── dang-nhap/page.tsx      # Login page
│   └── quan-tri/
│       ├── layout.tsx          # Admin layout + auth guard
│       ├── page.tsx            # Dashboard (thống kê + biểu đồ)
│       ├── giao-dich/page.tsx  # CRUD giao dịch
│       └── danh-muc/page.tsx   # CRUD danh mục
├── components/
│   ├── DashboardClient.tsx     # Dashboard UI (PieChart + BarChart + list)
│   ├── TransactionsClient.tsx  # Quản lý giao dịch (filter + form + list)
│   ├── CategoriesClient.tsx    # Quản lý danh mục (icon picker + color)
│   └── TransactionItem.tsx     # Item giao dịch (dùng trong Dashboard)
├── lib/
│   ├── types.ts                # TypeScript interfaces
│   ├── supabase.ts             # Supabase client
│   ├── data.ts                 # Read functions (noStore)
│   ├── actions.ts              # Server Actions (CRUD)
│   └── mock-data.ts            # Mock data fallback
├── supabase/
│   ├── 001_schema.sql          # Schema gốc
│   ├── 002_seed.sql            # Seed data
│   └── migrations/             # Migration files
└── .github/
    ├── workflows/migrate.yml   # Auto-apply migrations
    └── copilot-instructions.md # File này
```

---

## 4. Database Schema

```sql
-- categories: Danh mục thu/chi
id uuid PK, name text, type text CHECK('income','expense'),
icon text DEFAULT '📌', color text DEFAULT '#6b7280', created_at timestamptz

-- transactions: Giao dịch
id uuid PK, amount numeric(15,0) CHECK(>0), type text CHECK('income','expense'),
category_id uuid FK, description text, transaction_date date, created_at timestamptz
```

### RLS Policy
- Public read tất cả bảng
- Anon write tất cả bảng (demo mode - single user)

### Supabase Functions
- `get_monthly_summary(year_param int)` → tổng hợp thu/chi theo tháng
- `get_category_summary(type_param, year_param, month_param)` → tổng hợp theo danh mục

---

## 5. Authentication

Admin panel dùng **sessionStorage** đơn giản:
- Login URL: `/dang-nhap`
- Password: `NEXT_PUBLIC_ADMIN_PASSWORD` (env var, default: `qltc2026`)
- Auth guard: `app/quan-tri/layout.tsx`

---

## 6. Quy trình phát triển

1. Sửa code → `npm run build` (src/) để kiểm tra
2. Push lên GitHub → Vercel auto-deploy
3. Nếu có thay đổi SQL → GitHub Actions auto-migrate Supabase
