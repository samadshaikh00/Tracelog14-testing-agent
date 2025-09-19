const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('playwright/test');
const assert = require('assert');


Given('I am on the login page', async function () {
  await this.page.goto('https://tracelog14.slashrtc.in/index.php/login');
});


When('I enter valid credentials', async function () {  
  await this.page.fill('input[name="username"]', 'testInternAdmin');
  await this.page.fill('input[name="password"]', 'Admin@12');
});


When('I click the login button', async function () {

  await this.page.click('button[type="submit"]');

});

Then('I should be redirected to the dashboard', async function () {

  await this.page.waitForTimeout(2000);
  const currentUrl = this.page.url();
  

  expect(currentUrl).not.toContain('/login');
  
  const pageTitle = await this.page.title();
  expect(pageTitle).not.toBe('Login');

});


// -> next i want to have createAgent.feature to execute 