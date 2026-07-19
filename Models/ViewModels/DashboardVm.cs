namespace QuanLyChiTieu.Mvc.Models.ViewModels;

public class DashboardVm
{
    // Tháng hiện tại
    public string CurrentMonth { get; set; } = string.Empty;
    public long TotalIncome { get; set; }
    public long TotalExpense { get; set; }
    public long Balance { get; set; }

    // Biểu đồ cột 6 tháng
    public List<MonthlySummaryVm> MonthlySummaries { get; set; } = new();

    // Biểu đồ tròn chi tiêu theo danh mục
    public List<CategoryPieVm> ExpenseByCategory { get; set; } = new();

    // Biểu đồ tròn thu nhập theo danh mục
    public List<CategoryPieVm> IncomeByCategory { get; set; } = new();

    // Giao dịch gần đây
    public List<RecentTransactionVm> RecentTransactions { get; set; } = new();
}

public class MonthlySummaryVm
{
    public string Month { get; set; } = string.Empty;
    public long TotalIncome { get; set; }
    public long TotalExpense { get; set; }
    public long Balance { get; set; }
}

public class CategoryPieVm
{
    public string CategoryName { get; set; } = string.Empty;
    public string CategoryIcon { get; set; } = "📌";
    public string CategoryColor { get; set; } = "#6b7280";
    public long Total { get; set; }
    public decimal Percentage { get; set; }
}

public class RecentTransactionVm
{
    public Guid Id { get; set; }
    public long Amount { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? CategoryName { get; set; }
    public string? CategoryIcon { get; set; }
    public string? CategoryColor { get; set; }
    public string? Description { get; set; }
    public string TransactionDate { get; set; } = string.Empty;
}
