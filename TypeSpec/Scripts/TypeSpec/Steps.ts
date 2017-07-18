import {ExpressionLibrary} from './RegEx';
import {ITestReporter} from './Keyword';

export class StepDefinition {
    constructor(public expression: RegExp, public step: Function, public isAsync: boolean, public type: StepType) { }
}

export class StepExecution {
    constructor(public method: Function, public isAsync: boolean, public parameters: any[]) { }
}

export enum StepType {
    Given = 1 << 0,
    When = 1 << 1,
    Then = 1 << 2
}

export class StepCollection {
    private steps: StepDefinition[] = [];
    private anyStepType = StepType.Given | StepType.When | StepType.Then;

    constructor(private testReporter: ITestReporter) { }

    add(expression: RegExp, step: Function, isAsync = false, type: StepType = this.anyStepType) {
        this.steps.push(new StepDefinition(expression, step, isAsync, type));
    }

    find(text: string, type: StepType) {
        var i: number;
        var foundStepOfType: StepType[] = [];

        for (i = 0; i < this.steps.length; i++) {
            var step = this.steps[i];
            if (text.match(step.expression)) {

                if (!((type & step.type) === type)) {
                    foundStepOfType.push(step.type);
                    continue;
                }

                var params = this.getParams(text, ExpressionLibrary.defaultStepRegExp, step.expression);
                return new StepExecution(step.step, step.isAsync, params);
            }
        }

        if (foundStepOfType.length > 0) {
            var error = 'Found matching steps, but of type(s): ';
            for (i = 0; i < foundStepOfType.length; i++) {
                error += StepType[foundStepOfType[i]] + ', ';
            }
            error += ' but not ' + StepType[type];

            throw new Error(error);
        }

        return null;
    }

    getParams(text: string, parameterExpression: RegExp, findExpression: RegExp): any[] {
        if (parameterExpression) {

            var typeIndicators = findExpression.source.toString().match(ExpressionLibrary.regexFinderRegExp);
            var params = text.match(parameterExpression);

            var expressionMatches = text.match(findExpression);

            if (!expressionMatches) {
                return [];
            }

            var result: any[] = [];
            for (var i = 1; i < expressionMatches.length; i++) {
                var m = expressionMatches[i];
                m = m.replace(/^"(.+(?="$))"$/, '$1');
                m = m.replace(/^'(.+(?='$))'$/, '$1');
                var paramIndex = i - 1;

                if (!isNaN(parseFloat(m)) && isFinite(parseFloat(m))) {
                    result[paramIndex] = parseFloat(m);
                } else if (m.toLowerCase() == 'true') {
                    result[paramIndex] = true;
                } else if (m.toLowerCase() == 'false') {
                    result[paramIndex] = false;
                } else {
                    result[paramIndex] = m;
                }
            }

            return result;
        }

        return [];
    }
}