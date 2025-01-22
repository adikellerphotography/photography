
import puppeteer from 'puppeteer';
import path from 'path';

export async function captureScreenshot() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  // Set dark theme via localStorage
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('theme', 'dark');
  });
  
  await page.goto('http://localhost:5000', { waitUntil: 'networkidle0' });
  
  const screenshotPath = path.join(process.cwd(), 'attached_assets', 'website_backup_dark.jpeg');
  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
    type: 'jpeg',
    quality: 100
  });

  await browser.close();
  return screenshotPath;
}
