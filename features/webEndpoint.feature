Feature: Web end-point calling             
Scenario: Calling From  Web Endpoint 
    Given I am logged in and on dashboard
    Then I click on the web endpoint button
    And I handle microphone permission popup 
    # Then I should be in ready state-web