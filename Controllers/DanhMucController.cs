using Microsoft.AspNetCore.Mvc;
using QuanLyChiTieu.Mvc.Models.ViewModels;
using QuanLyChiTieu.Mvc.Services;

namespace QuanLyChiTieu.Mvc.Controllers;

public class DanhMucController : Controller
{
    private readonly IDanhMucService _svc;

    public DanhMucController(IDanhMucService svc) => _svc = svc;

    private IActionResult CheckAuth()
    {
        if (HttpContext.Session.GetString("IsAdmin") != "true")
            return RedirectToAction("Login", "Auth");
        return null!;
    }

    public async Task<IActionResult> Index()
    {
        var auth = CheckAuth(); if (auth != null) return auth;
        var categories = await _svc.GetAllAsync();
        return View(categories);
    }

    [HttpPost]
    public async Task<IActionResult> Create(DanhMucVm vm)
    {
        var auth = CheckAuth(); if (auth != null) return auth;
        if (!ModelState.IsValid)
        {
            TempData["Error"] = "Vui lòng điền đầy đủ thông tin.";
            return RedirectToAction(nameof(Index));
        }
        await _svc.CreateAsync(vm);
        TempData["Success"] = "Đã thêm danh mục!";
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    public async Task<IActionResult> Edit(DanhMucVm vm)
    {
        var auth = CheckAuth(); if (auth != null) return auth;
        if (!ModelState.IsValid || vm.Id == null)
        {
            TempData["Error"] = "Dữ liệu không hợp lệ.";
            return RedirectToAction(nameof(Index));
        }
        await _svc.UpdateAsync(vm.Id.Value, vm);
        TempData["Success"] = "Đã cập nhật danh mục!";
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    public async Task<IActionResult> Delete(Guid id)
    {
        var auth = CheckAuth(); if (auth != null) return auth;
        await _svc.DeleteAsync(id);
        TempData["Success"] = "Đã xóa danh mục!";
        return RedirectToAction(nameof(Index));
    }
}
