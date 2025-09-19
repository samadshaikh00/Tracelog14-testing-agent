Feature: Create Campaign

  Scenario: Create campaign
    Given I am logged in as admin
    When I navigate to the campaign manage page
    And I click on create campaign
    And I fill the campaign details with valid information
    Then I should see a creation successful message