using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuanLyChiTieu.Mvc.Models.Entities;

[Table("savings_goals")]
public class MucTieu
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("name")]
    [Required(ErrorMessage = "Tên mục tiêu không được để trống")]
    public string Name { get; set; } = string.Empty;

    [Column("target_amount")]
    [Required]
    [Range(1, long.MaxValue)]
    public long TargetAmount { get; set; }

    [Column("current_amount")]
    public long CurrentAmount { get; set; }

    [Column("deadline")]
    public DateOnly? Deadline { get; set; }

    [Column("icon")]
    public string Icon { get; set; } = "🎯";

    [Column("color")]
    public string Color { get; set; } = "#3b82f6";

    [Column("is_completed")]
    public bool IsCompleted { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
