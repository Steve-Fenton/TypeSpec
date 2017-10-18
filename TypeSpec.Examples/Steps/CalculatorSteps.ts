import { given, when, then, Assert } from '../node_modules/typespec-bdd/src/TypeSpec';
import { Calculator } from '../Scripts/Calculator';

export interface CalculatorTestContext {
    calculator: Calculator;
}

export class CalculatorSteps {
    @given(/I am using a calculator/i)
    usingCalculator(context: CalculatorTestContext) {
        context.calculator = new Calculator();
    }

    @given(/I enter (\"\d+\") into the calculator/i)
    enterNumber(context: CalculatorTestContext, num: number) {
        context.calculator.add(num);
    }

    @given(/I enter (\"\d+\") and (\"\d+\") into the calculator/i)
    enterNumbers(context: CalculatorTestContext, num1: number, num2: number) {
        context.calculator.add(num1);
        context.calculator.add(num2);
    }

    @when(/I press the total button/gi)
    pressTotal(context: CalculatorTestContext) {
        // No action needed
    }

    @then(/the result should be (\"\d+\") on the screen/i)
    resultShouldBe(context: CalculatorTestContext, expected: number) {
        const actual = context.calculator.getTotal();
        Assert.areIdentical(expected, actual);
    }
}