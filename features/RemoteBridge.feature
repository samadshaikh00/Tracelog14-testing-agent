Feature: Remote endpoint calling with multiple agents

  Scenario Outline: 1000 calls using Auto process
    Given I am on the login page for agent from row <row>
    When I login with credentials from CSV row <row>
    Then I should be redirected to the dashboard
    When I click on remote endpoint button
    Then I should be in ready state-Remote
    Then I Handle auto calls
    Then I am logging out

    Examples:
      | row |
      | 0   |
      