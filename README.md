# TypeSpec
A TypeScript BDD framework.

    PM> Install-Package TypeSpec 

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
           Given I am using a calculator
           And I have entered "50" into the calculator
           And I have entered "70" into the calculator
           When I press the total button
           Then the result should be "120" on the screen

## Quick Start

The following code shows all the parts needed to run a test. It is best to organise code 
better than this - but it shows how the parts fit together.

    import {SpecRunner} as TypeSpec from './Scripts/TypeSpec/TypeSpec';

    var runner = new SpecRunner();

    runner.addStep(/I have entered (\"\d+\") into the calculator/i, (context: any, num: number) => {
        calculator.add(num);
    });

    runner.run(
        '/Specifications/Basic.txt'
    );

## Random Ordering

If you want to run the specification in a random order (to discourage coupling), you can use a SpecificationList.

    var specList = new SpecificationList(
        '/Specifications/Basic.txt'
    );

    // Run the specifications listed
    runner.runSpecList(specList);

## Step Definitions

Steps are defined using a regular expression, and a function to handle the step.
For example, the step for the condition `Given I am using a calculator` is defined below:

    runner.given(/I am using a calculator/i,
        (context: CalculatorTestContext) => {
        context.calculator = new Calculator();
    });

This is a basic example, where the regular expression is just the static text to be matched, along
with the `i` flag to allow case-insensitive matches.

You can use the methods `given`, `when`, or `then` to add steps, which will limit where they are used, or
you can use the `addStep` method to define a step that can be used in any case.

