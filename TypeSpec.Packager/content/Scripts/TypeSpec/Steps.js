(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./RegEx"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var RegEx_1 = require("./RegEx");
    var StepDefinition = (function () {
        function StepDefinition(expression, step, isAsync, type) {
            this.expression = expression;
            this.step = step;
            this.isAsync = isAsync;
            this.type = type;
        }
        return StepDefinition;
    }());
    exports.StepDefinition = StepDefinition;
    var StepExecution = (function () {
        function StepExecution(method, isAsync, parameters) {
            this.method = method;
            this.isAsync = isAsync;
            this.parameters = parameters;
        }
        return StepExecution;
    }());
    exports.StepExecution = StepExecution;
    var StepType;
    (function (StepType) {
        StepType[StepType["Given"] = 1] = "Given";
        StepType[StepType["When"] = 2] = "When";
        StepType[StepType["Then"] = 4] = "Then";
    })(StepType = exports.StepType || (exports.StepType = {}));
    var StepCollection = (function () {
        function StepCollection(testReporter) {
            this.testReporter = testReporter;
            this.steps = [];
            this.anyStepType = StepType.Given | StepType.When | StepType.Then;
        }
        StepCollection.prototype.add = function (expression, step, isAsync, type) {
            if (isAsync === void 0) { isAsync = false; }
            if (type === void 0) { type = this.anyStepType; }
            this.steps.push(new StepDefinition(expression, step, isAsync, type));
        };
        StepCollection.prototype.find = function (text, type) {
            var foundStepTypes = [];
            for (var _i = 0, _a = this.steps; _i < _a.length; _i++) {
                var step = _a[_i];
                if (text.match(step.expression)) {
                    if (!((type & step.type) === type)) {
                        foundStepTypes.push(step.type);
                        continue;
                    }
                    var params = this.getParams(text, RegEx_1.ExpressionLibrary.defaultStepRegExp, step.expression);
                    return new StepExecution(step.step, step.isAsync, params);
                }
            }
            if (foundStepTypes.length > 0) {
                var error = 'Found matching steps, but of type(s): ';
                for (var _b = 0, foundStepTypes_1 = foundStepTypes; _b < foundStepTypes_1.length; _b++) {
                    var foundStepType = foundStepTypes_1[_b];
                    error += StepType[foundStepType] + ', ';
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
                var expressionMatches = text.match(findExpression);
                if (!expressionMatches) {
                    return [];
                }
                var result = [];
                for (var i = 1; i < expressionMatches.length; i++) {
                    var m = expressionMatches[i];
                    m = m.replace(/^"(.+(?="$))"$/, '$1');
                    m = m.replace(/^'(.+(?='$))'$/, '$1');
                    var paramIndex = i - 1;
                    if (!isNaN(parseFloat(m)) && isFinite(parseFloat(m))) {
                        result[paramIndex] = parseFloat(m);
                    }
                    else if (m.toLowerCase() == 'true') {
                        result[paramIndex] = true;
                    }
                    else if (m.toLowerCase() == 'false') {
                        result[paramIndex] = false;
                    }
                    else {
                        result[paramIndex] = m;
                    }
                }
                return result;
            }
            return [];
        };
        return StepCollection;
    }());
    exports.StepCollection = StepCollection;
});
//# sourceMappingURL=Steps.js.map