# Quản Lý Chi Tiêu Cá Nhân

Ứng dụng web quản lý thu nhập và chi tiêu cá nhân, xây dựng bằng **ASP.NET Core MVC** với **SQLite** và giao diện **Tailwind CSS**.

---

## 🚀 Tính năng

| Tính năng | Mô tả |
|-----------|-------|
| 📊 **Dashboard** | Tổng quan thu/chi, biểu đồ cột 6 tháng, biểu đồ tròn danh mục |
| 💳 **Giao dịch** | Thêm/sửa/xóa giao dịch, lọc theo loại, tìm kiếm, lọc ngày/số tiền |
| ⚙️ **Danh mục** | Quản lý danh mục thu/chi (icon, màu sắc) |
| 🎯 **Ngân sách** | Đặt hạn mức chi tiêu theo danh mục, hiển thị % đã dùng |
| 🏆 **Mục tiêu** | Đặt mục tiêu tiết kiệm, theo dõi tiến độ |
| 🔄 **Định kỳ** | Quản lý giao dịch định kỳ (hàng ngày/tuần/tháng/năm) |
| 🔐 **Auth** | Đăng nhập mật khẩu đơn giản, session-based |
| 🌙 **Dark mode** | Chuyển đổi giao diện sáng/tối |
| 📱 **Responsive** | Sidebar desktop, bottom nav mobile |

---

## 🛠️ Công nghệ

| Layer | Công nghệ |
|-------|-----------|
| Framework | ASP.NET Core 9.0 MVC |
| Ngôn ngữ | C# 13 |
| Database | SQLite (file-based, zero install) |
| ORM | Entity Framework Core 9.0 |
| CSS | Tailwind CSS 3.4 (CDN) |
| Charts | Chart.js 4.4 |
| Testing | Playwright 1.61 |
| Font | Inter (Google Fonts) |

---

## 📁 Cấu trúc dự án

```
QuanLyChiTieu.Mvc/
├── Controllers/        # 7 controllers xử lý logic
│   ├── AuthController.cs
│   ├── DashboardController.cs
│   ├── GiaoDichController.cs
│   ├── DanhMucController.cs
│   ├── NganSachController.cs
│   ├── MucTieuController.cs
│   └── DinhKyController.cs
├── Models/             # Entity & ViewModel
│   ├── Entities/       # 5 entity class (DanhMuc, GiaoDich, NganSach, MucTieu, GiaoDichDinhKy)
│   └── ViewModels/     # 3 file ViewModel cho các trang
├── Data/               # DbContext
│   └── AppDbContext.cs
├── Services/           # Business logic
│   ├── IDanhMucService.cs / DanhMucService.cs
│   └── IGiaoDichService.cs / GiaoDichService.cs
├── Views/              # Razor views
│   ├── Auth/           # Đăng nhập
│   ├── Dashboard/      # Tổng quan + Chart.js
│   ├── GiaoDich/       # CRUD giao dịch + modal
│   ├── DanhMuc/        # CRUD danh mục + modal
│   ├── NganSach/       # Ngân sách + progress bar
│   ├── MucTieu/        # Mục tiêu + progress
│   ├── DinhKy/         # Định kỳ + toggle
│   └── Shared/         # Layout, Sidebar, MobileNav
├── tests/              # Playwright E2E tests
│   └── full-e2e.spec.ts
├── wwwroot/            # Static files (CSS, JS, lib)
└── Program.cs          # Entry point, DI, seed data
```

---

## 🚀 Cách chạy

### Yêu cầu

- .NET SDK 9.0+
- Trình duyệt web hiện đại

### Chạy local

```powershell
cd QuanLyChiTieu.Mvc
dotnet run --urls="http://localhost:5000"
```

Mở trình duyệt tại: **http://localhost:5000**

### Thông tin đăng nhập

| Thông tin | Giá trị |
|-----------|---------|
| URL | http://localhost:5000 |
| Mật khẩu | `qltc2026` |

> Mật khẩu được cấu hình trong `Controllers/AuthController.cs`, có thể thay đổi tùy ý.

---

## 🗄️ Database

### SQLite (zero install)

Ứng dụng dùng **SQLite** — database dạng file, không cần cài đặt gì.

- File DB: `quanlychitieu.db` (tự động tạo khi chạy)
- Schema + seed data tự động tạo khi khởi động lần đầu

