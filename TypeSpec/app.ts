
// Import TypeSpec's main SpecRunner class
import {SpecRunner} from './Scripts/TypeSpec/TypeSpec';

// If you want to use it, there is also an Assert library
import {Assert} from './Scripts/TypeSpec/Assert';

// The module to test
import {Calculator} from './Scripts/Calculator';

// Using an external library for assertions

// Grab an SpecRunner... 
// we only need one no matter how many specifications we have
var runner = new SpecRunner();

// You can set an error handler to catch problems and do whatever you like with them
runner.setErrorHandler((featureTitle: string, condition: string, error: Error) => {
    var div = document.createElement('div');
    div.innerHTML = '<h2>' + featureTitle + '</h2><blockquote>' + condition + '</blockquote><pre class="bad">' + error + '</pre>';
    document.getElementById('result').appendChild(div);
});

// If you want, you can define an interface for the test context
interface CalculatorTestContext {
    calculator: Calculator;
}

// You can add as many steps as you need - you can do this elsewhere,
// just pass in the `runner` so they all contribute to the shared step collection
runner.addStep(/I am using a calculator/i, (context: CalculatorTestContext) => {
    context.calculator = new Calculator();
});

runner.addStep(/I have entered "(\d+)" into the calculator/i, (context: CalculatorTestContext, numberToAdd: string) => {
    var num = parseFloat(numberToAdd);
    context.calculator.add(num);
});

runner.addStep(/I press add/gi, (context: CalculatorTestContext) => {
    // No action needed
});

runner.addStep(/the result should be "(\d+)" on the screen/i, (context: CalculatorTestContext, numberForTotal: string) => {
    // TODO: use tsUnit / other library assertions
    var num = parseFloat(numberForTotal);
    var total = context.calculator.getTotal();
    Assert.areIdentical(num, total);
});

// Call the run method with the locations of your specification files
runner.run(
    '/Specifications/Basic.html',
    //'/Specifications/MultipleScenarios.html',
    // Deliberarely failing features
    '/Specifications/Failing.html',
    '/Specifications/MissingStep.html'
);