using System.ComponentModel.DataAnnotations;

namespace QuanLyChiTieu.Mvc.Models.ViewModels;

public class DanhMucVm
{
    public Guid? Id { get; set; }

    [Required(ErrorMessage = "Tên danh mục không được để trống")]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Type { get; set; } = "expense";

    public string Icon { get; set; } = "📌";

    public string Color { get; set; } = "#6b7280";
}

public class NganSachVm
{
    public Guid? Id { get; set; }

    [Required]
    public Guid CategoryId { get; set; }

    [Required]
    public string Month { get; set; } = DateTime.Today.ToString("yyyy-MM");

    [Required]
    [Range(1, long.MaxValue, ErrorMessage = "Hạn mức phải lớn hơn 0")]
    public long LimitAmount { get; set; }
}

public class MucTieuVm
{
    public Guid? Id { get; set; }

    [Required(ErrorMessage = "Tên mục tiêu không được để trống")]
    public string Name { get; set; } = string.Empty;

    [Required]
    [Range(1, long.MaxValue)]
    public long TargetAmount { get; set; }

    public long CurrentAmount { get; set; }

    [DataType(DataType.Date)]
    public DateOnly? Deadline { get; set; }

    public string Icon { get; set; } = "🎯";
    public string Color { get; set; } = "#3b82f6";
}

public class GiaoDichDinhKyVm
{
    public Guid? Id { get; set; }

    [Required]
    [Range(1, long.MaxValue)]
    public long Amount { get; set; }

    [Required]
    public string Type { get; set; } = "expense";

    public Guid? CategoryId { get; set; }

    public string? Description { get; set; }

    [Required]
    public string Frequency { get; set; } = "monthly";

    [Required]
    [DataType(DataType.Date)]
    public DateOnly NextDate { get; set; }

    public bool IsActive { get; set; } = true;
}
