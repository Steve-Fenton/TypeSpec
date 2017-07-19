Feature: Excluded by Tag
    In order to avoid silly mistakes
    As a math idiot
    I want to be told the sum of two numbers

@exclude
Scenario: Scenario Excluded By Tag
    Given I am using a calculator
    And I enter "1" into the calculator
    And I enter "1" into the calculator
    When I press the total button
    Then the result should be "10000" on the screen

@failing @exclude
Scenario Outline: Scenario Outline Excluded By Tag
    Given I am using a calculator
    And I enter "<Number 1>" into the calculator
    And I enter "<Number 2>" into the calculator
    When I press the total button
    Then the result should be "<Total>" on the screen

Examples:
    | Number 1 | Number 2 | Total |
    | 1        | 1        | 100   |
    | 1        | 2        | 100   |