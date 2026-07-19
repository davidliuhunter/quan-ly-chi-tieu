using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuanLyChiTieu.Mvc.Models.Entities;

[Table("transactions")]
public class GiaoDich
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("amount")]
    [Required]
    [Range(1, long.MaxValue, ErrorMessage = "Số tiền phải lớn hơn 0")]
    public long Amount { get; set; }

    [Column("type")]
    [Required]
    public string Type { get; set; } = "expense"; // "income" | "expense"

    [Column("category_id")]
    public Guid? CategoryId { get; set; }

    [Column("description")]
    public string? Description { get; set; }

    [Column("transaction_date")]
    [Required]
    public DateOnly TransactionDate { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey(nameof(CategoryId))]
    public DanhMuc? DanhMuc { get; set; }
}
