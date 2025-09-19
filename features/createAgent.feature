Feature: Create Agent
  As an admin user
  I want to create new agents
  So that they can access the system with appropriate permissions

  Scenario: Successful agent creation
    Given I am logged in as an admin
    When I navigate to the agents management page
    And I click on the create new agent button
    And I fill in the agent details with valid information
    

