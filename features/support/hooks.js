const { Before, After, setDefaultTimeout, AfterStep } = require('@cucumber/cucumber');

const playwright = require('playwright');
setDefaultTimeout(60 * 1000);



Before(async function () {
	
  this.browser = await playwright.chromium.launch({ headless: true });

  this.context = await this.browser.newContext();

  this.page = await this.context.newPage();


});



After(async function () {

  if (this.browser) {

    await this.browser.close();

  }

});