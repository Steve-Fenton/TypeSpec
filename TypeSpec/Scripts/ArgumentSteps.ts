import {SpecRunner, Assert} from './TypeSpec/TypeSpec';

interface ArgumentTestContext {
    firstArg: string | number;
    secondArg: string | number;
}

export class ArgumentSteps {
    static register(runner: SpecRunner) {
        runner.addStep(/I am passing arguments/i,
            (context: ArgumentTestContext) => {
                context.firstArg = null;
                context.secondArg = null;
            });

        runner.addStep(/I pass "(\d+)" and "(.*)" as arguments/i,
            (context: ArgumentTestContext, arg1: number, arg2: string) => {
                context.firstArg = arg1;
                context.secondArg = arg2;
            });

        runner.addStep(/the arguments should be the correct type/i,
            (context: ArgumentTestContext) => {
                Assert.isNumber(context.firstArg);
                Assert.isString(context.secondArg);
            });
    }
}