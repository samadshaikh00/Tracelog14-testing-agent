const fs = require('fs');
const path = require('path');

/**
 * A reusable function to take screenshots and save them in a screenshots directory.
 * @param {Object} page - Playwright or Puppeteer page object.
 * @param {string} name - A custom name for the screenshot.
 * @param {string} [screenshotsDir] - Directory to save screenshots; defaults to './screenshots'.
 */

 
async function takeScreenshot(page, name, screenshotsDir = path.join(process.cwd(), 'screenshots')) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(screenshotsDir, `${name}_${timestamp}.png`);
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  await page.screenshot({ path: filePath, fullPage: true });
  return filePath;
}

module.exports = { takeScreenshot };
