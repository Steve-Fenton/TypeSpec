import { ExpressionLibrary } from './RegEx';

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

    add(expression: RegExp, step: Function, isAsync = false, type: StepType = this.anyStepType) {
        this.steps.push(new StepDefinition(expression, step, isAsync, type));
    }

    find(text: string, type: StepType) {
        let foundStepTypes: StepType[] = [];

        for (const step of this.steps) {
            if (text.match(step.expression)) {
                if (!((type & step.type) === type)) {
                    foundStepTypes.push(step.type);
                    continue;
                }

                let params = this.getParams(text, ExpressionLibrary.defaultStepRegExp, step.expression);
                return new StepExecution(step.step, step.isAsync, params);
            }
        }

        if (foundStepTypes.length > 0) {
            let error = 'Found matching steps, but of type(s): ';
            for (const foundStepType of foundStepTypes) {
                error += StepType[foundStepType] + ', ';
            }
            error += ' but not ' + StepType[type];

            throw new Error(error);
        }

        return null;
    }

    getParams(text: string, parameterExpression: RegExp, findExpression: RegExp): any[] {
        if (parameterExpression) {

            const typeIndicators = findExpression.source.toString().match(ExpressionLibrary.regexFinderRegExp) || [];
            const matches = text.match(findExpression);

            if (!matches) {
                return [];
            }

            let result: any[] = [];
            for (let i = 1; i < matches.length; i++) {
                let match = matches[i];
                match = match.replace(/^"(.+(?="$))"$/, '$1');
                match = match.replace(/^'(.+(?='$))'$/, '$1');

                const paramIndex = i - 1;
                const indicator = typeIndicators[i - 1] || '';

                switch (indicator) {
                    case "\\d+":
                        result[paramIndex] = parseFloat(match);
                        break;
                    case "(\\\"true\\\"|\\\"false\\\")":
                        result[paramIndex] = ((<string>match).toLowerCase() === 'true');
                        break;
                    default:
                        result[paramIndex] = match;
                }
            }

            return result;
        }

        return [];
    }
}