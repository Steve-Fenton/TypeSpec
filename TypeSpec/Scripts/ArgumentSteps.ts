import {SpecRunner, Assert} from './TypeSpec/TypeSpec';

interface ArgumentTestContext {
    firstArg: string | number | boolean;
    secondArg: string | number | boolean;
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

        runner.addStep(/I pass (\"true\"|\"false\") and (\"true\"|\"false\") as arguments/i,
            (context: ArgumentTestContext, arg1: boolean, arg2: boolean) => {
                context.firstArg = arg1;
                context.secondArg = arg2;
        });

        runner.addStep(/the arguments should be number and string type/i,
            (context: ArgumentTestContext) => {
                Assert.isNumber(context.firstArg);
                Assert.isString(context.secondArg);
            });

        runner.addStep(/the arguments should be boolean type/i,
            (context: ArgumentTestContext) => {
                Assert.isBoolean(context.firstArg);
                Assert.isBoolean(context.secondArg);
        });
    }
}