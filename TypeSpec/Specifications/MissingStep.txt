Feature: Missing Step Example
    In order to know a step is missing
    As a BDD enthusiast
    I want to be told when a condition doesn't have a corresponding step definition

@failing
Scenario: ! Missing Step Suggestion Should Include RegExp
    Given I am using a calculator
    When I have a step with a number "5" and a boolean "true" and a string "text"
    Then the suggestion should include RegExp suggestions