Feature: Failing Test Example
    In order to know something isn't right
    As a BDD enthusiast
    I want to be told when a condition fails

@failing
Scenario: ! Failing Test Example
    Given I am using a calculator
    And I enter "15" into the calculator
    And I enter "18" into the calculator
    When I press the total button
    Then the result should be "31" on the screen