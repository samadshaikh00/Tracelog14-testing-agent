Feature: Create a Process

  Scenario: Admin creates a new process
    Given I am logged in as admin
    When I navigate to the campaign view
    And I select the campaign
    And I expand and select create process
    And I fill in the process details with the required information
    Then I should see a successful message       
    When I Add gateway
    Then I should see success message
    
