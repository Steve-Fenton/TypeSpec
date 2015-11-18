import {SpecRunner, Assert} from './TypeSpec/TypeSpec';
import {Calculator} from './Calculator';

interface CalculatorTestContext {
    calculator: Calculator;
}

export class CalculatorSteps {
    static register(runner: SpecRunner) {
        runner.addStep(/I am using a calculator/i,
            (context: CalculatorTestContext) => {
                context.calculator = new Calculator();
            });

        runner.addStep(/I have entered "(\d+)" into the calculator/i,
            (context: CalculatorTestContext, num: number) => {
                context.calculator.add(num);
            });

        runner.addStep(/I have entered "(\d+)" and "(\d+)" into the calculator/i,
            (context: CalculatorTestContext, num1: number, num2: number) => {
                context.calculator.add(num1);
                context.calculator.add(num2);
            });

        runner.addStep(/I press the total button/gi,
            (context: CalculatorTestContext) => {
                // No action needed
            });

        runner.addStep(/the result should be "(\d+)" on the screen/i,
            (context: CalculatorTestContext, expected: number) => {
                var actual = context.calculator.getTotal();
                Assert.areIdentical(expected, actual);
            });
    }
}