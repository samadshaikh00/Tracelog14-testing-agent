const { setWorldConstructor } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs-extra');

class CustomWorld {
  constructor() {
    this.agents = [];
    this.currentAgent = null;
    this.browser = null;
    this.context = null;
    this.page = null;
    // Create screenshots directory
    this.screenshotDir = path.join(__dirname, '..', '..', 'screenshots');
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  async initBrowser() {
    if (this.browser) return;
    
    this.browser = await chromium.launch({  
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        '--autoplay-policy=no-user-gesture-required',
        '--window-size=1920,1080'
      ]
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      permissions: ['microphone'],
    });

    this.page = await this.context.newPage();
  }

  async takeScreenshot(screenshotName) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${screenshotName}_${timestamp}.png`;
      const filepath = path.join(this.screenshotDir, filename);
      
      await this.page.screenshot({ path: filepath, fullPage: true });
      console.log(`Screenshot saved: ${filepath}`);
      return filepath;
    } catch (error) {
      console.log('Error taking screenshot:', error.message);
      return null;
    }
  }

  setCurrentAgent(rowIndex) {
    if (rowIndex >= 0 && rowIndex < this.agents.length) {
      this.currentAgent = this.agents[rowIndex];
      console.log(`Set current agent to: ${this.currentAgent.username}`);
    } else {
      throw new Error(`Invalid row index: ${rowIndex}. Available agents: ${this.agents.length}`);
    }
  }

  async checkReadyState() {
    try {
      const content = await this.page.content();
      const pageContent = content.toLowerCase();
      
      const readyIndicators = [
        'ready',
        'available',
        'online',
        'status: ready',
        'agent ready',
        'ready to accept calls',
        'state: ready',
        'current status: ready'
      ];
      
      const isReady = readyIndicators.some(indicator => 
        pageContent.includes(indicator.toLowerCase())
      );
      
      console.log(`Ready state check result: ${isReady}`);
      return isReady;
    } catch (error) {
      console.log('Error checking ready state:', error.message);
      return false;
    }
  }

  async closeBrowser() {
    if (this.context) {
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
    this.page = null;
    this.context = null;
    this.browser = null;
  }
}

setWorldConstructor(CustomWorld);