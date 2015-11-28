var RegEx_1 = require('./RegEx');
var StepDefinition = (function () {
    function StepDefinition(expression, step) {
        this.expression = expression;
        this.step = step;
    }
    return StepDefinition;
})();
exports.StepDefinition = StepDefinition;
var StepExecution = (function () {
    function StepExecution(method, parameters) {
        this.method = method;
        this.parameters = parameters;
    }
    return StepExecution;
})();
exports.StepExecution = StepExecution;
var StepCollection = (function () {
    function StepCollection() {
        this.steps = [];
    }
    StepCollection.prototype.add = function (expression, step) {
        this.steps.push(new StepDefinition(expression, step));
    };
    StepCollection.prototype.find = function (text) {
        for (var i = 0; i < this.steps.length; i++) {
            var step = this.steps[i];
            if (text.match(step.expression)) {
                var params = this.getParams(text, RegEx_1.ExpressionLibrary.defaultStepRegExp, step.expression);
                return new StepExecution(step.step, params);
            }
        }
        return null;
    };
    StepCollection.prototype.getParams = function (text, parameterExpression, findExpression) {
        if (parameterExpression) {
            var typeIndicators = findExpression.source.toString().match(RegEx_1.ExpressionLibrary.regexFinderRegExp);
            var params = text.match(parameterExpression);
            if (!params) {
                return [];
            }
            for (var i = 0; i < params.length; i++) {
                var val = params[i].replace(/"/g, '');
                if (typeIndicators !== null && typeIndicators[i]) {
                    var indicator = typeIndicators[i];
                    switch (indicator) {
                        case "\\d+":
                            val = parseFloat(val);
                            break;
                        case "(\\\"true\\\"|\\\"false\\\")", "(\\\"true\\\"|\\\"false\\\")":
                            val = (val.toLowerCase() === 'true');
                            break;
                    }
                }
                params[i] = val;
            }
            return params;
        }
        return [];
    };
    return StepCollection;
})();
exports.StepCollection = StepCollection;
