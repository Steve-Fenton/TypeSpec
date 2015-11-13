export class StepDefinition {
    constructor(public expression: RegExp, public parameter: RegExp, public step: Function) { }
}

export class StepExecution {
    constructor(public method: Function, public parameters: any[]) { }
}

export class StepDefinitions {
    private steps: StepDefinition[] = [];

    add(expression: RegExp, parameter: RegExp, step: Function) {
        this.steps.push(new StepDefinition(expression, parameter, step));
    }

    find(text: string) {
        for (var i = 0; i < this.steps.length; i++) {
            var step = this.steps[i];
            if (text.match(step.expression)) {
                var params = this.getParams(text, step.parameter);
                return new StepExecution(step.step, params);
            }
        }
        return null;
    }

    getParams(text: string, parameterExpression: RegExp): any[] {
        if (parameterExpression) {
            return parameterExpression.exec(text);
        }

        return [];
    }
}