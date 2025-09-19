const { Before, After, setDefaultTimeout, AfterStep } = require('@cucumber/cucumber');
<<<<<<< HEAD
=======
const path = require('path');

>>>>>>> 6e9130410f0e86a20f386997f060017f6f8418b6

const playwright = require('playwright');
setDefaultTimeout(60 * 1000);



Before(async function () {
	
  this.browser = await playwright.chromium.launch({ headless: true });

  this.context = await this.browser.newContext();

  this.page = await this.context.newPage();


});


<<<<<<< HEAD
=======
AfterStep(async function ({ result }) {

    const screenshotsDir = path.join(process.cwd(), 'screenshots');
    const fs = require('fs');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const scenarioName = this.scenario?.name || 'unknown-scenario';
    const sanitizedName = scenarioName.replace(/[^a-zA-Z0-9]/g, '_');
    const screenshotPath = path.join(screenshotsDir, `${sanitizedName}_${timestamp}.png`);
    
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved: ${screenshotPath}`);
});


>>>>>>> 6e9130410f0e86a20f386997f060017f6f8418b6

After(async function () {

  if (this.browser) {

    await this.browser.close();

  }

});