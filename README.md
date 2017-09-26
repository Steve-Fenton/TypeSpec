# TypeSpec
A TypeScript BDD framework.

    PM> Install-Package TypeSpec 

    npm install typespec-bdd

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

## Step Definitions

Step definitions are organised into classes, and the `@given`, `@when`, and `@then` decorators are used 
to mark the steps. You can also use the `@step` decorator if you want to re-use a step under multiple 
keywords.

You can use an interface to type your test context.

    import { Assert, given, when, then } from './TypeSpec/TypeSpec';

	export interface CalculatorTestContext {
		done: () => void; // Standard TypeSpec aync done method.
		calculator: Calculator;
	}

	export class CalculatorSteps {
		@given(/^I am using a calculator$/i)
		usingACalculator(context: CalculatorTestContext) {
			context.calculator = new Calculator();
		}

		@given(/^I have entered (\"\d+\") into the calculator$/i)
		passingArguments(context: CalculatorTestContext, num: number) {
			calculator.add(num);
		}

		@when(/^I press the total button$/gi)
		pressTotal() {
		}

		@then(/^the result should be (\"\d+\") on the screen$/i)
		resultShouldBe(context: CalculatorTestContext, expected: number) {
			var actual = context.calculator.getTotal();
			Assert.areIdentical(expected, actual);
		}
	}

The available decorators are:

 - given
 - when
 - then
 - step

The decorator takes a regular expression, and an optional kind (so you can mark a step as async).

## Async Steps

If the steps need to work with asynchronous code, you can mark them as asyn. When you do this, you'll need to 
inform the test context when you are done:

		@when(/^I press the total button$/gi, Kind.Async)
		pressTotal(context: CalculatorTestContext) {
		    window.setTimeout(() => {
				context.done();
			}, 500);
		}

## Running Specifications

You can run any number of specifications by passing them to `AutoRunner.run`. Each specification will 
be loaded and parsed, with the appropriate steps being executed if they exist.

Important Note: because the TypeScript compiler will optimise your ECMAScript style import away if you don't use the dependency
in your file, you should use the import style shown for CalculatorSteps for your step definition files.

    import { AutoRunner } from './Scripts/TypeSpec/TypeSpec';

	import './CalculatorSteps';

    AutoRunner.run(
        '/Specifications/Basic.txt'
    );


## Step Definitions

Steps are defined using a regular expression, and a function to handle the step.
For example, the step for the condition `Given I am using a calculator` is defined below:

    @given(/^I am using a calculator$/i)
    myStep(context: CalculatorTestContext) {
        context.calculator = new Calculator();
    }

This is a basic example, where the regular expression is just the static text to be matched, along
with the `i` flag to allow case-insensitive matches.

You can use the decorators `given`, `when`, or `then` to add steps, which will limit where they are used, or
you can use the `step` decorator to define a step that can be used in any case.

If you include variables in your condition, you can use the regular expression to match the 
step without the specific value. For example, the steps `And I have entered "50" into the calculator`
and `And I have entered "70" into the calculator` both match the step defined below (but 
`And I have entered "Bob" into the calculator` will not match, because `Bob` does not match `(\d+)`):

    @step(/^I have entered (\"\d+\") into the calculator$/i)
    myStep(context: CalculatorTestContext, num: number) {
        context.calculator.add(num);
    }

If you write a statement and no step definition can be found, TypeSpec will suggest a step method for you, 
including expressions for any arguments it finds. For example:

    I have a step with a number "5" and a boolean "true" and a string "text"

Will result in the following suggested step definition:

    @step(/^I have a step with a number (\"\d+\") and a boolean (\"true\"|\"false\") and a string "(.*)"$/i)
    myStep(context: any, p0: number, p1: boolean, p2: string) {
        throw new Error('Not implemented.');
    }

### Regular Expressions

You can be as explicit as you like with the regular expressions. You don't have to allow case-insensitive
matches (just remove the `i` in the examples above). You can use specific variable matching expressions such
as the `(\d+)` matcher (decimal digits) in the examples - or you can use a very open matcher such as `(.*)` (any characters).

Regular expressions aren't as bad as they may appear, the short version is...

`(\d+)` - the `\d` matches digit characters, 0-9 and the `+` says there may be more than one, so keep going!

*In Action:*

 > This `17` word sentence shows that there are `2` matches to be found using this regular expression.

Almost all of your Regular Expressions should start `/^` and end `$/i`. This tells the matcher to only match complete sentences. 
Without these you may match partial conditions, causing accidental matching of steps where the language is similar, for example:

 - When `the switch is turned on`
 - When the automatic switch analyzer says `the switch is turned on`

The long version is available at [MDN Regular Expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions).

#### Common TypeSpec Condition Strings

To find **"1"** here.

    To find (\"\d+\") here.

To find **"a string"** here.

    To find "(.*)" here.

To find **"true"** here.

    To find (\"true\"|\"false\") here.

### Grouping Steps

You should use a class to wrap related step definitions. However, don't fall into the trap of 
storing state on the class; use the `context` variable that is passed to the step by
TypeSpec - as this will keep state between steps in different classes, and no matter 
what the current scope of `this` is.

The `context` variable is completely dynamic, but you can use an interface to give it more
clarity in your step definitions.


## Composition

The composition of the test is shown below.

    import { AutoRunner } from './Scripts/TypeSpec/TypeSpec';

	import './CalculatorSteps';

    AutoRunner.run(
        '/Specifications/Basic.txt',
        '/Specifications/MultipleScenarios.txt',
        '/Specifications/ScenarioOutlines.txt'
    );

You pass the list of specifications into the `run` method. Each specification is loaded, parsed, 
and executed.

## Excluding Specifications

You can exclude specifications by tag, by passing the tags to exclude to the SpecRunner before calling `runner.run(...`:

    import { AutoRunner } from './Scripts/TypeSpec/TypeSpec';

    AutoRunner.excludeTags('@exclude', '@failing');

The `@` is optional here, you could exclude using `failing` or `@failing` - both will work.

## Test Reporting

By default, test output is sent to the `console`. You can override this behaviour by supplying 
a custom test reporter that extends the `TestReporter` class:

	import { TestReporter } from './TypeSpec/TypeSpec';

	export class CustomTestReporter extends TestReporter {
		//...
	}

There are two built-in test reporters available:

 - `TapReporter` - produces TAP compliant output
 - `TestReporter` - outputs results to the console

There is also an HTML test reporter in the TypeSpec sample project.

You tell the AutoRunner which reporter to use:

    AutoRunner.testReporter = new CustomTestReporter();

## Test Hooks

There are a number of test hooks available that you can use to run code at various points during a test run.

	interface ITestHooks {
		beforeTestRun(): void;
		beforeFeature(): void;
		beforeScenario(): void;
		beforeCondition(): void;

		afterCondition(): void;
		afterScenario(): void;
		afterFeature(): void;
		afterTestRun(): void;
	}

You can set your test hooks on the AutoRunner.

    AutoRunner.testHooks = new CustomTestHooks();

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

    @given(/^I have entered (\d+) into the calculator$/i)
    enterNumber(context: any, num: number) {
        calculator.add(num);
    }

C#

    [Given("I have entered (\d+) into the calculator")]
    public void EnterNumber(decimal num) {
        calculator.Add(num);
    }

Key differences:

 - You *should* always use the `^` start of string expression and the `$` end of string expression in TypeSpec (although you are not forced too)
 - You can choose whether the step matcher is case sensitive (pass the `i` flag to ignore case)
 - The first argument passed to a step is _always_ the test context
