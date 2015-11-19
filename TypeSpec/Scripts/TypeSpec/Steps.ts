export class StepDefinition {
    public defaultRegExp = /"(?:[^"\\]|\\.)*"/ig;

    constructor(public expression: RegExp, public step: Function) { }
}

export class StepExecution {
    constructor(public method: Function, public parameters: any[]) { }
}

export class StepCollection {
    private steps: StepDefinition[] = [];
    private regexFinder = /([\.\\]([*a-z])\+?)/g;


    add(expression: RegExp, step: Function) {
        this.steps.push(new StepDefinition(expression, step));
    }

    find(text: string) {
        for (var i = 0; i < this.steps.length; i++) {
            var step = this.steps[i];
            if (text.match(step.expression)) {
                var params = this.getParams(text, step.defaultRegExp, step.expression);
                return new StepExecution(step.step, params);
            }
        }
        return null;
    }

    getParams(text: string, parameterExpression: RegExp, findExpression: RegExp): any[] {
        if (parameterExpression) {

            var typeIndicators = findExpression.source.toString().match(this.regexFinder);
            var params = text.match(parameterExpression);

            if (!params) {
                return [];
            }

            for (var i = 0; i < params.length; i++) {
                // Remove quotes
                var val: any = params[i].replace(/"/g, '');

                if (typeIndicators[i]) {
                    var indicator = typeIndicators[i];
                    // Currently we are only interested in parsing `number` types.
                    switch (indicator) {
                        case "\\d+":
                            val = parseFloat(val);
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