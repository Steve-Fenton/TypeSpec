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
            (context: CalculatorTestContext, numberToAdd: string) => {
                var num = parseFloat(numberToAdd);
                context.calculator.add(num);
            });

        runner.addStep(/I have entered "(\d+)" and "(\d+)" into the calculator/i,
            (context: CalculatorTestContext, firstNumber: string, secondNumber: string) => {
                var num1 = parseFloat(firstNumber);
                var num2 = parseFloat(secondNumber);
                context.calculator.add(num1);
                context.calculator.add(num2);
            });

        runner.addStep(/I press the total button/gi,
            (context: CalculatorTestContext) => {
                // No action needed
            });

        runner.addStep(/the result should be "(\d+)" on the screen/i,
            (context: CalculatorTestContext, numberForTotal: string) => {
                var num = parseFloat(numberForTotal);
                var total = context.calculator.getTotal();
                Assert.areIdentical(num, total);
            });
    }
}