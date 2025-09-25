const { Given, When, Then ,Before,After } = require('@cucumber/cucumber');
const { expect } = require('chai');                                                                             
const WebSocket = require('ws');

When('I click on the web endpoint button', { timeout: 120 * 1000 }, async function () {
    console.log('Clicking on web endpoint button...');
    await this.takeScreenshot('before_web_endpoint_click');
    const client = await this.page.context().newCDPSession(this.page);
    await client.send('Network.enable');
  
    // console.log("client network enabled", client);
    
    client.on('Network.webSocketCreated', ({requestId, url})=> {
      console.log('WebSocket CREATED ::::::::::::::::::::::::::::::::::::', url)
    })
  
  
    client.on('Network.webSocketFrameSent', ({requestId, timestamp, response})=> {
      console.log('WebSocket message sent::::::::::::::::::::::::::::::::::::::::::::::::::::', response);
    })
  
    client.on('Network.webSocketFrameReceived', ({requestId, timestamp, response})=> {
      console.log('WebSocket message received:::::::::::::::::::::::::::::::::::::::::::::::::', response.payloadData);
    })
  
    try {    
      // Set up WebSocket monitoring before clicking
      await this.page.exposeFunction('logWebSocketData', (data) => {
          console.log('@ WebSocket Data:', data)
          console.log("Untill here late executed");
      });
  
      await this.page.on('websocket', ws => {
        console.log('///////////////////////////////////', ws)
      })
  
      // Inject the WebSocket monitoring script directly
      console.log('WebSocket monitoring setup completed');
      console.log('<----------------------------------------------------------------------------->');
  
      // Now click the button
      await this.page.waitForTimeout(6000);
      await this.page.waitForSelector('button.webPhone', { timeout: 5000 });
      await this.page.click('button.webPhone');
  
    }catch (error) {
      console.error('Error in web endpoint step:', error.message);
      await this.takeScreenshot('web_endpoint_error');
      throw error;
    }
});


When('I handle microphone permission popup', async function () {
    console.log('Handling Microphone Permission!!');
    // Check microphone permission status
    const permissionStatus = await this.page.evaluate(async () => {
        try {
        const permission = await navigator.permissions.query({ name: 'microphone' });
        return permission.state; 
        } catch (error) {
        console.error('Permission query failed:', error);
        return 'error';
        }
    });
    console.log('Microphone Permission : ' + permissionStatus);
    if(permissionStatus === 'denied'){
        await this.context.grantPermissions(['microphone']);
    } 
});
  

When('I dial number {string} and make the call', async function (phoneNumber) {
    const isReady = await this.checkReadyState();
    if(!isReady)
        return ;
    
    await this.page.waitForTimeout(3000);
  

    console.log(`Dialing number: ${phoneNumber} and making call...`);
    await this.takeScreenshot('before_dialing_call');
    
    try {
      // Remove quotes if present
      const cleanPhoneNumber = phoneNumber.replace(/"/g, '');
      console.log(`Cleaned phone number: ${cleanPhoneNumber}`);
      
      // STEP 1: Enter the phone number
      await this.page.waitForTimeout(3000);
  
      const phoneInput = await this.page.locator('#phoneNumber');
      await phoneInput.waitFor({ state: 'visible', timeout: 5000 });
      console.log('Found phone input field');
      
      await phoneInput.clear();
      await phoneInput.fill(cleanPhoneNumber);
      
      // Verify the number was entered
      const enteredValue = await phoneInput.inputValue();
      console.log(`Entered phone number: "${enteredValue}"`);
      
      await this.takeScreenshot('after_entering_number');
      await this.page.waitForTimeout(3000);
      
      console.log('Waiting for call button to become enabled...');
      
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
      
      try {
        
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


Then('I should be in ready state-web', async function () {
    console.log('Verifying ready state...');
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





