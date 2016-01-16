Feature: Basic Working Example
    In order to avoid silly mistakes
    As a math idiot
    I want to be told the sum of two numbers

@passing
Scenario: Basic Example with Calculator
    Given I am using a calculator
    And I enter "50" into the calculator
    And I enter "70" into the calculator
    When I press the total button
    Then the result should be "120" on the screen