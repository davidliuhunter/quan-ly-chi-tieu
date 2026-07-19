using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyChiTieu.Mvc.Data;
using QuanLyChiTieu.Mvc.Models.Entities;
using QuanLyChiTieu.Mvc.Models.ViewModels;

namespace QuanLyChiTieu.Mvc.Controllers;

public class NganSachController : Controller
{
    private readonly AppDbContext _db;
    public NganSachController(AppDbContext db) => _db = db;

    private IActionResult CheckAuth()
    {
        if (HttpContext.Session.GetString("IsAdmin") != "true")
            return RedirectToAction("Login", "Auth");
        return null!;
    }

    public async Task<IActionResult> Index()
    {
        var auth = CheckAuth(); if (auth != null) return auth;
        var currentMonth = DateTime.Today.ToString("yyyy-MM");

        // Get budgets with category info and spent amount
        var budgets = await _db.NganSachs
            .Include(n => n.DanhMuc)
            .Where(n => n.Month == currentMonth)
            .ToListAsync();

        var result = new List<BudgetStatusVm>();
        foreach (var budget in budgets)
        {
            var spent = await _db.GiaoDichs
                .Where(g => g.CategoryId == budget.CategoryId
                    && g.Type == "expense"
                    && g.TransactionDate.Year == DateTime.Today.Year
                    && g.TransactionDate.Month == DateTime.Today.Month)
                .SumAsync(g => (long?)g.Amount) ?? 0;

            result.Add(new BudgetStatusVm
            {
                Id = budget.Id,
                CategoryId = budget.CategoryId,
                CategoryName = budget.DanhMuc?.Name ?? "",
                CategoryIcon = budget.DanhMuc?.Icon ?? "📌",
                CategoryColor = budget.DanhMuc?.Color ?? "#6b7280",
                LimitAmount = budget.LimitAmount,
                SpentAmount = spent,
                Month = budget.Month
            });
        }

        ViewBag.Categories = await _db.DanhMucs.Where(c => c.Type == "expense").ToListAsync();
        ViewBag.CurrentMonth = currentMonth;
        return View(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(NganSachVm vm)
    {
        var auth = CheckAuth(); if (auth != null) return auth;
        if (!ModelState.IsValid)
        {
            TempData["Error"] = "Vui lòng kiểm tra thông tin.";
            return RedirectToAction(nameof(Index));
        }
        _db.NganSachs.Add(new NganSach
        {
            CategoryId = vm.CategoryId,
            Month = vm.Month,
            LimitAmount = vm.LimitAmount
        });
        await _db.SaveChangesAsync();
        TempData["Success"] = "Đã thêm ngân sách!";
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    public async Task<IActionResult> Delete(Guid id)
    {
        var auth = CheckAuth(); if (auth != null) return auth;
        var entity = await _db.NganSachs.FindAsync(id);
        if (entity != null) { _db.NganSachs.Remove(entity); await _db.SaveChangesAsync(); }
        TempData["Success"] = "Đã xóa ngân sách!";
        return RedirectToAction(nameof(Index));
    }
}

public class BudgetStatusVm
{
    public Guid Id { get; set; }
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = "";
    public string CategoryIcon { get; set; } = "📌";
    public string CategoryColor { get; set; } = "#6b7280";
    public long LimitAmount { get; set; }
    public long SpentAmount { get; set; }
    public string Month { get; set; } = "";
    public int Percentage => LimitAmount > 0 ? (int)Math.Min(100, SpentAmount * 100 / LimitAmount) : 0;
}
