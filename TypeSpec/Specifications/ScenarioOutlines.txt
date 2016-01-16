Feature: Scenario Outline
    In order to make features less verbose
    As a BDD enthusiast
    I want to use scenario outlines with tables of examples

@passing
Scenario Outline: Basic Example with Calculator
    Given I am using a calculator
    And I enter "<Number 1>" into the calculator
    And I enter "<Number 2>" into the calculator
    When I press the total button
    Then the result should be "<Total>" on the screen

Examples:
    | Number 1 | Number 2 | Total |
    | 1        | 1        | 2     |
    | 1        | 2        | 3     |
    | 2        | 3        | 5     |
    | 8        | 3        | 11    |
    | 9        | 8        | 17    |