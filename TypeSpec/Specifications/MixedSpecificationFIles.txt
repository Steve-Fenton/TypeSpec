Feature: Mixed Specification Files
    In order to make specification files flexible
    As a BDD enthusiast
    I want to mix scenarios and scenario outlines in the same file

Scenario: Scenario in Mixed File
    Given I am using a calculator
    And I enter "50" into the calculator
    And I enter "70" into the calculator
    When I press the total button
    Then the result should be "120" on the screen

Scenario Outline: Scenario Outline in Mixed File
    Given I am using a calculator
    And I enter "<Number 1>" into the calculator
    And I enter "<Number 2>" into the calculator
    When I press the total button
    Then the result should be "<Total>" on the screen

Examples:
    | Number 1 | Number 2 | Total |
    | 1        | 1        | 2     |
    | 1        | 2        | 3     |

Scenario: Scenario Following Scenario Outline in Mixed File
    Given I am using a calculator
    And I enter "50" into the calculator
    And I enter "70" into the calculator
    When I press the total button
    Then the result should be "120" on the screen