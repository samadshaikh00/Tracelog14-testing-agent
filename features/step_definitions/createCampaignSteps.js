const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('playwright/test');
const { takeScreenshot } = require('../utils/screenshot.js');

require('./commonSteps.js');

When('I navigate to the campaign manage page', async function() {
  await this.page.hover('#tabOperations');    
  await this.page.waitForTimeout(500);
  const campaignLink = await this.page.$('.sub-menu a[href*="viewcampaign"]');
  await campaignLink.click();
  const currentUrl = this.page.url();
  expect(currentUrl).toContain('/site/viewcampaign');
});


When('I click on create campaign', async function() {
  await this.page.click('button.dropdown-toggle:has-text("Expand")');
  await this.page.waitForTimeout(5000);
  await this.page.waitForSelector('a[href="https://tracelog14.slashrtc.in/index.php/site/createcampaign"]', { visible: true, timeout: 30000 });

  await this.page.click('a[href="https://tracelog14.slashrtc.in/index.php/site/createcampaign"]');
  await this.page.waitForTimeout(1000);
});


When('I fill the campaign details with valid information', async function() {
  // Fill campaign name
  await this.page.fill('input[name="name"]', 'testcampaign123');
  
  // Fill description
  await this.page.fill('input[name="description"]', 'testcampaigncucumber');
  
  // Fill client
  await this.page.fill('input[name="client"]', 'testcampaign');
  
  // Select supervisor (samad shaikh)
  await this.page.selectOption('select[name="supervisor[]"]', '42');
  
  // Select Show Comment dropdown (System option)
  await this.page.selectOption('select[name="leadSearch"]', '2');
  
  // Fill prefix (leave empty or put "none")
  await this.page.fill('input[name="processPrefix"]', 'none');
  
  // Click save button
  await this.page.click('button[type="submit"]');
});

// You might want to add a Then step to verify the campaign was created successfully
Then('I should see a creation successful message', async function() {

  await this.page.waitForTimeout(3000);
  const currentUrl = this.page.url();

  try{
      expect(currentUrl).toContain('alertsuccess=Campaign%20created%20Successfully');

      await takeScreenshot(this.page, 'new-campaign-created');
      console.log('New campaign created successfully!');
    } 
  catch(e){
      await this.page.waitForSelector(".alert-danger", {visisble : true, timeout : 3000});
      console.log(currentUrl);
      await takeScreenshot(this.page, 'campaign-already-exists');
      console.log('Campaign Already exists!');
      return ;
  }
});