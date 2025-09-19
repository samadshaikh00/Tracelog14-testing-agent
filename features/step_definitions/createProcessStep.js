const { Given, Then, When } = require('@cucumber/cucumber');
const { takeScreenshot } = require('../utils/screenshot.js');
const { BASE_URL, USERNAME, PASSWORD, CAMPAIGN_MANAGE_PAGE } = require('../utils/constant.js');
const { expect } = require('playwright/test');
const assert = require('assert');


require('./commonSteps.js');

When('I navigate to the campaign view', async function(){
  await this.page.hover('#tabOperations');    
  await this.page.waitForTimeout(500);
  await takeScreenshot(this.page, 'processes-management-page');
  const campaignLink = await this.page.$(`.sub-menu a[href*="https://tracelog14.slashrtc.in/index.php/site/viewcampaign"]`);
  await campaignLink.click();
  await this.page.waitForTimeout(1000);
  const currentUrl = this.page.url();
  await takeScreenshot(this.page, 'campaign-management-page');
  expect(currentUrl).toContain(CAMPAIGN_MANAGE_PAGE);
  console.log('Navigated to the campaign management page');
});
When('I select the campaign', async function () {
  const processLink = await this.page.$(`a[href*="https://tracelog14.slashrtc.in/index.php/site/viewcampaignprocess?campaign=26"]`);
  await processLink.click();
   await this.page.waitForTimeout(1000); 
  await takeScreenshot(this.page, 'process-management-page');
});
When('I expand and select create process', async function () {
  // Click the Expand button
  const expandButton = this.page.locator('div.btn-group:has(button:has-text("Expand")) button');
  await expandButton.click();
  console.log('Dropdown expanded');
  await this.page.waitForTimeout(500); // wait for animation

  // Get the dropdown menu inside this btn-group
  const dropdownMenu = expandButton.locator('xpath=../ul[contains(@class,"dropdown-menu")]');

  // Wait for "Create Process" link to appear
  const createProcessLink = dropdownMenu.locator('a:has-text("Create Process")');
  await createProcessLink.waitFor({ state: 'visible', timeout: 10000 });
  console.log('Create Process link visible');
  await takeScreenshot(this.page, 'create-process-link-visible');

  // Click the link
  await createProcessLink.click();
  await this.page.waitForTimeout(1000);

  await takeScreenshot(this.page, 'create-process-page');
  console.log('Navigated to the Create Process page');
});


When('I fill in the process details with the required information', async function(){

  function getRandomLetter() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    return letters[Math.floor(Math.random() + 5 * letters.length)];
  }
  
  let processName = getRandomLetter(); 
  console.log("processName: ", processName)
  
  await this.page.fill('input[name="name"]', 'testprocess123');
  await this.page.waitForSelector('textarea[name="description"]', 'testprocesscucumber');
  await this.page.selectOption('select[id="expiryType"]', 'NEVER')
  await this.page.selectOption('select[name="calling_mode"]', 'Manual')
  await this.page.click('#selectAllFirstLevelDispose')
  // await this.page.selectOption('selector[type="search"]', 'TestCall')
  await this.page.fill('input[name="processPrefix"]', 'none');
  await this.page.click('button[id="createProcess"]');
  await takeScreenshot(this.page, 'process-details-filled');
  console.log('Process details filled successfully!');
});




Then("I should see a successful message", async function() {
  await this.page.waitForTimeout(3000);
  const currentUrl = this.page.url();

  try{
      expect(currentUrl).toContain('alertsuccess=process%20created%20Successfully.&campaign=');

      await takeScreenshot(this.page, 'new-campaign-created');
      console.log('New Process created successfully!');
    } 
  catch(e){
      await this.page.waitForSelector(".alert-danger", {visisble : true, timeout : 3000});
      console.log(currentUrl);
      await takeScreenshot(this.page, 'process-already-exists');
      console.log('process Already exists!');
      this.page.goto('https://tracelog14.slashrtc.in/index.php/site/viewcampaignprocess?campaign=29');
      return ;
  }
})

//  gateway mapping only for new process



When("I Add gateway", async function(){
  await this.page.waitForTimeout(3000);
  console.log('clicking on the action button');
  await this.page.click('button.btn.btn-default.btn-xs.dropdown-toggle.btnsettings');
  await this.page.waitForTimeout(3000);
  console.log('Action button clicked!');
  await takeScreenshot(this.page, 'action-button-clicked');
  
  await this.page.hover('a:has-text("Gateway Mapping")');
  await takeScreenshot(this.page, 'add-gateway-hover');
  await this.page.click('a:has-text("Add Gateway")');
  await this.page.waitForTimeout(3000);
  await takeScreenshot(this.page, 'clicked-on-add-gateway');
  console.log('clicked on add gateway!!!!');

  await this.page.locator('div#relevant-parent .select2-selection--multiple').click();
  await this.page.locator('input.select2-search__field').fill('slashGateway');

  await this.page.waitForTimeout(1000);
  
  
  await this.page.type('.select2-search__field', 'slashGateway');
  await this.page.waitForTimeout(1000);
  
  
  await this.page.click('#select2-addGatewaySelect-result-v40k-1');
  await this.page.waitForTimeout(1000);
  
  
  await this.page.click('.saveGateway');
  await takeScreenshot(this.page, 'gateway-saved');
  console.log('Gateway saved successfully!');
});


Then('I should see success message', async function(){
  await this.page.waitForTimeout(3000);
  const successMessage = await this.page.waitForSelector('#toast-container');
  await takeScreenshot(this.page, 'slash-gateway-selected');
  expect(successMessage).toBeVisible();
});




