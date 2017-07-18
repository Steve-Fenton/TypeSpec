Feature: Async Steps
    In order to test asynchronous code
    As a BDD enthusiast
    I want to be able to indicate async steps and await async code

@passing
Scenario: Asynchronous Steps
    Given I am using a calculator
    And I enter "50" into the calculator
    And I asynchronously enter "70" into the calculator
    When I press the total button
    Then the result should be "120" on the screen