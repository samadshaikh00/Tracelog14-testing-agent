const { Given, Then, When } = require('@cucumber/cucumber');
const { takeScreenshot } = require('../utils/screenshot.js');
const { expect } = require('playwright/test');
const assert = require('assert');



Given('I am logged in as an admin', async function(){
  await this.page.goto('https://tracelog14.slashrtc.in/index.php/login');
  await this.page.fill('input[name="username"]', 'testInternAdmin');
  await this.page.fill('input[name="password"]', 'Admin@12');
  await takeScreenshot(this.page, 'admin-data-is-filled');
  await this.page.click('button[type="submit"]');

});


When('I navigate to the agents management page', async function(){
	await this.page.hover('#tabOperations');    
	await this.page.waitForTimeout(500);
	await takeScreenshot(this.page, 'agents-management-page');
	const userLink = await this.page.$('.sub-menu a[href*="viewusers"]');
	await userLink.click();
	await this.page.waitForTimeout(1000);
	const currentUrl = this.page.url();
	expect(currentUrl).toContain('/site/viewusers');
});



When('I click on the create new agent button', async function () {

  await this.page.click('button.dropdown-toggle:has-text("Expand")');
  await this.page.waitForTimeout(500);
	await takeScreenshot(this.page, 'create-new-agent-button');
  await this.page.click('a[href="https://tracelog14.slashrtc.in/index.php/site/createuser"]');
  await this.page.waitForTimeout(1000);

});


When('I fill in the agent details with valid information', async function(){
	await this.page.fill("#userFirstName", "dua");
	await this.page.fill("#userLastName", "lipa");
	await this.page.fill("#userName", "duaLipa");
	await this.page.fill("#userPassword", "Pass@123");
	await this.page.fill("#confirmPassword", "Pass@123");
	await takeScreenshot(this.page, 'agent-details-filled');
	await this.page.click("#saveButton");
	await this.page.waitForTimeout(1000);
   console.log('Agent details filled successfully!');
});