### Seed data mẫu

| Loại | Số lượng | Chi tiết |
|------|:--------:|----------|
| Danh mục | 9 | Ăn uống, Di chuyển, Mua sắm, Giải trí, Hóa đơn, Sức khỏe, Lương, Thưởng, Đầu tư |
| Giao dịch | 19 | 15 chi tiêu + 4 thu nhập, từ tháng 5-7/2026 |

### Reset database

```powershell
cd QuanLyChiTieu.Mvc
Remove-Item quanlychitieu.db -Force
dotnet run --urls="http://localhost:5000"
```

---

## 🧪 Testing

### Playwright E2E Tests

```powershell
# Cài playwright (nếu chưa có)
npm install
npx playwright install chromium

# Chạy test
npx playwright test --reporter=list
```

24 test cases bao phủ:

| Nhóm | Số test | Mô tả |
|------|:-------:|-------|
| Auth | 5 | Login, wrong password, logout, unauthorized access |
| Danh mục | 3 | List, create, delete |
| Giao dịch | 4 | List, create, filter, search |
| Ngân sách | 2 | List, create |
| Mục tiêu | 3 | List, create, edit |
| Định kỳ | 3 | List, create, toggle |
| Dashboard | 3 | Layout, API, navigation |
| Navigation | 3 | Sidebar, routing, dark mode |

---

## 📊 API Endpoints

| Phương thức | URL | Mô tả |
|-----------|-----|-------|
| GET | `/Auth/Login` | Trang đăng nhập |
| POST | `/Auth/Login` | Xử lý đăng nhập |
| GET | `/Auth/Logout` | Đăng xuất |
| GET | `/Dashboard/Index` | Dashboard tổng quan |
| GET | `/Dashboard/GetData` | JSON data cho charts |
| GET | `/GiaoDich/Index` | Danh sách giao dịch |
| POST | `/GiaoDich/Create` | Thêm giao dịch |
| POST | `/GiaoDich/Edit` | Sửa giao dịch |
| POST | `/GiaoDich/Delete` | Xóa giao dịch |
| GET | `/DanhMuc/Index` | Danh sách danh mục |
| POST | `/DanhMuc/Create` | Thêm danh mục |
| POST | `/DanhMuc/Edit` | Sửa danh mục |
| POST | `/DanhMuc/Delete` | Xóa danh mục |
| GET | `/NganSach/Index` | Danh sách ngân sách |
| POST | `/NganSach/Create` | Thêm ngân sách |
| POST | `/NganSach/Delete` | Xóa ngân sách |
| GET | `/MucTieu/Index` | Danh sách mục tiêu |
| POST | `/MucTieu/Create` | Thêm mục tiêu |
| POST | `/MucTieu/Edit` | Sửa mục tiêu |
| POST | `/MucTieu/Delete` | Xóa mục tiêu |
| GET | `/DinhKy/Index` | Danh sách định kỳ |
| POST | `/DinhKy/Create` | Thêm định kỳ |
| POST | `/DinhKy/Edit` | Sửa định kỳ |
| POST | `/DinhKy/Delete` | Xóa định kỳ |
| POST | `/DinhKy/Toggle` | Bật/tắt định kỳ |

---

## 🎨 UI Features

- **Animated counter**: Dashboard summary cards đếm số mượt
- **Toast notification**: Popup thông báo thành công/lỗi với animation slide
- **Custom confirm dialog**: Modal xác nhận khi xóa (thay browser alert)
- **Form validation**: Tự động highlight input trống khi submit
- **Skeleton loading**: CSS shimmer animation
- **Dark mode**: Lưu preference vào cookie
- **Responsive**: Desktop sidebar + mobile bottom navigation

---

## 📝 Ghi chú phát triển

### Routing

Tất cả controller dùng route mặc định `{controller=Auth}/{action=Index}/{id?}`. Các URL đầy đủ dạng `/Controller/Index`.

### Session

Authentication dùng ASP.NET Core Session, không dùng Identity. Session lưu cờ `IsAdmin` sau khi đăng nhập thành công.

### Exception handling

Tất cả service và controller có try/catch để tránh crash khi database không khả dụng. Page sẽ hiển thị empty state thay vì 500 error.

---

## 📄 License

Dự án đồ án cá nhân — không áp dụng giấy phép thương mại.
