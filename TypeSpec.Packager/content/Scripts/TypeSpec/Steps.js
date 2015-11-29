(function (deps, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(deps, factory);
    }
})(["require", "exports", './RegEx'], function (require, exports) {
    var RegEx_1 = require('./RegEx');
    var StepDefinition = (function () {
        function StepDefinition(expression, step, type) {
            this.expression = expression;
            this.step = step;
            this.type = type;
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
    (function (StepType) {
        StepType[StepType["Given"] = 1] = "Given";
        StepType[StepType["When"] = 2] = "When";
        StepType[StepType["Then"] = 4] = "Then";
    })(exports.StepType || (exports.StepType = {}));
    var StepType = exports.StepType;
    var StepCollection = (function () {
        function StepCollection(testReporter) {
            this.testReporter = testReporter;
            this.steps = [];
            this.anyStepType = StepType.Given | StepType.When | StepType.Then;
        }
        StepCollection.prototype.add = function (expression, step, type) {
            if (type === void 0) { type = this.anyStepType; }
            this.steps.push(new StepDefinition(expression, step, type));
        };
        StepCollection.prototype.find = function (text, type) {
            var i;
            var foundStepOfType = [];
            for (i = 0; i < this.steps.length; i++) {
                var step = this.steps[i];
                if (text.match(step.expression)) {
                    if (!((type & step.type) === type)) {
                        foundStepOfType.push(step.type);
                        continue;
                    }
                    var params = this.getParams(text, RegEx_1.ExpressionLibrary.defaultStepRegExp, step.expression);
                    return new StepExecution(step.step, params);
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
        };
        StepCollection.prototype.getParams = function (text, parameterExpression, findExpression) {
            if (parameterExpression) {
                var typeIndicators = findExpression.source.toString().match(RegEx_1.ExpressionLibrary.regexFinderRegExp);
                var params = text.match(parameterExpression);
                if (!params) {
                    return [];
                }
                for (var i = 0; i < params.length; i++) {
                    // Remove quotes
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
});
//# sourceMappingURL=Steps.js.map