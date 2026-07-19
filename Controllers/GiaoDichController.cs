using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using QuanLyChiTieu.Mvc.Models.ViewModels;
using QuanLyChiTieu.Mvc.Services;

namespace QuanLyChiTieu.Mvc.Controllers;

public class GiaoDichController : Controller
{
    private readonly IGiaoDichService _giaoDichSvc;
    private readonly IDanhMucService _danhMucSvc;

    public GiaoDichController(IGiaoDichService giaoDichSvc, IDanhMucService danhMucSvc)
    {
        _giaoDichSvc = giaoDichSvc;
        _danhMucSvc = danhMucSvc;
    }

    private IActionResult CheckAuth()
    {
        if (HttpContext.Session.GetString("IsAdmin") != "true")
            return RedirectToAction("Login", "Auth");
        return null!;
    }

    public async Task<IActionResult> Index(string? filterType, string? q, DateOnly? dateFrom, DateOnly? dateTo, long? amountMin, long? amountMax)
    {
        var auth = CheckAuth(); if (auth != null) return auth;

        var allTx = await _giaoDichSvc.GetAllAsync(200);

        // Filter
        var filtered = allTx.AsEnumerable();
        if (!string.IsNullOrEmpty(filterType) && filterType != "all")
            filtered = filtered.Where(t => t.Type == filterType);
        if (!string.IsNullOrEmpty(q))
            filtered = filtered.Where(t =>
                (t.Description?.Contains(q, StringComparison.OrdinalIgnoreCase) == true) ||
                (t.DanhMuc?.Name?.Contains(q, StringComparison.OrdinalIgnoreCase) == true));
        if (dateFrom.HasValue)
            filtered = filtered.Where(t => t.TransactionDate >= dateFrom.Value);
        if (dateTo.HasValue)
            filtered = filtered.Where(t => t.TransactionDate <= dateTo.Value);
        if (amountMin.HasValue)
            filtered = filtered.Where(t => t.Amount >= amountMin.Value);
        if (amountMax.HasValue)
            filtered = filtered.Where(t => t.Amount <= amountMax.Value);

        var vm = new GiaoDichListVm
        {
            Items = filtered.Select(t => new GiaoDichItemVm
            {
                Id = t.Id,
                Amount = t.Amount,
                Type = t.Type,
                CategoryId = t.CategoryId,
                CategoryName = t.DanhMuc?.Name,
                CategoryIcon = t.DanhMuc?.Icon,
                CategoryColor = t.DanhMuc?.Color,
                Description = t.Description,
                TransactionDate = t.TransactionDate.ToString("dd/MM/yyyy")
            }).ToList(),
            FilterType = filterType ?? "all",
            SearchQuery = q,
            DateFrom = dateFrom,
            DateTo = dateTo,
            AmountMin = amountMin,
            AmountMax = amountMax
        };

        ViewBag.Categories = await _danhMucSvc.GetAllAsync();
        return View(vm);
    }

    [HttpPost]
    public async Task<IActionResult> Create(GiaoDichVm vm)
    {
        var auth = CheckAuth(); if (auth != null) return auth;

        if (!ModelState.IsValid)
        {
            TempData["Error"] = "Vui lòng kiểm tra lại thông tin.";
            return RedirectToAction(nameof(Index));
        }

        await _giaoDichSvc.CreateAsync(vm);
        TempData["Success"] = "Đã thêm giao dịch!";
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    public async Task<IActionResult> Edit(GiaoDichVm vm)
    {
        var auth = CheckAuth(); if (auth != null) return auth;

        if (!ModelState.IsValid || vm.Id == null)
        {
            TempData["Error"] = "Dữ liệu không hợp lệ.";
            return RedirectToAction(nameof(Index));
        }

        await _giaoDichSvc.UpdateAsync(vm.Id.Value, vm);
        TempData["Success"] = "Đã cập nhật giao dịch!";
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    public async Task<IActionResult> Delete(Guid id)
    {
        var auth = CheckAuth(); if (auth != null) return auth;

        await _giaoDichSvc.DeleteAsync(id);
        TempData["Success"] = "Đã xóa giao dịch!";
        return RedirectToAction(nameof(Index));
    }
}
