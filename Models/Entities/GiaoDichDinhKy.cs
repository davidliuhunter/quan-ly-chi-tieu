using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuanLyChiTieu.Mvc.Models.Entities;

[Table("recurring_transactions")]
public class GiaoDichDinhKy
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("amount")]
    [Required]
    [Range(1, long.MaxValue)]
    public long Amount { get; set; }

    [Column("type")]
    [Required]
    public string Type { get; set; } = "expense";

    [Column("category_id")]
    public Guid? CategoryId { get; set; }

    [Column("description")]
    public string? Description { get; set; }

    [Column("frequency")]
    [Required]
    public string Frequency { get; set; } = "monthly"; // daily | weekly | monthly | yearly

    [Column("next_date")]
    [Required]
    public DateOnly NextDate { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey(nameof(CategoryId))]
    public DanhMuc? DanhMuc { get; set; }
}
