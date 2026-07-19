using Microsoft.EntityFrameworkCore;
using QuanLyChiTieu.Mvc.Data;
using QuanLyChiTieu.Mvc.Models.Entities;
using QuanLyChiTieu.Mvc.Models.ViewModels;

namespace QuanLyChiTieu.Mvc.Services;

public class GiaoDichService : IGiaoDichService
{
    private readonly AppDbContext _db;
    private readonly ILogger<GiaoDichService> _log;
    public GiaoDichService(AppDbContext db, ILogger<GiaoDichService> log) { _db = db; _log = log; }

    public async Task<List<GiaoDich>> GetAllAsync(int limit = 200)
    { try { return await _db.GiaoDichs.Include(g => g.DanhMuc).OrderByDescending(g => g.TransactionDate).ThenByDescending(g => g.CreatedAt).Take(limit).ToListAsync(); } catch { return new(); } }

    public async Task<GiaoDich?> GetByIdAsync(Guid id)
        => await _db.GiaoDichs
            .Include(g => g.DanhMuc)
            .FirstOrDefaultAsync(g => g.Id == id);

    public async Task CreateAsync(GiaoDichVm vm)
    { try { _db.GiaoDichs.Add(new GiaoDich { Amount=vm.Amount,Type=vm.Type,CategoryId=vm.CategoryId,Description=vm.Description,TransactionDate=vm.TransactionDate }); await _db.SaveChangesAsync(); } catch { throw; } }

    public async Task UpdateAsync(Guid id, GiaoDichVm vm)
    { try { var e=await _db.GiaoDichs.FindAsync(id);if(e==null)return;e.Amount=vm.Amount;e.Type=vm.Type;e.CategoryId=vm.CategoryId;e.Description=vm.Description;e.TransactionDate=vm.TransactionDate;await _db.SaveChangesAsync(); } catch { throw; } }

    public async Task DeleteAsync(Guid id)
    { try { var e=await _db.GiaoDichs.FindAsync(id);if(e!=null){_db.GiaoDichs.Remove(e);await _db.SaveChangesAsync();} } catch { throw; } }

    // ─── Dashboard data ─────────────────────────────────────────────────────
    public async Task<DashboardVm> GetDashboardAsync()
    {
        var today = DateTime.Today;
        var currentMonth = $"{today.Year}-{today.Month:D2}";

        var vm = new DashboardVm { CurrentMonth = currentMonth };

        // Gọi monthly summary bằng LINQ (không cần stored function)
        var monthlyData = await GetMonthlySummary(today.Year);

        // Tháng hiện tại
        var thisMonth = monthlyData.FirstOrDefault(m => m.Month == currentMonth);
        if (thisMonth != null)
        {
            vm.TotalIncome = thisMonth.TotalIncome;
            vm.TotalExpense = thisMonth.TotalExpense;
            vm.Balance = thisMonth.Balance;
        }

        vm.MonthlySummaries = monthlyData;

        // Phân tích theo danh mục
        vm.ExpenseByCategory = await GetCategoryPieData("expense", today.Year, today.Month);
        vm.IncomeByCategory = await GetCategoryPieData("income", today.Year, today.Month);

        // Giao dịch gần đây
        var recent = await _db.GiaoDichs
            .Include(g => g.DanhMuc)
            .OrderByDescending(g => g.TransactionDate)
            .ThenByDescending(g => g.CreatedAt)
            .Take(5)
            .ToListAsync();

        vm.RecentTransactions = recent.Select(g => new RecentTransactionVm
        {
            Id = g.Id,
            Amount = g.Amount,
            Type = g.Type,
            CategoryName = g.DanhMuc?.Name,
            CategoryIcon = g.DanhMuc?.Icon,
            CategoryColor = g.DanhMuc?.Color,
            Description = g.Description,
            TransactionDate = g.TransactionDate.ToString("dd/MM/yyyy")
        }).ToList();

        return vm;
    }

    private async Task<List<MonthlySummaryVm>> GetMonthlySummary(int year)
    {
        try
        {
            var from = new DateOnly(year, 1, 1);
            var to = new DateOnly(year, 12, 31);
            var tx = await _db.GiaoDichs
                .Where(g => g.TransactionDate >= from && g.TransactionDate <= to)
                .ToListAsync();
            return tx.GroupBy(g => $"{g.TransactionDate.Year}-{g.TransactionDate.Month:D2}")
                .Select(g => new MonthlySummaryVm
                {
                    Month = g.Key,
                    TotalIncome = g.Where(x => x.Type == "income").Sum(x => (long)x.Amount),
                    TotalExpense = g.Where(x => x.Type == "expense").Sum(x => (long)x.Amount),
                    Balance = g.Where(x => x.Type == "income").Sum(x => (long)x.Amount)
                            - g.Where(x => x.Type == "expense").Sum(x => (long)x.Amount)
                }).OrderByDescending(x => x.Month).ToList();
        }
        catch (Exception) { return new(); }
    }

    private async Task<List<CategoryPieVm>> GetCategoryPieData(string type, int year, int month)
    {
        try
        {
            var tx = await _db.GiaoDichs
                .Include(g => g.DanhMuc)
                .Where(g => g.Type == type && g.CategoryId != null
                    && g.TransactionDate.Year == year && g.TransactionDate.Month == month)
                .ToListAsync();
            if (tx.Count == 0) return new();

            var total = tx.Sum(g => g.Amount);
            return tx.GroupBy(g => new { g.CategoryId, g.DanhMuc!.Name, g.DanhMuc.Icon, g.DanhMuc.Color })
                .Select(g => new CategoryPieVm
                {
                    CategoryName = g.Key.Name,
                    CategoryIcon = g.Key.Icon,
                    CategoryColor = g.Key.Color,
                    Total = g.Sum(x => x.Amount),
                    Percentage = Math.Round((decimal)g.Sum(x => x.Amount) * 100 / total, 1)
                }).OrderByDescending(x => x.Total).ToList();
        }
        catch (Exception) { return new(); }
    }
}
