import * as TsUnit from './Scripts/tsUnit/tsUnit';
import {SpecRunner} from './Scripts/TypeSpec/TypeSpec';
import {Calculator} from './Scripts/Calculator';

// Grab an SpecRunner... 
// we only need one no matter how many specifications we have
var runner = new SpecRunner();

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

    if (total !== num) {
        throw Error('Total should have been ' + num + ', was ' + total);
    }
});

// Call the run method with the locations of your specification files
runner.run(
    '/Specifications/Basic.html',
    '/Specifications/Failing.html',
    '/Specifications/MissingStep.html'
);