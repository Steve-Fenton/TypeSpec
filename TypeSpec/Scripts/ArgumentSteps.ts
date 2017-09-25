import { Assert, given, when, then } from './TypeSpec/TypeSpec';

export interface ArgumentTestContext {
    firstArg: string | number | boolean | null;
    secondArg: string | number | boolean | null;
}

export class ArgumentSteps {
    @given(/^I am passing arguments$/i)
    passingArguments(context: ArgumentTestContext) {
        context.firstArg = null;
        context.secondArg = null;
    }

    @when(/^I pass (\"\d+\") and "(.*)" as arguments$/i)
    passNumberAndStringArgument(context: ArgumentTestContext, arg1: number, arg2: string) {
        context.firstArg = arg1;
        context.secondArg = arg2;
    }

    @when(/^I pass (\"true\"|\"false\") and (\"true\"|\"false\") as arguments$/i)
    passBooleanAndBooleanArguments(context: ArgumentTestContext, arg1: boolean, arg2: boolean) {
        context.firstArg = arg1;
        context.secondArg = arg2;
    }

    @then(/^the arguments should be number and string type$/i)
    argumentsAreNumberAndString(context: ArgumentTestContext) {
        Assert.isNumber(context.firstArg);
        Assert.isString(context.secondArg);
    }

    @then(/^the arguments should be boolean type$/i)
    argumentsAreBoolean(context: ArgumentTestContext) {
        Assert.isBoolean(context.firstArg);
        Assert.isBoolean(context.secondArg);
    }

    static register() {
    }
}