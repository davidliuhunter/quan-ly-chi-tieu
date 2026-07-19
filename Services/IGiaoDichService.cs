using QuanLyChiTieu.Mvc.Models.Entities;
using QuanLyChiTieu.Mvc.Models.ViewModels;

namespace QuanLyChiTieu.Mvc.Services;

public interface IGiaoDichService
{
    Task<List<GiaoDich>> GetAllAsync(int limit = 200);
    Task<GiaoDich?> GetByIdAsync(Guid id);
    Task CreateAsync(GiaoDichVm vm);
    Task UpdateAsync(Guid id, GiaoDichVm vm);
    Task DeleteAsync(Guid id);
    Task<DashboardVm> GetDashboardAsync();
}
