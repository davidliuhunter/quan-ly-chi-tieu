using Microsoft.EntityFrameworkCore;
using QuanLyChiTieu.Mvc.Data;
using QuanLyChiTieu.Mvc.Models.Entities;
using QuanLyChiTieu.Mvc.Models.ViewModels;

namespace QuanLyChiTieu.Mvc.Services;

public class DanhMucService : IDanhMucService
{
    private readonly AppDbContext _db;
    private readonly ILogger<DanhMucService> _log;
    public DanhMucService(AppDbContext db, ILogger<DanhMucService> log) { _db = db; _log = log; }

    public async Task<List<DanhMuc>> GetAllAsync()
    { try { return await _db.DanhMucs.OrderByDescending(d=>d.Type).ThenBy(d=>d.Name).ToListAsync(); } catch(Exception ex){_log.LogWarning(ex,"DB unavailable");return new();} }

    public async Task<List<DanhMuc>> GetByTypeAsync(string type)
    { try { return await _db.DanhMucs.Where(d=>d.Type==type).OrderBy(d=>d.Name).ToListAsync(); } catch(Exception ex){_log.LogWarning(ex,"DB unavailable");return new();} }

    public async Task<DanhMuc?> GetByIdAsync(Guid id)
    { try { return await _db.DanhMucs.FindAsync(id); } catch(Exception ex){_log.LogWarning(ex,"DB unavailable");return null;} }

    public async Task CreateAsync(DanhMucVm vm)
    { try { _db.DanhMucs.Add(new DanhMuc{Name=vm.Name,Type=vm.Type,Icon=vm.Icon,Color=vm.Color}); await _db.SaveChangesAsync(); } catch(Exception ex){_log.LogWarning(ex,"DB unavailable");throw;} }

    public async Task UpdateAsync(Guid id, DanhMucVm vm)
    { try { var e=await _db.DanhMucs.FindAsync(id);if(e==null)return;e.Name=vm.Name;e.Icon=vm.Icon;e.Color=vm.Color;await _db.SaveChangesAsync(); } catch(Exception ex){_log.LogWarning(ex,"DB unavailable");throw;} }

    public async Task DeleteAsync(Guid id)
    { try { var e=await _db.DanhMucs.FindAsync(id);if(e!=null){_db.DanhMucs.Remove(e);await _db.SaveChangesAsync();} } catch(Exception ex){_log.LogWarning(ex,"DB unavailable");throw;} }
}
