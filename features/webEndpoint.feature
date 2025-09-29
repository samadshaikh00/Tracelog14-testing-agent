Feature: Web end-point calling             
Scenario: Calling From  Web Endpoint 
    Given I am logged in and on dashboard
    Then I click on the web endpoint button
    And I handle microphone permission popup
    Then I should be in ready state-web
    When I dial number "8692003560" and make the call
    Then I should see web call state progression
    Then I should handle web calling dispose with "TestCall"
    Then I am logging out