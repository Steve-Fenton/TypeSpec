import {SpecRunner, Assert} from '../Scripts/TypeSpec/TypeSpec';
import {Calculator} from '../Scripts/Calculator';

interface CalculatorTestContext {
    calculator: Calculator;
}

export class CalculatorSteps {
    static register(runner: SpecRunner) {
        runner.addStep(/I am using a calculator/i,
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

        runner.addStep(/I press the total button/gi,
            (context: CalculatorTestContext) => {
                // No action needed
            });

        runner.addStep(/the result should be (\"\d+\") on the screen/i,
            (context: CalculatorTestContext, expected: number) => {
                var actual = context.calculator.getTotal();
                Assert.areIdentical(expected, actual);
            });
    }
}