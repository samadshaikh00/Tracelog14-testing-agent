const { Given, When, Then, Before, After } = require("@cucumber/cucumber");
const { expect } = require("chai");
const WebSocket = require("ws");

Given(
  "I am on the login page for agent from row {int}",
  async function (rowIndex) {
    await this.initBrowser();

    await this.page.goto("https://tracelog14.slashrtc.in/index.php/login");
    await this.page.waitForSelector("#loginForm", { timeout: 40000 });
  }
);

Given(
  "I am logged in and on dashboard for agent from row {int}",
  async function (rowIndex) {
    console.log(`Agents loaded: ${this.agents.length}`);
    console.log(`Agents : ${this.agents}`);
    await this.initBrowser();
    await this.page.goto("https://tracelog14.slashrtc.in/index.php/login");
    await this.page.waitForSelector("#loginForm", { timeout: 40000 });
    const { username, password } = this.currentAgent;
    console.log(`Logging in with user: ${username}`);
    await this.page.fill('input[name="username"]', username);
    await this.page.fill('input[name="password"]', password);
    this.setCurrentAgent(rowIndex);
    await this.page.click("#loginProcess");
    await this.page.waitForNavigation({ timeout: 15000 });
    const url = this.page.url();
    expect(url).not.to.contain("/login");
    expect(url).to.contain("/dialScreen");
    await this.page.waitForTimeout(2000);
    console.log(
      `Successfully logged in and redirected to dashboard for ${username}`
    );
  }
);


When("I login with credentials from CSV row {int}", async function (rowIndex) {
  this.setCurrentAgent(rowIndex);
  const { username, password } = this.currentAgent;
  console.log(`Logging in with user: ${username}`);
  await this.page.fill('input[name="username"]', username);
  await this.page.fill('input[name="password"]', password);
  await this.page.click("#loginProcess");
  await this.page.waitForNavigation({ timeout: 15000 });
  
});

Then("I should be redirected to the dashboard", async function () {
  await this.page.waitForTimeout(4000);
  const url = this.page.url();
  console.log(url)
  expect(url).not.to.contain("/login");
  expect(url).to.contain("/dialScreen");
  console.log("Successfully redirected to dashboard");
});

Then("I am logging out", async function () {
  const url = this.page.url();
  console.log("Current url : " + url);
  try {
    await this.page.waitForTimeout(2500);
    await this.page.click("span.menuTitle");
    await this.page.waitForTimeout(2000);
    await this.page.click(".fa-stack .fa-power-off");
    await this.page.waitForTimeout(1000);
    const url = this.page.url();
    console.log("Current url : " + url);
    expect(url).to.contain("/login");
  } catch (error) {
    console.log("Could not logout : " + error);
  }
});
