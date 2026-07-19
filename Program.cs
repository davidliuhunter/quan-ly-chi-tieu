using Microsoft.EntityFrameworkCore;
using QuanLyChiTieu.Mvc.Data;
using QuanLyChiTieu.Mvc.Services;

var builder = WebApplication.CreateBuilder(args);

// ─── Database: SQLite (zero-install, file-based) ───────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=quanlychitieu.db"));

// ─── Services ──────────────────────────────────────────────────────────────
builder.Services.AddScoped<IDanhMucService, DanhMucService>();
builder.Services.AddScoped<IGiaoDichService, GiaoDichService>();

// Add services to the container.
builder.Services.AddControllersWithViews();

// ─── Session (cho auth đơn giản) ───────────────────────────────────────────
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromHours(4);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseAuthorization();

app.UseSession();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "short",
    pattern: "{controller}",
    defaults: new { action = "Index" });

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Auth}/{action=Index}/{id?}")
    .WithStaticAssets();

// ─── Auto-create DB + Seed data ────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();

    if (!db.DanhMucs.Any())
    {
        // Seed danh mục
        var cats = new[]
        {
            new { Name = "Ăn uống", Type = "expense", Icon = "🍜", Color = "#ef4444" },
            new { Name = "Di chuyển", Type = "expense", Icon = "🚗", Color = "#f59e0b" },
            new { Name = "Mua sắm", Type = "expense", Icon = "🛍️", Color = "#ec4899" },
            new { Name = "Giải trí", Type = "expense", Icon = "🎮", Color = "#8b5cf6" },
            new { Name = "Hóa đơn", Type = "expense", Icon = "📄", Color = "#6b7280" },
            new { Name = "Sức khỏe", Type = "expense", Icon = "💊", Color = "#14b8a6" },
            new { Name = "Lương", Type = "income", Icon = "💰", Color = "#22c55e" },
            new { Name = "Thưởng", Type = "income", Icon = "🎁", Color = "#3b82f6" },
            new { Name = "Đầu tư", Type = "income", Icon = "📈", Color = "#a855f7" },
        };
        foreach (var c in cats)
            db.DanhMucs.Add(new QuanLyChiTieu.Mvc.Models.Entities.DanhMuc
            { Name = c.Name, Type = c.Type, Icon = c.Icon, Color = c.Color });
        db.SaveChanges();

        // Seed giao dịch mẫu (tháng 5-7/2026)
        var catList = db.DanhMucs.OrderBy(c => c.CreatedAt).ToList();
        // cats theo thứ tự tạo: 0=Ăn uống, 1=Di chuyển, 2=Mua sắm, 3=Giải trí, 4=Hóa đơn, 5=Sức khỏe, 6=Lương, 7=Thưởng, 8=Đầu tư
        var tx = new (string type, long amount, int catIdx, string desc, int day, int month)[]
        {
            ("income",15_000_000,6,"Lương tháng 5",1,5),("expense",500_000,0,"Ăn trưa",3,5),
            ("expense",200_000,1,"Gửi xe",5,5),("expense",1_200_000,2,"Áo mới",10,5),
            ("expense",300_000,3,"Netflix",15,5),("expense",800_000,4,"Điện nước",20,5),
            ("expense",250_000,5,"Thuốc",25,5),("income",2_000_000,7,"Thưởng dự án",28,5),
            ("income",15_000_000,6,"Lương tháng 6",1,6),("expense",450_000,0,"Ăn trưa",3,6),
            ("expense",3_500_000,2,"Giày mới",8,6),("expense",180_000,1,"Xăng",12,6),
            ("expense",600_000,3,"Xem phim",18,6),("expense",750_000,4,"Điện nước",22,6),
            ("income",3_000_000,8,"Cổ tức",30,6),("income",16_000_000,6,"Lương tháng 7",1,7),
            ("expense",550_000,0,"Tiệc sinh nhật",5,7),("expense",220_000,1,"Gửi xe",8,7),
            ("expense",1_500_000,2,"Tai nghe mới",12,7),
        };
        int i = 0;
        foreach (var t in tx)
        {
            db.GiaoDichs.Add(new QuanLyChiTieu.Mvc.Models.Entities.GiaoDich
            {
                Amount = t.amount, Type = t.type,
                CategoryId = catList[t.catIdx].Id,
                Description = t.desc,
                TransactionDate = new DateOnly(2026, t.month, t.day),
                CreatedAt = new DateTime(2026, t.month, t.day, 8, 0, 0).AddMinutes(i++)
            });
        }
        db.SaveChanges();
    }
}

app.Run();
