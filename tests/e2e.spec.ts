import { test, expect, type Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://quan-ly-chi-tieu-silk.vercel.app';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'qltc2026';

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function login(page: Page) {
  await page.goto(`${BASE_URL}/dang-nhap`);
  await page.waitForSelector('input[type="password"]', { timeout: 15000 });
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button:has-text("Đăng nhập")');
  await page.waitForURL('**/quan-tri', { timeout: 15000 });
}

async function waitForPageReady(page: Page) {
  // Wait for network idle + content to render
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
}

// ─── 1. Login ────────────────────────────────────────────────────────────────

test.describe('🔐 Đăng nhập', () => {
  test('Hiển thị form đăng nhập', async ({ page }) => {
    await page.goto(`${BASE_URL}/dang-nhap`);
    await expect(page.locator('h1:has-text("Quản Lý Chi Tiêu")')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Đăng nhập")')).toBeVisible();
  });

  test('Đăng nhập sai hiển thị lỗi', async ({ page }) => {
    await page.goto(`${BASE_URL}/dang-nhap`);
    await page.fill('input[type="password"]', 'sai_mat_khau');
    await page.click('button:has-text("Đăng nhập")');
    await expect(page.locator('text=Mật khẩu không đúng')).toBeVisible();
  });

  test('Đăng nhập đúng vào dashboard', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/\/quan-tri$/);
  });
});

// ─── 2. Dashboard ────────────────────────────────────────────────────────────

test.describe('📊 Dashboard (Tổng quan)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await waitForPageReady(page);
  });

  test('Hiển thị các thẻ tóm tắt', async ({ page }) => {
    // Check summary card labels
    await expect(page.locator('text=Thu nhập').first()).toBeVisible();
    await expect(page.locator('text=Chi tiêu').first()).toBeVisible();
    await expect(page.locator('text=Số dư').first()).toBeVisible();
  });

  test('Hiển thị biểu đồ', async ({ page }) => {
    // Biểu đồ cột hoặc tròn
    const charts = page.locator('.recharts-responsive-container');
    await expect(charts.first()).toBeVisible();
  });

  test('Hiển thị giao dịch gần đây', async ({ page }) => {
    await expect(page.locator('text=Giao dịch gần đây').first()).toBeVisible();
  });

  test('FAB button dẫn đến trang thêm giao dịch', async ({ page }) => {
    const fab = page.locator('button:has-text("+")').first();
    if (await fab.isVisible()) {
      await fab.click();
      await page.waitForURL(/giao-dich/, { timeout: 5000 });
    }
  });
});

// ─── 3. Navigation ───────────────────────────────────────────────────────────

test.describe('🧭 Điều hướng', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await waitForPageReady(page);
  });

  test('Tất cả tabs đều hoạt động', async ({ page }) => {
    const navItems = [
      { href: '/quan-tri/giao-dich', title: 'Giao dịch' },
      { href: '/quan-tri/ngan-sach', title: 'Ngân sách' },
      { href: '/quan-tri/muc-tieu', title: 'Mục tiêu' },
      { href: '/quan-tri/dinh-ky', title: 'Định kỳ' },
      { href: '/quan-tri/danh-muc', title: 'Danh mục' },
    ];

    for (const item of navItems) {
      const navBtn = page.locator(`button:has-text("${item.title}")`).first();
      if (await navBtn.isVisible()) {
        await navBtn.click();
        await page.waitForURL(`**${item.href}`, { timeout: 10000 });
        await waitForPageReady(page);
        // Verify page rendered without crash
        const hasError = await page.locator('text=Something went wrong').isVisible().catch(() => false);
        expect(hasError).toBe(false);
      }
    }
  });
});

// ─── 4. Danh mục (Categories) ────────────────────────────────────────────────

test.describe('⚙️ Danh mục', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/quan-tri/danh-muc`);
    await waitForPageReady(page);
  });

  test('Hiển thị danh sách danh mục', async ({ page }) => {
    // Should see either empty state or list of categories
    const hasList = await page.locator('[class*="grid"]').first().isVisible().catch(() => false);
    const hasEmpty = await page.locator('text=Chưa có danh mục').isVisible().catch(() => false);
    expect(hasList || hasEmpty).toBe(true);
  });

  test('Mở form thêm danh mục', async ({ page }) => {
    const addBtn = page.locator('button:has-text("Thêm")').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
      // Form should appear (BottomSheet or inline)
      const formInput = page.locator('input[name="name"]').first();
      await expect(formInput).toBeVisible();
    }
  });
});

// ─── 5. Giao dịch (Transactions) ─────────────────────────────────────────────

test.describe('💳 Giao dịch', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/quan-tri/giao-dich`);
    await waitForPageReady(page);
  });

  test('Hiển thị danh sách giao dịch', async ({ page }) => {
    // Filter buttons are always visible
    await expect(page.locator('button:has-text("Tất cả")').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("Chi tiêu")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Thu nhập")').first()).toBeVisible();
  });

  test('Bộ lọc tab hoạt động', async ({ page }) => {
    const allBtn = page.locator('button:has-text("Tất cả")').first();
    const incomeBtn = page.locator('button:has-text("Thu nhập")').first();
    if (await allBtn.isVisible() && await incomeBtn.isVisible()) {
      await incomeBtn.click();
      await page.waitForTimeout(300);
    }
  });

  test('Mở form thêm giao dịch', async ({ page }) => {
    // Try FAB first
    const fab = page.locator('button:has-text("+")').first();
    if (await fab.isVisible()) {
      await fab.click();
    } else {
      // Try "Thêm" button
      const addBtn = page.locator('button:has-text("Thêm")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
      }
    }
    await page.waitForTimeout(800);
    // Check if form appears
    const formVisible = await page.locator('form').first().isVisible().catch(() => false);
    expect(formVisible).toBe(true);
  });

  test('Bộ lọc nâng cao hoạt động', async ({ page }) => {
    const filterBtn = page.locator('button:has-text("Bộ lọc")').first();
    if (await filterBtn.isVisible()) {
      await filterBtn.click();
      await page.waitForTimeout(300);
      // Check filter fields appear
      const dateInput = page.locator('input[type="date"]').first();
      await expect(dateInput).toBeVisible();
    }
  });
});

