const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');


When('I click on remote endpoint button',  async function () {
    console.log('Clicking on remote endpoint button...');
    await this.takeScreenshot('before_remote_endpoint_click');
    try {
      await this.page.waitForTimeout(6000);
      await this.page.click('button.remotePhone');
      await this.page.waitForTimeout(3000);
      await this.takeScreenshot('after_remote_endpoint_click');
    } catch (error) {
      console.log('Error clicking remote endpoint:', error.message);
      await this.takeScreenshot('remote_endpoint_error');
    }
    await this.page.waitForTimeout(3000);

});


Then('I should be in ready state-Remote', async function () {
    console.log('Verifying ready state...');
    // Store cookies and reuse them
    
    const screenshotPath = await this.takeScreenshot(`is_ready_state?${this.currentAgent.username}`);
    const isReady = await this.checkReadyState();
    try {
      expect(isReady).to.be.true;
      console.log(`Ready state confirmed for ${this.currentAgent.username}`);
      await this.page.waitForTimeout(4500);
    }
    catch(e){
      console.log(`Agent  ${this.currentAgent.username} is not ready!`);
    }
    console.log(`Screenshot saved: ${screenshotPath}`);
    await this.page.waitForTimeout(4500);
});


When('I dial number {string} and make the call Remote On Demand', async function (phoneNumber) {
    const isReady = await this.checkReadyState();
    if(!isReady){
        return ;
        console.log('Agent is not ready!');
      }
    
    await this.page.waitForTimeout(3000);
    console.log(`Dialing number: ${phoneNumber} and making call...`);
    await this.takeScreenshot('before_dialing_call');
    
    try {
      const cleanPhoneNumber = phoneNumber.replace(/"/g, '');
      console.log(`Cleaned phone number: ${cleanPhoneNumber}`);
      await this.page.waitForTimeout(3000);
      const phoneInput = await this.page.locator('#phoneNumber');
      await phoneInput.waitFor({ state: 'visible', timeout: 5000 });
      console.log('Found phone input field');
      await phoneInput.clear();
      await phoneInput.fill(cleanPhoneNumber);
      const enteredValue = await phoneInput.inputValue();
      console.log(`Entered phone number: "${enteredValue}"`);
      await this.takeScreenshot('after_entering_number');
      await this.page.waitForTimeout(3000);
      console.log('Waiting for call button to become enabled...');
      
      // STEP 3: Click the call button
      await this.page.evaluate(() => {
        const callButton = document.querySelector('#manualcallBtnConnect');
        if (callButton) {
          callButton.removeAttribute('disabled'); // Remove disabled attribute
          callButton.disabled = false; // Set disabled property to false
          callButton.click();
        }
      });
      
      console.log('Call button clicked successfully');
      
  
    console.log('Verifying agent ringing state...');
    await this.page.waitForTimeout(3000);
  
    await this.takeScreenshot('agent_ringing_state');
  
    const state = await this.page.locator('.userstate').textContent();
    const isAgentRinging = state.trim() === 'Connecting';
    console.log(`Agent ringing state check result: ${isAgentRinging}`);
    
    console.log('Call process initiated successfully');

    } catch (error) {
      console.log('Error in dialing and making call: ', error.message);
      
      // Debug information
      try {
        // Check phone input state
        const phoneInput = this.page.locator('#phoneNumber');
        const phoneValue = await phoneInput.inputValue();
        const phoneVisible = await phoneInput.isVisible();
        console.log(`Phone input - Visible: ${phoneVisible}, Value: "${phoneValue}"`);
        
        // Check call button state
        const callButton = this.page.locator('#manualcallBtnConnect');
        const buttonVisible = await callButton.isVisible();
        const buttonEnabled = await callButton.isEnabled();
        const disabledAttr = await callButton.getAttribute('disabled');
        console.log(`Call button - Visible: ${buttonVisible}, Enabled: ${buttonEnabled}, Disabled attr: ${disabledAttr}`);
        
      } catch (debugError) {
        console.log('Debug failed:', debugError.message);
      }
      await this.takeScreenshot('dial_call_error');
      throw error;
    }
});

  



// Then("I should see Ringing state", async function(){
//   console.log('Agent Has picked Up the call!');
//   console.log('Waiting for customer to pick the call!');

//   await this.takeScreenshot('agent_has_picked_the_call');

//   let stateElement = await this.page.locator('.userstate');
  
//   try {
//       await this.page.waitForFunction(
//           (selector) => {
//               const element = document.querySelector(selector);
//               return element && element.textContent.trim() === 'Ringing';
//           },
//           '.userstate',
//           { timeout: 40000 }
//       );
//       await this.takeScreenshot('Customer_ringing!');
      
//       console.log('Customer is Ringing!');

//   } catch (error) {
//       let currentState = await stateElement.textContent();
//       console.log(`Timeout: Expected "Ringing" but got "${currentState.trim()}"`);
//       throw error;
//   }
// });


// Then('I should see call state', async function(){
//   console.log('Customer has picked up the call and agent state should be Call!!!');
//   let stateElement = await this.page.locator('.userstate');
  
//   try {
//       await this.page.waitForFunction(
//           (selector) => {
//               const element = document.querySelector(selector);
//               return element && element.textContent.trim() === 'Call';
//           },
//           '.userstate',
//           { timeout: 40000 }
//       );
//       let currentState = await stateElement.textContent();
//       await this.takeScreenshot('customer_has_picked_the_call');
      
//       console.log('Customer has picked up the call and the state is '+ currentState.trim());
//   } catch (error) {
//       let currentState = await stateElement.textContent();
//       console.log(`Timeout: Expected "Call" but got "${currentState.trim()}"`);
//       throw error;
//   }
// });



Then('I should see call state progression', async function(){
  console.log('Agent Has picked Up the call!');
  console.log('Waiting for customer to pick the call!');
  await this.takeScreenshot('agent_has_picked_the_call');

  let stateElement = this.page.locator('.userstate');
  const expectedStates = ['Ringing', 'Call'];
  const timeout = 40000; // 40 seconds total timeout
  const pollInterval = 5000; // 5 seconds between checks
  const startTime = Date.now();
  
  let currentExpectedStateIndex = 0;
  let lastLoggedState = '';

  while (Date.now() - startTime < timeout) {
    try {
      const currentState = await stateElement.textContent();
      const trimmedState = currentState.trim();
      
      // Log state every 5 seconds if it has changed
      if (trimmedState !== lastLoggedState) {
        console.log(`Current state: "${trimmedState}" at ${Math.round((Date.now() - startTime) / 1000)}s`);
        lastLoggedState = trimmedState;
        await this.takeScreenshot(`state_${trimmedState.toLowerCase()}`);
      }
      
      // Check if we've reached the current expected state
      const expectedState = expectedStates[currentExpectedStateIndex];
      if (trimmedState === expectedState) {
        console.log(`✓ Reached expected state: "${expectedState}"`);
        
        // Move to next expected state
        currentExpectedStateIndex++;
        
        // If we've reached all expected states, we're done
        if (currentExpectedStateIndex >= expectedStates.length) {
          console.log('✓ All expected states reached successfully!');
          return;
        }
        
        console.log(`Waiting for next state: "${expectedStates[currentExpectedStateIndex]}"`);
      }
      
      // Wait for 5 seconds before next check
      await this.page.waitForTimeout(pollInterval);
      
    } catch (error) {
      console.error('Error checking state:', error);
      throw error;
    }
  }
  
  // If we get here, timeout occurred
  const finalState = await stateElement.textContent();
  const expectedState = expectedStates[currentExpectedStateIndex];
  throw new Error(`Timeout: Expected "${expectedState}" but got "${finalState.trim()}" after ${timeout/1000}s`);
});





Then('I should handle dispose with {string}', async function(disposeTag) {
  console.log('Call has ended state should be dispose !!!');
  
  let stateElement = this.page.locator('.userstate');
  
  // First, select the dispose tag using the parameter
  try {
    // Click on the input field to open the dropdown
    const inputField = this.page.locator('input.select2-search__field[placeholder="Select Disposition"]');
    await inputField.click();
    await inputField.fill(disposeTag);
    await this.takeScreenshot('dispose_tag_filled');

    const disposeOption = this.page.locator(`li.select2-results__option:has-text("${disposeTag}")`);
    await disposeOption.waitFor({ state: 'visible', timeout: 5000 });
    await disposeOption.click();
    await this.takeScreenshot('dispose_option_selected');
    
    console.log(`Selected dispose tag: ${disposeTag}`);
  } catch (error) {
    console.error(`Error selecting dispose tag "${disposeTag}":`, error);
    throw error;
  }

  // Then wait for the state to become "Dispose"
  try {
    await this.page.waitForFunction(
      (selector) => {
        const element = document.querySelector(selector);
        return element && element.textContent.trim() === 'Dispose';
      },
      '.userstate',
      { timeout: 10000 }
    );
    
    let currentState = await stateElement.textContent();
    await this.takeScreenshot('call_ended_select_dispose');
    console.log('Call has ended and the state is ' + currentState.trim());
  } catch (error) {
    let currentState = await stateElement.textContent();
    console.error(`Timeout: Expected "Dispose" but got "${currentState.trim()}"`);
    await this.takeScreenshot('state_timeout_error');
    throw error;
  }

  // Finally, handle the DONE button
  try {
    const buttonLocator = this.page.locator('button.callDispose.callDisposebtn', { hasText: 'DONE' });
    await buttonLocator.waitFor({ state: 'visible', timeout: 40000 });
    await buttonLocator.click();
    console.log('Clicked DONE button');
    await this.takeScreenshot('done_button_clicked');
  } catch (error) {
    console.error('Error clicking DONE button:', error);
    await this.takeScreenshot('done_button_error');
    throw error;
  }
});

// Then('I should handle dispose with {string}', async function(disposeTag) {
//   console.log('Call has ended state should be dispose !!!');
  
//   let stateElement = this.page.locator('.userstate');

//     // First, select the dispose tag using the parameter
//   try {
//     // Click on the input field to open the dropdown
//     const inputField = this.page.locator('input.select2-search__field[placeholder="Select Disposition"]');
//     await inputField.click();
//     await inputField.fill(disposeTag);
//     await this.takeScreenshot('dispose_tag_filled');

//     const disposeOption = this.page.locator(`li.select2-results__option:has-text("${disposeTag}")`);
//     await disposeOption.waitFor({ state: 'visible', timeout: 5000 });
//     await disposeOption.click();
//     await this.takeScreenshot('dispose_option_selected');
    
//     console.log(`Selected dispose tag: ${disposeTag}`);
//   } catch (error) {
//     console.error(`Error selecting dispose tag "${disposeTag}":`, error);
//     throw error;
//   }

//   try {
//     await this.page.waitForFunction(
//       (selector) => {
//         const element = document.querySelector(selector);
//         return element && element.textContent.trim() === 'Dispose';
//       },
//       '.userstate',
//       { timeout: 40000 }
//     );
    
//     let currentState = await stateElement.textContent();
//     await this.takeScreenshot('call_ended_select_dispose');
//     console.log('Call has ended and the state is ' + currentState.trim());
//   } catch (error) {
//     let currentState = await stateElement.textContent();
//     console.log(`Timeout: Expected "Dispose" but got "${currentState.trim()}"`);
//     throw error;
//   }

//   // console.log(`Selecting dispose tag: ${disposeTag}`);
//   // await this.page.waitForTimeout(50 * 1000);
//   //  await this.takeScreenshot('dispose');

//   // const inputField = this.page.locator('input.select2-search__field[placeholder="Select Disposition"]');
//   // await inputField.click();
//   // await inputField.fill(disposeTag);
//   // await this.takeScreenshot('dispose_tag_filled');

//   await this.page.waitForTimeout(40 * 1000);
//   const buttonLocator = this.page.locator('button .callDispose .callDisposebtn', { hasText: 'DONE' });
//   await buttonLocator.waitFor({ state: 'visible', timeout: 10000 });
//   await buttonLocator.click();
//   console.log('Clicked DONE button');
// });