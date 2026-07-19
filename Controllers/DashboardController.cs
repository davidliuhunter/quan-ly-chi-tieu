using Microsoft.AspNetCore.Mvc;
using QuanLyChiTieu.Mvc.Services;

namespace QuanLyChiTieu.Mvc.Controllers;

public class DashboardController : Controller
{
    private readonly IGiaoDichService _svc;

    public DashboardController(IGiaoDichService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> Index()
    {
        if (HttpContext.Session.GetString("IsAdmin") != "true")
            return RedirectToAction("Login", "Auth");

        var data = await _svc.GetDashboardAsync();
        return View(data);
    }

    [HttpGet("Dashboard/GetData")]
    public async Task<IActionResult> GetData()
    {
        if (HttpContext.Session.GetString("IsAdmin") != "true")
            return Unauthorized();

        var data = await _svc.GetDashboardAsync();
        return Json(data);
    }
}
