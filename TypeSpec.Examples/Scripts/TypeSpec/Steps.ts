import {ExpressionLibrary} from './RegEx';

export class StepDefinition {
    constructor(public expression: RegExp, public step: Function) { }
}

export class StepExecution {
    constructor(public method: Function, public parameters: any[]) { }
}

export class StepCollection {
    private steps: StepDefinition[] = [];

    add(expression: RegExp, step: Function) {
        this.steps.push(new StepDefinition(expression, step));
    }

    find(text: string) {
        for (var i = 0; i < this.steps.length; i++) {
            var step = this.steps[i];
            if (text.match(step.expression)) {
                var params = this.getParams(text, ExpressionLibrary.defaultStepRegExp, step.expression);
                return new StepExecution(step.step, params);
            }
        }
        return null;
    }

    getParams(text: string, parameterExpression: RegExp, findExpression: RegExp): any[] {
        if (parameterExpression) {

            var typeIndicators = findExpression.source.toString().match(ExpressionLibrary.regexFinderRegExp);
            var params = text.match(parameterExpression);

            if (!params) {
                return [];
            }

            for (var i = 0; i < params.length; i++) {
                // Remove quotes
                var val: any = params[i].replace(/"/g, '');

                if (typeIndicators !== null && typeIndicators[i]) {
                    var indicator = typeIndicators[i];

                    switch (indicator) {
                        case "\\d+":
                            val = parseFloat(val);
                            break;
                        case "(\\\"true\\\"|\\\"false\\\")", "(\\\"true\\\"|\\\"false\\\")":
                            val = ((<string>val).toLowerCase() === 'true');
                            break;
                    }
                }

                params[i] = val;
            }

            return params;
        }

        return [];
    }
}