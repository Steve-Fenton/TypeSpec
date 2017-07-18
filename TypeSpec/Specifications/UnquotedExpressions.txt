Feature: Basic Working Example
    In order to remove the restriction on quoting variables
    As a BDD enthusiast
    I want to be able to use unquoted expressions

@passing
Scenario: Unquoted Expressions
    Given I am using a calculator
    And I enter an unquoted 50 into the calculator
    And I enter an unquoted 70 into the calculator
    When I press the total button
    Then the result should be an unquoted 120 on the screen