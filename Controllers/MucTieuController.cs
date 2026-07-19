using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyChiTieu.Mvc.Data;
using QuanLyChiTieu.Mvc.Models.Entities;
using QuanLyChiTieu.Mvc.Models.ViewModels;

namespace QuanLyChiTieu.Mvc.Controllers;

public class MucTieuController : Controller
{
    private readonly AppDbContext _db;
    public MucTieuController(AppDbContext db) => _db = db;

    private IActionResult CheckAuth()
    {
        if (HttpContext.Session.GetString("IsAdmin") != "true")
            return RedirectToAction("Login", "Auth");
        return null!;
    }

    public async Task<IActionResult> Index()
    {
        var auth = CheckAuth(); if (auth != null) return auth;
        try { var goals = await _db.MucTieus.OrderByDescending(m => m.IsCompleted).ThenByDescending(m => m.CreatedAt).ToListAsync(); return View(goals); }
        catch { return View(new List<MucTieu>()); }
    }

    [HttpPost]
    public async Task<IActionResult> Create(MucTieuVm vm)
    {
        var auth = CheckAuth(); if (auth != null) return auth;
        if (!ModelState.IsValid) { TempData["Error"] = "Vui lòng kiểm tra thông tin."; return RedirectToAction(nameof(Index)); }
        try { _db.MucTieus.Add(new MucTieu { Name=vm.Name,TargetAmount=vm.TargetAmount,CurrentAmount=vm.CurrentAmount,Deadline=vm.Deadline,Icon=vm.Icon,Color=vm.Color }); await _db.SaveChangesAsync(); TempData["Success"]="Đã thêm mục tiêu!"; } catch { TempData["Error"]="Lỗi database."; }
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    public async Task<IActionResult> Edit(MucTieuVm vm)
    {
        var auth = CheckAuth(); if (auth != null) return auth;
        try { var entity=await _db.MucTieus.FindAsync(vm.Id); if(entity==null)return RedirectToAction(nameof(Index)); entity.Name=vm.Name;entity.TargetAmount=vm.TargetAmount;entity.CurrentAmount=vm.CurrentAmount;entity.Deadline=vm.Deadline;entity.Icon=vm.Icon;entity.Color=vm.Color;entity.IsCompleted=vm.CurrentAmount>=vm.TargetAmount;await _db.SaveChangesAsync();TempData["Success"]="Đã cập nhật mục tiêu!"; } catch { TempData["Error"]="Lỗi database."; }
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    public async Task<IActionResult> Delete(Guid id)
    {
        var auth = CheckAuth(); if (auth != null) return auth;
        try { var entity=await _db.MucTieus.FindAsync(id);if(entity!=null){_db.MucTieus.Remove(entity);await _db.SaveChangesAsync();}TempData["Success"]="Đã xóa mục tiêu!"; } catch { TempData["Error"]="Lỗi database."; }
        return RedirectToAction(nameof(Index));
    }
}
