using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuanLyChiTieu.Mvc.Models.Entities;

[Table("budgets")]
public class NganSach
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("category_id")]
    [Required]
    public Guid CategoryId { get; set; }

    [Column("month")]
    [Required]
    public string Month { get; set; } = string.Empty; // "YYYY-MM"

    [Column("limit_amount")]
    [Required]
    [Range(1, long.MaxValue, ErrorMessage = "Hạn mức phải lớn hơn 0")]
    public long LimitAmount { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey(nameof(CategoryId))]
    public DanhMuc? DanhMuc { get; set; }
}
