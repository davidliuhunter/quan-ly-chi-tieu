using Microsoft.AspNetCore.Mvc;

namespace QuanLyChiTieu.Mvc.Controllers;

public class AuthController : Controller
{
    private const string AdminPassword = "qltc2026";

    public IActionResult Index()
    {
        if (HttpContext.Session.GetString("IsAdmin") == "true")
            return RedirectToAction("Index", "Dashboard");
        return RedirectToAction("Login");
    }

    [HttpGet]
    public IActionResult Login()
    {
        // Đã đăng nhập → redirect Dashboard
        if (HttpContext.Session.GetString("IsAdmin") == "true")
            return RedirectToAction("Index", "Dashboard");

        return View();
    }

    [HttpPost]
    public IActionResult Login(string password)
    {
        if (password == AdminPassword)
        {
            HttpContext.Session.SetString("IsAdmin", "true");
            return RedirectToAction("Index", "Dashboard");
        }

        ViewBag.Error = "Mật khẩu không đúng. Vui lòng thử lại.";
        return View();
    }

    public IActionResult Logout()
    {
        HttpContext.Session.Remove("IsAdmin");
        return RedirectToAction("Login");
    }
}
