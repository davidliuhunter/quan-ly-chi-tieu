using System.ComponentModel.DataAnnotations;

namespace QuanLyChiTieu.Mvc.Models.ViewModels;

public class GiaoDichVm
{
    public Guid? Id { get; set; }

    [Required(ErrorMessage = "Số tiền không được để trống")]
    [Range(1, long.MaxValue, ErrorMessage = "Số tiền phải lớn hơn 0")]
    public long Amount { get; set; }

    [Required]
    public string Type { get; set; } = "expense";

    public Guid? CategoryId { get; set; }

    public string? Description { get; set; }

    [Required(ErrorMessage = "Ngày giao dịch không được để trống")]
    [DataType(DataType.Date)]
    public DateOnly TransactionDate { get; set; } = DateOnly.FromDateTime(DateTime.Today);
}

public class GiaoDichListVm
{
    public List<GiaoDichItemVm> Items { get; set; } = new();
    public string FilterType { get; set; } = "all";
    public string? SearchQuery { get; set; }
    public DateOnly? DateFrom { get; set; }
    public DateOnly? DateTo { get; set; }
    public long? AmountMin { get; set; }
    public long? AmountMax { get; set; }
}

public class GiaoDichItemVm
{
    public Guid Id { get; set; }
    public long Amount { get; set; }
    public string Type { get; set; } = string.Empty;
    public Guid? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string? CategoryIcon { get; set; }
    public string? CategoryColor { get; set; }
    public string? Description { get; set; }
    public string TransactionDate { get; set; } = string.Empty;
}
