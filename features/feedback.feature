Feature: Feedback form

  Background:
    Given I am logged in

  Scenario: Submit valid feedback
    When I select topic "Other"
    And I enter description "App is awesome but found a minor bug."
    And I rate it "5"
    And I click the submit button
    Then I should see a success message

  Scenario: Submit feedback without description
    When I select topic "Other"
    And I rate it "-1"
    And I leave the description empty
    And I click the submit button