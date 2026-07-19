using Microsoft.EntityFrameworkCore;
using QuanLyChiTieu.Mvc.Models.Entities;

namespace QuanLyChiTieu.Mvc.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<DanhMuc> DanhMucs => Set<DanhMuc>();
    public DbSet<GiaoDich> GiaoDichs => Set<GiaoDich>();
    public DbSet<NganSach> NganSachs => Set<NganSach>();
    public DbSet<MucTieu> MucTieus => Set<MucTieu>();
    public DbSet<GiaoDichDinhKy> GiaoDichDinhKys => Set<GiaoDichDinhKy>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // GiaoDich -> DanhMuc
        modelBuilder.Entity<GiaoDich>()
            .HasOne(g => g.DanhMuc)
            .WithMany(d => d.GiaoDichs)
            .HasForeignKey(g => g.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);

        // NganSach -> DanhMuc
        modelBuilder.Entity<NganSach>()
            .HasOne(n => n.DanhMuc)
            .WithMany(d => d.NganSachs)
            .HasForeignKey(n => n.CategoryId)
            .OnDelete(DeleteBehavior.Cascade);

        // GiaoDichDinhKy -> DanhMuc
        modelBuilder.Entity<GiaoDichDinhKy>()
            .HasOne(g => g.DanhMuc)
            .WithMany()
            .HasForeignKey(g => g.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