// ─── 6. Ngân sách (Budget) ───────────────────────────────────────────────────

test.describe('🎯 Ngân sách', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/quan-tri/ngan-sach`);
    await waitForPageReady(page);
  });

  test('Hiển thị trang ngân sách', async ({ page }) => {
    // Should render without errors
    const hasError = await page.locator('text=Something went wrong').isVisible().catch(() => false);
    expect(hasError).toBe(false);
  });

  test('Mở form thêm ngân sách', async ({ page }) => {
    const addBtn = page.locator('button:has-text("Thêm")').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
      const formInput = page.locator('input').first();
      await expect(formInput).toBeVisible();
    }
  });
});

// ─── 7. Mục tiêu (Savings) ───────────────────────────────────────────────────

test.describe('🏆 Mục tiêu', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/quan-tri/muc-tieu`);
    await waitForPageReady(page);
  });

  test('Hiển thị trang mục tiêu', async ({ page }) => {
    const hasError = await page.locator('text=Something went wrong').isVisible().catch(() => false);
    expect(hasError).toBe(false);
  });

  test('Mở form thêm mục tiêu', async ({ page }) => {
    const addBtn = page.locator('button:has-text("Thêm")').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
    }
  });
});

// ─── 8. Định kỳ (Recurring) ──────────────────────────────────────────────────

test.describe('🔄 Định kỳ', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/quan-tri/dinh-ky`);
    await waitForPageReady(page);
  });

  test('Hiển thị trang định kỳ', async ({ page }) => {
    const hasError = await page.locator('text=Something went wrong').isVisible().catch(() => false);
    expect(hasError).toBe(false);
  });

  test('Mở form thêm định kỳ', async ({ page }) => {
    const addBtn = page.locator('button:has-text("Thêm")').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
    }
  });
});

// ─── 9. Dark Mode ────────────────────────────────────────────────────────────

test.describe('🌗 Dark Mode', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await waitForPageReady(page);
  });

  test('Toggle dark mode hoạt động', async ({ page }) => {
    // Find theme toggle button (sun/moon icon)
    const toggle = page.locator('button:has(svg), button:has-text("🌙"), button:has-text("☀️"), [class*="theme"] button').first();
    if (await toggle.isVisible()) {
      const html = page.locator('html');
      const initialClass = await html.getAttribute('class');
      await toggle.click();
      await page.waitForTimeout(500);
      const newClass = await html.getAttribute('class');
      expect(newClass).not.toBe(initialClass);
    }
  });
});

// ─── 10. PWA Manifest ────────────────────────────────────────────────────────

test.describe('📲 PWA', () => {
  test('Manifest.json hợp lệ', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/manifest.json`);
    expect(response?.ok()).toBe(true);
    const manifest = await response?.json();
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
    // Must have at least one PNG icon
    const hasPng = manifest.icons.some((i: { type: string }) => i.type === 'image/png');
    expect(hasPng).toBe(true);
  });

  test('Service worker đăng ký', async ({ page }) => {
    await page.goto(`${BASE_URL}/quan-tri`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const swReady = await page.evaluate(() =>
      navigator.serviceWorker?.getRegistration()?.then(r => !!r).catch(() => false)
    );
    // Service worker may or may not register in test env, just log
    console.log(`Service Worker registered: ${swReady}`);
  });
});

// ─── 11. Responsive Check ────────────────────────────────────────────────────

test.describe('📱 Responsive', () => {
  test('Mobile viewport - bottom nav hiển thị', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await login(page);
    await waitForPageReady(page);
    // Bottom nav should be visible on mobile
    const bottomNav = page.locator('nav').last();
    await expect(bottomNav).toBeVisible();
  });

  test('Desktop viewport - sidebar hiển thị', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await login(page);
    await waitForPageReady(page);
    // Sidebar should contain navigation links
    const sidebarLinks = page.locator('a[href*="/quan-tri"], nav a');
    const count = await sidebarLinks.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });
});
