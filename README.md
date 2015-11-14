# TypeSpec
An experimental TypeScript BDD framework.

The aim is to properly separate the business specifications from the code, 
but rather than code-generate (like Java or C# BDD tools), the tests will be 
loaded and executed on the fly without converting the text into an 
intermediate language or framework. This should allow tests to be written using any 
unit testing framework - or even without one.

## Specifications

Specifications are plain text files, just like those used in other BDD frameworks. 
For example:

    Feature: Basic Working Example
           In order to avoid silly mistakes
           As a math idiot
           I want to be told the sum of two numbers

    @passing
    Scenario: Basic Example with Calculator
           Given I have entered "50" into the calculator
           And I have entered "70" into the calculator
           When I press add
           Then the result should be "120" on the screen

The files are specified in the `runner.run` method call:

    import {SpecRunner} as TypeSpec from './Scripts/TypeSpec/TypeSpec';

    var runner = new SpecRunner();

    runner.addStep(/I have entered "(\d+)" into the calculator/i, (context: any, numberToAdd: string) => {
        var num = parseFloat(numberToAdd);
        calculator.add(num);
    });

    runner.run(
        '/Specifications/Basic.html',
        '/Specifications/Failing.html',
        '/Specifications/MissingStep.html'
    );

## Steps

Steps are defined with two arguments:

 - The Regular Expression that is used to match the text to a step
 - The function that will handle the step

Note that all arguments, and *only* arguments, should be double-quoted in your specification.

    runner.addStep(/I have entered "(\d+)" into the calculator/i, (context: any, numberToAdd: string) => {
        var num = parseFloat(numberToAdd);
        calculator.add(num);
    });

All arguments are passed to the step as strings, and should be parsed before use.

## TypeScript / C# Comparison

If you are familiar with BDD in C# or Java, this comparison may be useful when 
considering the difference between TypeSpec and tools such as SpecFlow or Cucumber.

TypeScript:

    runner.addStep(/I have entered "(\d+)" into the calculator/i,
    (context: any, numberToAdd: string) => {
        var num = parseFloat(numberToAdd);
        calculator.add(num);
    });

C#

    [Given("I have entered (\d+) into the calculator")]
    public void EnterNumber(decimal num) {
        calculator.Add(num);
    }

Key differences:

 - All arguments must be "quoted" (including numebrs), ie. "(\d+)", not just (\d+)
 - All arguments arrive as strings and must be parsed if necessary
 - You can choose whether the step matcher is case sensitive (pass the `i` flag to ignore case)
 - The first argument passed to a step is always the test context

Similarities:

 - The first argument to `addStep` is essentially the same as the C# attribute
 - The second argument to `addStep` is essentially the same as the C# method

In place of the C# attribute, we pass the Regular Expression into 
the `addStep` method. 

Within the step, we must parse each argument if we want to deal with 
something other than a string.

## Custom Error Handler

You can write your own custom error handler, which be notified of any 
problems that occur, such as missing step definitions or failing conditions:

    runner.setErrorHandler((featureTitle: string, condition: string, error: Error) => {
        var div = document.createElement('div');
        div.innerHTML = '<h2>' + featureTitle + '</h2><blockquote>' + condition + '</blockquote><pre class="bad">' + error + '</pre>';
        document.getElementById('result').appendChild(div);
    });