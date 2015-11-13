# TypeSpec
An experimental TypeScript BDD framework.

The aim is to properly separate the business specifications from the code, but rather than code-generate (like Java or C# BDD tools), the tests will be loaded in and executed on the fly without converting the text into an intermediate language. This should allow tests to be written in any unit testing framework - or even without one.

    import * as TypeSpec from './Scripts/TypeSpec/TypeSpec';

    var runner = new TypeSpec.SpecRunner();

    runner.addStep(/I have entered (\d+) into the calculator/i, /\d+/, (numberToAdd: string) => {
        var num = parseFloat(numberToAdd);
        calculator.add(num);
    });

    runner.run(
        '/Specifications/Basic.html',
        '/Specifications/Failing.html',
        '/Specifications/MissingStep.html'
    );

## Steps

Steps are defined with three arguments:

 - The Regular Expression that is used to match the text to a step
 - The Regular Expression for extracing arguments from the text
 - The function that will handle the step

If you don't need to match arguments in the text, you can simply use the text itself (and pass null as the argument matcher):

    runner.addStep(/I have entered something into the calculator/i, null, (numberToAdd: string) => {
        var num = parseFloat(numberToAdd);
        calculator.add(num);
    });

To find and extract a number from the text, you can use:

    runner.addStep(/I have entered (\d+) into the calculator/i, /\d+/, (numberToAdd: string) => {
        var num = parseFloat(numberToAdd);
        calculator.add(num);
    });

All arguments are passed to the step as strings, and should be parsed before use.

## TypeScript / C# Comparison

If you are familiar with BDD in C# or Java, this comparison may be useful when considering the difference between TypeSpec and tools such as SpecFlow or Cucumber.

TypeScript:

    runner.addStep(/I have entered (\d+) into the calculator/i, /\d+/,
    (numberToAdd: string) => {
        var num = parseFloat(numberToAdd);
        calculator.add(num);
    });

C#

    [Given("I have entered (\d+) into the calculator")]
    public void EnterNumber(decimal num) {
        calculator.Add(num);
    }

In place of the C# attribute, we pass the Regular Expression into the `addStep` method. We also need to pass a Regaular Expression for argument matching.

Within the step, we must parse each argument if we want to deal with something other than a string.