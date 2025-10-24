const { Given, When, Then } = require("@cucumber/cucumber");
const { expect } = require("chai");
const { createObjectCsvWriter } = require("csv-writer");
const { appendFile, pathExists } = require("fs-extra");
const path = require("path");

const working_numbers_path = path.join(__dirname, "working_numbers.txt");
const csvFilePath = path.join(__dirname, "call_metrics.csv");

const csvWriter = createObjectCsvWriter({
  path: csvFilePath,
  header: [
    { id: "date", title: "date" },
    { id: "timestamp", title: "timestamp" },
    { id: "mobile", title: "mobile" },
    { id: "readyToCallSec", title: "readyToCallSec" },
    { id: "callToDisposeSec", title: "callToDisposeSec" },
    { id: "agent_name", title: "agent_name" },
  ],
  append: true,
});

const ensureCsvHeaders = async () => {
  const fileExists = await pathExists(csvFilePath);
  if (!fileExists) {
    const initialCsvWriter = createObjectCsvWriter({
      path: csvFilePath,
      header: [
        { id: "date", title: "date" },
        { id: "timestamp", title: "timestamp" },
        { id: "mobile", title: "mobile" },
        { id: "readyToCallSec", title: "readyToCallSec" },
        { id: "callToDisposeSec", title: "callToDisposeSec" },
        { id: "agent_name", title: "agent_name" },
      ],
      append: false,
    });
    await initialCsvWriter.writeRecords([]);
    console.log("CSV file created with headers");
  }
};

Then("I Handle auto calls", async function () {
  await ensureCsvHeaders();
  const agentName = this.currentAgent.username;
  const disposeTag = "TestCall";
  let mobile;
  let working_phone_numbers = [];

  const waitForStateChange = async (currentState, timeout = 30000) => {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const newState = await this.getLiveState();
      if (newState !== currentState) return newState;
      await this.page.waitForTimeout(1000);
    }
    throw new Error(`State did not change from ${currentState} within ${timeout}ms`);
  };

  
  const selectDisposition = async () => {
    const inputField = this.page.locator('input.select2-search__field[placeholder="Select Disposition"]');
    await inputField.waitFor({ state: "visible", timeout: 5000 });
    await inputField.click();
    await inputField.fill(disposeTag);
    const disposeOption = this.page.locator(`li.select2-results__option:has-text("${disposeTag}")`);
    await disposeOption.waitFor({ state: "visible", timeout: 5000 });
    await disposeOption.click();
    console.log(`Selected disposition: ${disposeTag}`);
  };''

  const clickDoneButton = async () => {
    const buttonLocator = await this.page.locator('button.callDisposebtn:has-text("DONE")');
    await buttonLocator.waitFor({ state: "visible", timeout: 5000 });
    await buttonLocator.click();
    console.log("Clicked DONE button");
  };

  const handleCallState = async () => {
    const callDisconnectButton = await this.page.locator("button.callBtnDisconnect > i.fa-phone");
    await callDisconnectButton.click();
    await this.page.waitForTimeout(5000);
    await selectDisposition();
    await this.page.waitForTimeout(3000);
    
    
    const startTime = Date.now();
    while (Date.now() - startTime < 60000) {
      const currentState = this.getLiveState();
      if (currentState === "dispose") return currentState;
      await this.page.waitForTimeout(1000);
    }
    throw new Error("Did not reach dispose state within timeout");
  };

  const handleNonReadyState = async (state, callTime) => {
    let callToDisposeSec = 0;
    
    while (state !== "ready" && state !== "stop") {
      if (state === "call") {
        await handleCallState();
        const disposeTime = Date.now();
        callToDisposeSec = callTime ? (disposeTime - callTime) / 1000 : 0;
        console.log(`Call ended, call->dispose: ${callToDisposeSec.toFixed(3)}s`);
      } else if (state === "dispose") {
        const disposeTime = Date.now();
        callToDisposeSec = callTime ? (disposeTime - callTime) / 1000 : callToDisposeSec;
        console.log(`Disposition handled, call->dispose: ${callToDisposeSec.toFixed(3)}s`);
        await selectDisposition();
        await clickDoneButton();
        await this.page.waitForTimeout(2000);
      }
      
      state = await this.getLiveState();
      if (state !== "ready" && state !== "stop") {
        await this.page.waitForTimeout(4000);
      }
    }
    return { state, callToDisposeSec };
  };

  
  let state = await this.getLiveState();
  const max_iteration = 30 * 60 * 1000; 
  const start_time = Date.now();

  while (state === "ready" && Date.now() - start_time <= max_iteration) {

    const readyTime = Date.now();
    let callTime = 0;
    let readyToCallSec = 0;
    let callToDisposeSec = 0;

    state = await waitForStateChange(state, 60000);
    if (state === "stop") break;
    if (state === "call") {
      callTime = Date.now();
      readyToCallSec = (callTime - readyTime) / 1000;
      console.log(`Call detected, ready->call: ${readyToCallSec.toFixed(3)}s`);
      
      await this.page.waitForTimeout(2000);
      const working = await this.page.locator("a#dialScreenCustNumber", { timeout: 1500 });
      const working_number = await working.textContent();
      mobile = working_number;
      working_phone_numbers.push(working_number);
      console.log(`Picked number: ${working_number}`);
      await appendFile(working_numbers_path, `${working_number}\n`);
      state = await handleCallState();
      callToDisposeSec = callTime ? (Date.now() - callTime) / 1000 : 0;
    }

    
    if (state !== "ready") {
      const result = await handleNonReadyState(state, 60000);
      state = result.state;
      callToDisposeSec = result.callToDisposeSec || callToDisposeSec;
    }

    
    const row = {
      timestamp: new Date().toLocaleTimeString(),
      date: new Date().toISOString().split("T")[0],
      mobile,
      readyToCallSec: readyToCallSec.toFixed(3),
      callToDisposeSec: callToDisposeSec.toFixed(3),
      agent_name: agentName,
    };
    await csvWriter.writeRecords([row]);
    console.log("CSV row written:", row);

    if (state === "ready") {
      await this.page.waitForTimeout(2000);
      state = await this.getLiveState();
    }
  }

});