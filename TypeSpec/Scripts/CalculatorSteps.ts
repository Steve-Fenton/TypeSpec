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

        runner.addStep(/I enter (\"\d+\") into the calculator/i,
            (context: CalculatorTestContext, num: number) => {
                context.calculator.add(num);
            });

        runner.addStep(/I enter (\"\d+\") and (\"\d+\") into the calculator/i,
            (context: CalculatorTestContext, num1: number, num2: number) => {
                context.calculator.add(num1);
                context.calculator.add(num2);
            });

        runner.addStep(/I speak "(.*)" into the calculator/i,
            (context: CalculatorTestContext, sentence: string) => {
                var matches = sentence.match(/(\+|-)?((\d+(\.\d+)?)|(\.\d+))/);
                var num = parseFloat(matches[0]);
                context.calculator.add(num);
            });

        runner.when(/I press the total button/gi,
            (context: CalculatorTestContext) => {
                // No action needed
            });

        runner.then(/the result should be (\"\d+\") on the screen/i,
            (context: CalculatorTestContext, expected: number) => {
                var actual = context.calculator.getTotal();
                Assert.areIdentical(expected, actual);
            });
    }
}