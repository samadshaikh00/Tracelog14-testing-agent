const { Given } = require('@cucumber/cucumber');
const { BASE_URL, USERNAME, PASSWORD } = require('../utils/constant.js');
const { takeScreenshot } = require('../utils/screenshot.js');

Given('I am logged in as admin', async function () {
  await this.page.goto(BASE_URL);
  await this.page.fill('input[name="username"]', USERNAME);
  await this.page.fill('input[name="password"]', PASSWORD);
  await takeScreenshot(this.page, 'admin-data-is-filled');
  await this.page.click('button[type="submit"]');
  console.log('Logged in as an admin');
});
