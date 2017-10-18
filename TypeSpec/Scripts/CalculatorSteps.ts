import { Assert, Kind, step, given} from './TypeSpec/TypeSpec';
import { Calculator } from './Calculator';

export interface CalculatorTestContext {
    done: () => void; // Standard TypeSpec aync done method.
    calculator: Calculator;
}

export class CalculatorSteps {
    @given(/^I am using a calculator$/i)
    usingACalculator(context: CalculatorTestContext) {
        context.calculator = new Calculator();
    }

    @step(/^I enter (\"\d+\") into the calculator$/i) 
    enterNumber(context: CalculatorTestContext, num: number) {
        context.calculator.add(num);
    }

    @step(/^I enter (\"\d+\") and (\"\d+\") into the calculator$/i)
    enterNumbers(context: CalculatorTestContext, num1: number, num2: number) {
        context.calculator.add(num1);
        context.calculator.add(num2);
    }

    @step(/^I enter an unquoted (\d+) into the calculator$/i)
    enterUnquotedNumber(context: CalculatorTestContext, num: number) {
        context.calculator.add(num);
    }

    @step(/^I speak "(.*)" into the calculator$/i)
    speakNumber(context: CalculatorTestContext, sentence: string) {
        const matches = sentence.match(/(\+|-)?((\d+(\.\d+)?)|(\.\d+))/) || ['0'];
        const num = parseFloat(matches[0]);
        context.calculator.add(num);
    }

    @step(/^I asynchronously enter (\"\d+\") into the calculator$/i, Kind.Async)
    asyncAddNumber(context: CalculatorTestContext, num: number) {
        window.setTimeout(() => {
            context.calculator.add(num);

            // Tell TypeSpec the async operation is complete.
            context.done();
        }, 200);
    }

    @step(/^the asynchronous request times out when I enter (\"\d+\") into the calculator$/i, Kind.Async)
    requestTimesOut(context: any, num: number) {
        const _ctx = context;
        window.setTimeout(() => {
            _ctx.calculator.add(num);

            // Tell TypeSpec the async operation is complete.
            _ctx.done();
        }, 1200); // 1200ms exceeds the timeout of 1000ms
    }

    @step(/^I press the total button$/gi)
    pressTotal() {
    }

    @step(/^the result should be (\"\d+\") on the screen$/i)
    resultShouldBe(context: CalculatorTestContext, expected: number) {
        const actual = context.calculator.getTotal();
        Assert.areIdentical(expected, actual);
    }

    @step(/^the result should be an unquoted (\d+) on the screen$/i)
    resultShouldBeUnquoted(context: CalculatorTestContext, expected: number) {
        const actual = context.calculator.getTotal();
        Assert.areIdentical(expected, actual);
    }

    static register() {
    }
}