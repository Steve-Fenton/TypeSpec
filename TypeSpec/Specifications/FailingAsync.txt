Feature: Failing Async Steps
    In order to test asynchronous code
    As a BDD enthusiast
    I want to be able to indicate async steps and await async code

@failing
Scenario: ! Asynchronous Timeout - Framework Steps In
    Given I am using a calculator
    And I enter "50" into the calculator
    And the asynchronous request times out when I enter "70" into the calculator
    When I press the total button
    Then the result should be "120" on the screen