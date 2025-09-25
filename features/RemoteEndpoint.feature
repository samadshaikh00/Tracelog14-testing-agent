Feature: Web end-point calling
  Scenario: Calling From Web Endpoint
    Given I am logged in and on dashboard
    Then I click on remote endpoint button
    Then I should be in ready state-Remote
    When I dial number "8692003560" and make the call Remote On Demand