import {SpecRunner, Assert} from '../node_modules/typespec-bdd/TypeSpec';
import {Calculator} from '../Scripts/Calculator';

interface CalculatorTestContext {
    done: Function;
    calculator: Calculator;
}

export class CalculatorSteps {
    static register(runner: SpecRunner) {
        runner.addStep(/I am using a calculator/i,
            (context: CalculatorTestContext) => {
                context.calculator = new Calculator();
            });

        runner.addStepAsync(/I enter (\"\d+\") into the calculator/i,
            (context: CalculatorTestContext, num: number) => {
                setTimeout(() => {
                    context.calculator.add(num);
                    context.done();
                }, 20);
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