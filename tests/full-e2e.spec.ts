import { test, expect, Page } from '@playwright/test';

const PASSWORD = 'qltc2026';
const BASE = 'http://localhost:5000';

async function login(page: Page) {
  await page.goto(`${BASE}/Auth/Login`);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/Dashboard**', { timeout: 10000 });
}

test.describe('Auth', () => {
  test('Hiển thị trang đăng nhập', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('h1')).toContainText('Quản Lý Chi Tiêu');
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('Từ chối mật khẩu sai', async ({ page }) => {
    await page.goto(`${BASE}/Auth/Login`);
    await page.fill('input[name="password"]', 'wrong');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/Auth\/Login/);
    await expect(page.locator('text=Mật khẩu không đúng')).toBeVisible();
  });

  test('Đăng nhập thành công → Dashboard', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/Dashboard/);
  });

  test('Đăng xuất → Login', async ({ page }) => {
    await login(page);
    await page.click('text=Đăng xuất');
    await expect(page).toHaveURL(/Auth\/Login/);
  });

  test('Chặn truy cập khi chưa login', async ({ page }) => {
    await page.goto(`${BASE}/Dashboard/Index`);
    await expect(page).toHaveURL(/Auth\/Login/);
  });
});

test.describe('Danh mục', () => {
  test.beforeEach(async ({ page }) => { await login(page); });

  test('Hiển thị danh sách danh mục', async ({ page }) => {
    await page.goto(`${BASE}/DanhMuc/Index`);
    await expect(page.locator('h1')).toContainText('Danh mục');
  });

  test('Tạo danh mục', async ({ page }) => {
    await page.goto(`${BASE}/DanhMuc/Index`);
    const name = 'TestCat' + Date.now();
    await page.click('button:has-text("Thêm mới")');
    await expect(page.locator('#modal')).toBeVisible({ timeout: 3000 });
    await page.fill('#catName', name);
    await page.click('button:has-text("Lưu")');
    await page.waitForTimeout(1000);
    await expect(page.locator(`text=${name}`).first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Giao dịch', () => {
  test.beforeEach(async ({ page }) => { await login(page); });

  test('Hiển thị danh sách giao dịch', async ({ page }) => {
    await page.goto(`${BASE}/GiaoDich/Index`);
    await expect(page.locator('h1')).toContainText('Giao dịch');
    await expect(page.locator('button:has-text("Thêm mới")')).toBeVisible();
  });

  test('Tạo giao dịch', async ({ page }) => {
    await page.goto(`${BASE}/GiaoDich/Index`);
    await page.click('button:has-text("Thêm mới")');
    await expect(page.locator('#modal')).toBeVisible({ timeout: 3000 });
    await page.fill('#txAmount', '555000');
    await page.fill('#txDate', '2026-07-15');
    await page.fill('#txDesc', 'TestPW');
    await page.click('button:has-text("Lưu")');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=TestPW').first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Ngân sách', () => {
  test.beforeEach(async ({ page }) => { await login(page); });

  test('Hiển thị trang ngân sách', async ({ page }) => {
    await page.goto(`${BASE}/NganSach/Index`);
    await expect(page.locator('h1')).toContainText('Ngân sách');
  });
});

test.describe('Mục tiêu', () => {
  test.beforeEach(async ({ page }) => { await login(page); });

  test('Hiển thị trang mục tiêu', async ({ page }) => {
    await page.goto(`${BASE}/MucTieu/Index`);
    await expect(page.locator('h1')).toContainText('Mục tiêu');
  });

  test('Tạo mục tiêu', async ({ page }) => {
    await page.goto(`${BASE}/MucTieu/Index`);
    await page.click('button:has-text("Thêm mới")');
    await page.fill('#goalName', 'Goal' + Date.now());
    await page.fill('#goalTarget', '10000000');
    await page.fill('#goalCurrent', '2000000');
    await page.click('button:has-text("Lưu")');
    await page.waitForTimeout(1000);
    await expect(page.locator('h1')).toContainText('Mục tiêu');
  });
});

test.describe('Định kỳ', () => {
  test.beforeEach(async ({ page }) => { await login(page); });

  test('Hiển thị trang định kỳ', async ({ page }) => {
    await page.goto(`${BASE}/DinhKy/Index`);
    await expect(page.locator('h1')).toContainText('Định kỳ');
  });

  test('Tạo giao dịch định kỳ', async ({ page }) => {
    await page.goto(`${BASE}/DinhKy/Index`);
    await page.click('button:has-text("Thêm mới")');
    await page.fill('#dkAmount', '500000');
    await page.fill('#dkDesc', 'TestDK');
    await page.fill('#dkNext', '2026-08-01');
    await page.click('button:has-text("Lưu")');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=TestDK').first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => { await login(page); });

  test('Hiển thị layout dashboard', async ({ page }) => {
    await page.goto(`${BASE}/Dashboard/Index`);
    await expect(page.locator('h1')).toContainText('Tổng quan');
    await expect(page.locator('text=Thu nhập tháng này')).toBeVisible();
    await expect(page.locator('text=Giao dịch gần đây')).toBeVisible();
    await expect(page.locator('text=Xem tất cả →')).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => { await login(page); });

  test('Sidebar đủ 6 mục', async ({ page }) => {
    await page.goto(`${BASE}/Dashboard/Index`);
    await expect(page.locator('a:has-text("Tổng quan")')).toBeVisible();
    await expect(page.locator('a:has-text("Giao dịch")')).toBeVisible();
    await expect(page.locator('a:has-text("Ngân sách")')).toBeVisible();
    await expect(page.locator('a:has-text("Mục tiêu")')).toBeVisible();
    await expect(page.locator('a:has-text("Định kỳ")')).toBeVisible();
    await expect(page.locator('a:has-text("Danh mục")')).toBeVisible();
  });

  test('Dark mode toggle', async ({ page }) => {
    await page.goto(`${BASE}/Dashboard/Index`);
    const before = (await page.locator('html').getAttribute('class'))?.includes('dark') ?? false;
    await page.click('#themeIcon');
    await page.waitForTimeout(300);
    const after = (await page.locator('html').getAttribute('class'))?.includes('dark') ?? false;
    expect(before).not.toBe(after);
  });
});
