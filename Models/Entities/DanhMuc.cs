using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuanLyChiTieu.Mvc.Models.Entities;

[Table("categories")]
public class DanhMuc
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("name")]
    [Required(ErrorMessage = "Tên danh mục không được để trống")]
    public string Name { get; set; } = string.Empty;

    [Column("type")]
    [Required]
    public string Type { get; set; } = "expense"; // "income" | "expense"

    [Column("icon")]
    public string Icon { get; set; } = "📌";

    [Column("color")]
    public string Color { get; set; } = "#6b7280";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<GiaoDich> GiaoDichs { get; set; } = new List<GiaoDich>();
    public ICollection<NganSach> NganSachs { get; set; } = new List<NganSach>();
}
