Feature: Multiple Arguments Per Line
    In order to shorten specifications
    As a BDD enthusiast
    I want to be able to place multiple arguments on a single line

@passing
Scenario: Multiple Arguments Per Line
    Given I am using a calculator
    And I enter "50" and "70" into the calculator
    When I press the total button
    Then the result should be "120" on the screen