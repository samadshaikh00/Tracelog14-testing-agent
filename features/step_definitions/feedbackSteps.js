const { Given, When, Then } = require('@cucumber/cucumber');

const assert = require('assert');

Given('I am logged in', async function () {
  // Navigate to login page
  c
  await this.page.goto('http://10.10.15.140:3002/login');
  // Enter valid credentials
  await this.page.fill('input[name="loginEmail"]', 'samad@mail.com');
  await this.page.fill('input[name="loginPassword"]', 'asdf');
  await this.page.click('button[type="submit"]');
  await this.page.waitForURL('http://10.10.15.140:3002/feedback');
});


When('I select topic {string}', async function (topic) {

  await this.page.waitForSelector('#topic', { timeout: 5000 });
  await this.page.selectOption('#topic', { label: topic });
});

When('I rate it {string}', async function (rating) {
    
  await this.page.waitForSelector('input[name="rating"]', { timeout: 5000 });
  await this.page.fill('input[name="rating"]', rating.toString());
});


When('I enter description {string}', async function (desc) {
  await this.page.waitForSelector("#description", {timeout : 5000} );
  await this.page.fill('#description', String(desc));
});



When('I leave the description empty', async function () {
  await this.page.waitForSelector("#description", {timeout : 5000} );
  await this.page.fill('#description', String(""));
});



When('I click the submit button', async function () {

  await this.page.click('button[type="submit"]');

});



Then('I should see a success message', async function () {
 await this.page.waitForSelector('.alert-success', { timeout: 5000 });
  const success = this.page.locator('.alert-success');
  const visible = await success.isVisible();
  assert.ok(visible, 'Expected success message to be visible');

});



// Then('I should see a validation error', async function () {
//  await this.page.waitForSelector('.alert-danger', { timeout: 5000 });

//   const error = this.page.locator('.alert-danger');

//   const visible = await error.isVisible();

//   assert.ok(visible, 'Expected validation error message to be visible');

// });