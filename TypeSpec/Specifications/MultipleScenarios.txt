Feature: Multiple Scenarios
    In order to organise specifications
    As a BDD enthusiast
    I want to be table to place multiple specifications within a feature

@passing
Scenario: Scenario Number One
    Given I am using a calculator
    And I enter "50" into the calculator
    And I enter "70" into the calculator
    When I press the total button
    Then the result should be "120" on the screen

@passing
Scenario: Scenario Number Two
    Given I am using a calculator
    And I enter "20" into the calculator
    And I enter "32" into the calculator
    When I press the total button
    Then the result should be "52" on the screen

@passing
Scenario: Scenario Number Three
    Given I am using a calculator
    And I enter "12" into the calculator
    And I enter "3" into the calculator
    When I press the total button
    Then the result should be "15" on the screen