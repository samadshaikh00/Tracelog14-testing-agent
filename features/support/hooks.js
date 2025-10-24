const { AfterAll, Before, After, BeforeAll, setDefaultTimeout } = require('@cucumber/cucumber');
const fs = require('fs-extra');
const csv = require('csv-parser');
const path = require('path');
const playwright = require('playwright');

let globalAgents = [];


setDefaultTimeout(60 * 60 * 1000);

BeforeAll(async function () {

  console.log('Loading agents From CSV...');

  // Load agents
  const agentsCsvPath = path.join(__dirname, '..', '..', 'data', 'agents.csv');
  if (fs.existsSync(agentsCsvPath)) {
    globalAgents = await new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(agentsCsvPath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          console.log(`Loaded ${results.length} agents from CSV`);
          resolve(results);
        })
        .on('error', reject);
    });
  } else {
    console.warn(`Agents CSV file not found at: ${agentsCsvPath}`);
  }

  
});

Before(async function () {
  this.agents = [...globalAgents];
});



Before(async function (scenario) {
  const videosDir = path.join(process.cwd(), 'videos');
  if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
  }
  this.browser = await playwright.chromium.launch({ 
    headless: true 
  });
  this.context = await this.browser.newContext({
    recordVideo: {
      dir: videosDir,
      size: { width: 1920, height: 1080 }
    }
  });

  this.page = await this.context.newPage();
  this.videoInfo = {
    scenarioName: scenario.pickle.name,
    startTime: new Date()
  };
});

After(async function (scenario) {
  const result = scenario.result?.status;

  try {
    if (this.page && !this.page.isClosed()) {
      const video = this.page.video();
      await this.context.close();  // close first to finalize

      if (video) {
        // Wait briefly for video to be fully saved
        await new Promise(resolve => setTimeout(resolve, 1000));
        const videoPath = await video.path();

        if (videoPath && fs.existsSync(videoPath)) {
          const scenarioName = scenario.pickle.name.replace(/[^a-zA-Z0-9]/g, '_');
          const status = result || 'unknown';
          const newVideoPath = path.join(
            path.dirname(videoPath),
            `${status}-${scenarioName} - ${new Date().getUTCHours()}:${new Date().getUTCMinutes()}.webm`
          );

          fs.renameSync(videoPath, newVideoPath);
          console.log(`Video saved : ${newVideoPath}`);
        } else {
          console.log("Video did not save properly!");
        }
      } else {
        console.log("No video object returned.");
      }
    }
  } catch (error) {
    console.error('Error saving video:', error);
  } finally {
    if (this.browser && this.browser.isConnected()) {
      await this.browser.close();
      console.log('Browser closed');
    }
  }
  console.log('Scenario completed');
});


AfterAll(async function () {
  console.log('All tests completed');

  
  const screenshotsDir = path.join(__dirname, '..', '..', 'screenshots');
  if (fs.existsSync(screenshotsDir)) {
    const files = await fs.readdir(screenshotsDir);
    console.log(`Screenshots available: ${files.length} files in ${screenshotsDir}`);
  }
});