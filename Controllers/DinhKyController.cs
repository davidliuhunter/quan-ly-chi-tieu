using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyChiTieu.Mvc.Data;
using QuanLyChiTieu.Mvc.Models.Entities;
using QuanLyChiTieu.Mvc.Models.ViewModels;

namespace QuanLyChiTieu.Mvc.Controllers;

public class DinhKyController : Controller
{
    private readonly AppDbContext _db;
    public DinhKyController(AppDbContext db) => _db = db;

    private IActionResult CheckAuth()
    {
        if (HttpContext.Session.GetString("IsAdmin") != "true")
            return RedirectToAction("Login", "Auth");
        return null!;
    }

    public async Task<IActionResult> Index()
    {
        var auth = CheckAuth(); if (auth != null) return auth;
        try { var items=await _db.GiaoDichDinhKys.Include(g=>g.DanhMuc).OrderByDescending(g=>g.NextDate).ToListAsync();ViewBag.Categories=await _db.DanhMucs.ToListAsync();return View(items); }
        catch { ViewBag.Categories=new List<DanhMuc>();return View(new List<GiaoDichDinhKy>()); }
    }

    [HttpPost]
    public async Task<IActionResult> Create(GiaoDichDinhKyVm vm)
    {
        var auth = CheckAuth(); if (auth != null) return auth;
        if (!ModelState.IsValid) { TempData["Error"] = "Vui lòng kiểm tra thông tin."; return RedirectToAction(nameof(Index)); }
        try { _db.GiaoDichDinhKys.Add(new GiaoDichDinhKy{Amount=vm.Amount,Type=vm.Type,CategoryId=vm.CategoryId,Description=vm.Description,Frequency=vm.Frequency,NextDate=vm.NextDate,IsActive=vm.IsActive});await _db.SaveChangesAsync();TempData["Success"]="Đã thêm!"; } catch { TempData["Error"]="Lỗi database."; }
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    public async Task<IActionResult> Edit(GiaoDichDinhKyVm vm)
    {
        var auth = CheckAuth(); if (auth != null) return auth;
        try { var entity=await _db.GiaoDichDinhKys.FindAsync(vm.Id);if(entity==null)return RedirectToAction(nameof(Index));entity.Amount=vm.Amount;entity.Type=vm.Type;entity.CategoryId=vm.CategoryId;entity.Description=vm.Description;entity.Frequency=vm.Frequency;entity.NextDate=vm.NextDate;entity.IsActive=vm.IsActive;await _db.SaveChangesAsync();TempData["Success"]="Đã cập nhật!"; } catch { TempData["Error"]="Lỗi database."; }
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    public async Task<IActionResult> Delete(Guid id)
    {
        var auth = CheckAuth(); if (auth != null) return auth;
        try { var entity=await _db.GiaoDichDinhKys.FindAsync(id);if(entity!=null){_db.GiaoDichDinhKys.Remove(entity);await _db.SaveChangesAsync();}TempData["Success"]="Đã xóa!"; } catch { TempData["Error"]="Lỗi database."; }
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    public async Task<IActionResult> Toggle(Guid id)
    {
        var auth = CheckAuth(); if (auth != null) return auth;
        try { var entity=await _db.GiaoDichDinhKys.FindAsync(id);if(entity!=null){entity.IsActive=!entity.IsActive;await _db.SaveChangesAsync();} } catch { }
        return RedirectToAction(nameof(Index));
    }
}
