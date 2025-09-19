const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');

Then('I should see agent ringing state', async function () {
    console.log('Verifying agent ringing state...');
    await this.page.waitForTimeout(5000);

    await this.takeScreenshot('agent_ringing_state');

    const state = await this.page.locator('.userstate').textContent();
    const isAgentRinging = state.trim().toLowerCase() === 'ready';
    console.log(`Ready state check result: ${isReady}`);
    return isReady;
});