Feature: Argument Types
    In order to improve step definitions
    As a BDD enthusiast
    I want the framework to supply arguments of the correct type

@passing
Scenario: Number Argument
    Given I am passing arguments
    When I pass "1" and "Z" as arguments
    Then the arguments should be number and string type

@passing
Scenario: Boolean Argument
    Given I am passing arguments
    When I pass "true" and "false" as arguments
    Then the arguments should be boolean type