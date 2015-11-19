export class StepDefinition {
    public defaultRegExp = /"(?:[^"\\]|\\.)*"/ig;

    constructor(public expression: RegExp, public step: Function) { }
}

export class StepExecution {
    constructor(public method: Function, public parameters: any[]) { }
}

export class StepCollection {
    private steps: StepDefinition[] = [];
    // Part one finds things like "(.*)" and (\"\d+\") = /([\.\\]([*a-z])\+?)/g;
    // Part two finds things like (\"true\"|\"false\") = \(\\\"true\\\"\|\\"false\\\"\)
    private regexFinder = /([\.\\]([*a-z])\+?)|\(\\\"true\\\"\|\\"false\\\"\)/g;

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
            //console.log(JSON.stringify(typeIndicators));

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