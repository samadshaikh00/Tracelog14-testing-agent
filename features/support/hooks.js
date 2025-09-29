
const { AfterAll, Before, After, BeforeAll, setDefaultTimeout } = require('@cucumber/cucumber');
const fs = require('fs-extra');
const csv = require('csv-parser');
const path = require('path');

// Store agents globally
let globalAgents = [];
setDefaultTimeout(60 * 1000);

BeforeAll(async function () {
  console.log('Loading agents from CSV (once)...');
  const csvPath = path.join(__dirname, '..', '..', 'data', 'agents.csv');
  
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found at: ${csvPath}`);
  }
  
  globalAgents = await new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        console.log(`Loaded ${results.length} agents from CSV`);
        resolve(results);
      })
      .on('error', reject);
  });
});

Before(async function () {
  console.log('Starting scenario...');
  

  this.agents = [...globalAgents];
  console.log(`Assigned ${this.agents.length} agents to scenario`);

  // Create a new instance for each scenario
  // This is where you would add your code to create a new browser instance
  // For example:
  // this.browser = await puppeteer.launch();
  // this.page = await this.browser.newPage();
});

After(async function () {
  // Take screenshot only at the end of the scenario (final screen)
  if (this.page) {
    try {
      const scenarioName = this.scenario?.name || 'unknown-scenario';
      const sanitizedName = scenarioName.replace(/[^a-zA-Z0-9]/g, '_');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotPath = path.join(__dirname, '..', '..', 'screenshots', `${sanitizedName}_${timestamp}.png`);
      
      // Ensure screenshots directory exists
      await fs.ensureDir(path.dirname(screenshotPath));
      
      // Take screenshot
      await this.page.screenshot({ 
        path: screenshotPath, 
        fullPage: true 
      });
      
      console.log(`Screenshot saved: ${screenshotPath}`);
    } catch (error) {
      console.error('Failed to take screenshot:', error.message);
    }
  }

  // Clean up browser instance
  if (this.browser) {
    await this.browser.close();
    console.log('Browser closed');
  }

  console.log('Scenario completed');
});

AfterAll(async function () {
  console.log('All tests completed');
  
  // Optional: Clean up old screenshots (keep only from last run) or provide info
  const screenshotsDir = path.join(__dirname, '..', '..', 'screenshots');
  if (fs.existsSync(screenshotsDir)) {
    const files = await fs.readdir(screenshotsDir);
    console.log(`Screenshots available: ${files.length} files in ${screenshotsDir}`);
  }
});