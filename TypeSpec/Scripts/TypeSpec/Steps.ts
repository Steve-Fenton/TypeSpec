export class StepDefinition {
    public defaultRegExp = /"(?:[^"\\]|\\.)*"/ig;

    constructor(public expression: RegExp, public step: Function) { }
}

export class StepExecution {
    constructor(public method: Function, public parameters: any[]) { }
}

export class StepDefinitions {
    private steps: StepDefinition[] = [];
   

    add(expression: RegExp, step: Function) {
        this.steps.push(new StepDefinition(expression, step));
    }

    find(text: string) {
        for (var i = 0; i < this.steps.length; i++) {
            var step = this.steps[i];
            if (text.match(step.expression)) {
                var params = this.getParams(text, step.defaultRegExp);
                return new StepExecution(step.step, params);
            }
        }
        return null;
    }

    getParams(text: string, parameterExpression: RegExp): any[] {
        if (parameterExpression) {
            var params = text.match(parameterExpression);

            if (!params) {
                return [];
            }

            for (var i = 0; i < params.length; i++) {
                // Remove quotes
                params[i] = params[i].replace(/"/g, '');
            }

            return params;
        }

        return [];
    }
}