If you include variables in your condition, you can use the regular expression to match the 
step without the specific value. For example, the steps `And I have entered "50" into the calculator`
and `And I have entered "70" into the calculator` both match the step defined below (but 
`And I have entered "Bob" into the calculator` will not match, because `Bob` does not match `(\d+)`):

    runner.addStep(/I have entered (\"\d+\") into the calculator/i,
        (context: CalculatorTestContext, num: number) => {
        context.calculator.add(num);
    });

If you write a statement and no step definition can be found, TypeSpec will suggest a step method for you, 
including expressions for any arguments it finds. For example:

    I have a step with a number "5" and a boolean "true" and a string "text"

Will result in the following suggested step definition:

    runner.addStep(/I have a step with a number (\"\d+\") and a boolean (\"true\"|\"false\") and a string "(.*)"/i,
        (context: any, p0: number, p1: boolean, p2: string) => {
            throw new Error('Not implemented.');
        });

### Regular Expressions

You can be as explicit as you like with the regular expressions. You don't have to allow case-insensitive
matches (just remove the `i` in the examples above). You can use specific variable matching expressions such
as the `(\d+)` matcher (decimal digits) in the examples - or you can use a very open matcher such as `(.*)` (any characters).

Regular expressions aren't as bad as they may appear, the short version is...

`(\d+)` - the `\d` matches digit characters, 0-9 and the `+` says there may be more than one, so keep going!

*In Action:*

 > This `17` word sentence shows that there are `2` matches to be found using this regular expression.

The long version is available at [MDN Regular Expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions).

#### Common TypeSpect Condition Strings

To find **"1"** here.

    To find (\"\d+\") here.

To find **"a string"** here.

    To find "(.*)" here.

To find **"true"** here.

    To find (\"true\"|\"false\") here.

### Grouping Steps

You can use a class to wrap related step definitions. However, don't fall into the trap of 
storing state on the class; se the `context` variable that is passed to the step by
TypeSpec - as this will keep state between steps in different classes, and no matter 
what the current scope of `this` is. Using the `static` keyword on your `register` method
will keep you honest!

The `context` variable is completely dynamic, but you can use an interface to give it more
clarity in your step definitions.

    import {SpecRunner, Assert} from './TypeSpec/TypeSpec';
    import {Calculator} from './Calculator';

    interface CalculatorTestContext {
        calculator: Calculator;
    }

    export class CalculatorSteps {
        static register(runner: SpecRunner) {
            runner.given(/I am using a calculator/i,
                (context: CalculatorTestContext) => {
                context.calculator = new Calculator();
            });

            runner.addStep(/I have entered (\"\d+\") into the calculator/i,
                (context: CalculatorTestContext, num: number) => {
                context.calculator.add(num);
            });

            runner.addStep(/I press the total button/gi,
                (context: CalculatorTestContext) => {
                // No action needed
            });

            runner.then(/the result should be (\"\d+\") on the screen/i,
                (context: CalculatorTestContext, num: number) => {
                var total = context.calculator.getTotal();
                Assert.areIdentical(num, total);
            });
        }
    }

## Composition

The composition of the test is shown below.

    import {SpecRunner} from './Scripts/TypeSpec/TypeSpec';
    import {Calculator} from './Scripts/Calculator';
    import {CalculatorSteps, MathSteps} from './Scripts/Steps';

    var runner = new SpecRunner();
    CalculatorSteps.register(runner);
    MathSteps.register(runner);

    runner.run(
        '/Specifications/Basic.txt',
        '/Specifications/MultipleScenarios.txt',
        '/Specifications/ScenarioOutlines.txt'
    );

By creating an instance of the `SpecRunner` class and passing it into each `register` method,
you create a master collection of steps that are available to all specifications.

You pass the list of specifications into the `run` method. Each specification is loaded, parsed, 
and executed.

## Excluding Specifications

You can exclude specifications by tag, by passing the tags to exclude to the SpecRunner before calling `runner.run(...`:

    runner.excludeTags('@exclude', '@failing');

The `@` is optional here, you could exclude using `failing` or `@failing` - both will work.

## Test Reporting

By default, test output is sent to the `console`. You can override this behaviour by supplying 
a custom test reporter. You can intercept:

 - `summary` - test results
 - `error` - errors and missing steps
 - `information` - verbose information including parsed conditions
 - `complete` - called at the end of the test

There are two built-in test reporters available:

 - TapReporter - produces TAP compliant output
 - TestReporter - a basic test reporter class, outputs to HTML

An example custom test reporter is shown below:

    import {TestReporter} from './TypeSpec/TypeSpec';

    export class CustomTestReporter extends TestReporter {
        summary(featureTitle: string, scenarioTitle: string, isSuccess: boolean) {
            var div = document.createElement('li');
            div.className = (isSuccess ? 'good' : 'bad');
            div.innerHTML = this.escape((isSuccess ? '✔' : '✘') + ' ' + featureTitle + '. ' + scenarioTitle + '.');
            document.getElementById('results').appendChild(div);
        }

        error(featureTitle: string, condition: string, error: Error) {
            var div = document.createElement('div');
            div.innerHTML = '<h2>' + featureTitle + '</h2><blockquote>' + this.escape(condition) + '</blockquote><pre class="bad">' + this.escape(error.message) + '</pre>';
            document.getElementById('errors').appendChild(div);
        }

        information(message: string) {
            console.log(message);
        }
    }

You pass in your custom test reporter when creating the `SpecRunner`:

    var runner = new SpecRunner(new CustomTestReporter());

## Scenario Outlines

Scenario outlines allow you to specify the example data in a table:

    Feature: Scenario Outline
           In order to make features less verbose
           As a BDD enthusiast
           I want to use scenario outlines with tables of examples

    @passing
    Scenario Outline: Basic Example with Calculator
           Given I am using a calculator
           And I have entered "<Number 1>" into the calculator
           And I have entered "<Number 2>" into the calculator
           When I press the total button
           Then the result should be "<Total>" on the screen

    Examples:
        | Number 1 | Number 2 | Total |
        | 1        | 1        | 2     |
        | 1        | 2        | 3     |
        | 2        | 3        | 5     |
        | 8        | 3        | 11    |
        | 9        | 8        | 17    |

## TypeScript / C# Comparison

If you are familiar with BDD in C# or Java, this comparison may be useful when 
considering the difference between TypeSpec and tools such as SpecFlow or Cucumber.

TypeScript:

    runner.addStep(/I have entered (\"\d+\") into the calculator/i,
    (context: any, num: number) => {
        calculator.add(num);
    });

C#

    [Given("I have entered (\d+) into the calculator")]
    public void EnterNumber(decimal num) {
        calculator.Add(num);
    }

Key differences:

 - All arguments must be "quoted" (including numebrs), ie. "1", not just 1 OR (\"\d+\"), not just (\d+)
 - You can choose whether the step matcher is case sensitive (pass the `i` flag to ignore case)
 - The first argument passed to a step is always the test context

Similarities:

 - The first argument to `addStep` is essentially the same as the C# attribute
 - The second argument to `addStep` is essentially the same as the C# method
 - The arguments extracted from the condition in the specification are parsed for you

In place of the C# attribute, we pass the Regular Expression into 
the `addStep` method. 

Within the step, we must parse each argument if we want to deal with 
something other than a string (issue #1).