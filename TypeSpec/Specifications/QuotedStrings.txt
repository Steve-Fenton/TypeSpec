Feature: Quoted Strings
    In order to pass arguments that contain quotes
    As a BDD enthusiast
    I want to be able to include quotes in my arguments

@passing
Scenario: Basic Example with Calculator
    Given I am using a calculator
    And I speak "The Number \"50\"" into the calculator
    And I speak "Add \"70\"" into the calculator
    When I press the total button
    Then the result should be "120" on the screen