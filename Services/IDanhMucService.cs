using QuanLyChiTieu.Mvc.Models.Entities;
using QuanLyChiTieu.Mvc.Models.ViewModels;

namespace QuanLyChiTieu.Mvc.Services;

public interface IDanhMucService
{
    Task<List<DanhMuc>> GetAllAsync();
    Task<List<DanhMuc>> GetByTypeAsync(string type);
    Task<DanhMuc?> GetByIdAsync(Guid id);
    Task CreateAsync(DanhMucVm vm);
    Task UpdateAsync(Guid id, DanhMucVm vm);
    Task DeleteAsync(Guid id);
}
