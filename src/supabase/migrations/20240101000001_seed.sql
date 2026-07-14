-- Seed data cho Quản Lý Chi Tiêu
-- Chạy sau 001_schema.sql

-- Danh mục mặc định
insert into public.categories (name, type, icon, color) values
  ('Ăn uống',   'expense', '🍜', '#ef4444'),
  ('Di chuyển', 'expense', '🚗', '#f97316'),
  ('Mua sắm',   'expense', '🛒', '#8b5cf6'),
  ('Giải trí',  'expense', '🎮', '#ec4899'),
  ('Hóa đơn',   'expense', '📋', '#6b7280'),
  ('Sức khỏe',  'expense', '💊', '#14b8a6'),
  ('Giáo dục',  'expense', '📚', '#eab308'),
  ('Lương',     'income',  '💰', '#22c55e'),
  ('Thưởng',    'income',  '🎁', '#3b82f6'),
  ('Đầu tư',    'income',  '📈', '#a855f7'),
  ('Khác',      'expense', '📌', '#9ca3af');
