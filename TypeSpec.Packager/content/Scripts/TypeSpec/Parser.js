(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./RegEx", "./State"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var RegEx_1 = require("./RegEx");
    var State_1 = require("./State");
    var FeatureParser = (function () {
        function FeatureParser(testReporter, testHooks, steps, tagsToExclude) {
            this.testReporter = testReporter;
            this.steps = steps;
            this.tagsToExclude = tagsToExclude;
            this.scenarios = [];
            this.scenarioIndex = 0;
            this.hasParsed = false;
            this.scenarios[this.scenarioIndex] = new State_1.InitializedState(this.tagsToExclude);
            this.featureRunner = new FeatureRunner(steps, testReporter, testHooks);
        }
        FeatureParser.prototype.run = function (spec, afterFeatureHandler) {
            this.parseSpecification(spec);
            this.runFeature(afterFeatureHandler);
        };
        FeatureParser.prototype.parseSpecification = function (spec) {
            this.hasParsed = true;
            /* Normalise line endings before splitting */
            var lines = spec.replace('\r\n', '\n').split('\n');
            /* Parse the steps */
            for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                var line = lines_1[_i];
                try {
                    this.process(line);
                }
                catch (ex) {
                    this.hasParsed = false;
                    var state = this.scenarios[0] || { featureTitle: 'Unknown' };
                    this.testReporter.error(state.featureTitle, line, ex);
                }
            }
        };
        FeatureParser.prototype.process = function (line) {
            if (this.scenarios[this.scenarioIndex].isNewScenario(line)) {
                // This is an additional scenario within the same feature file.
                var existingFeatureTitle = this.scenarios[this.scenarioIndex].featureTitle;
                var existingFeatureDescription = this.scenarios[this.scenarioIndex].featureDescription;
                this.scenarioIndex++;
                this.scenarios[this.scenarioIndex] = new State_1.FeatureState(null);
                this.scenarios[this.scenarioIndex].featureTitle = existingFeatureTitle;
                this.scenarios[this.scenarioIndex].featureDescription = existingFeatureDescription;
                this.scenarios[this.scenarioIndex].tagsToExclude = this.tagsToExclude;
            }
            // Process the new line
            this.scenarios[this.scenarioIndex] = this.scenarios[this.scenarioIndex].process(line);
        };
        FeatureParser.prototype.runFeature = function (afterFeatureHandler) {
            if (this.hasParsed) {
                this.featureRunner.run(this.scenarios, afterFeatureHandler);
            }
            else {
                afterFeatureHandler();
            }
        };
        return FeatureParser;
    }());
    exports.FeatureParser = FeatureParser;
    var FeatureRunner = (function () {
        function FeatureRunner(steps, testReporter, testHooks) {
            this.steps = steps;
            this.testReporter = testReporter;
            this.testHooks = testHooks;
            this.scenarios = [];
            this.currentCondition = '';
            this.asyncTimeout = 1000; // TODO: Make user configurable
        }
        // HOOK BEFORE / AFTER FEATURE
        FeatureRunner.prototype.run = function (scenarios, afterFeatureHandler) {
            var _this = this;
            this.testHooks.beforeFeature();
            this.scenarios = scenarios;
            var completedScenarios = 0;
            var afterScenarioHandler = function () {
                _this.testHooks.afterScenario();
                completedScenarios++;
                if (completedScenarios === _this.scenarios.length) {
                    afterFeatureHandler();
                }
            };
            // Each Scenario
            for (var _i = 0, _a = this.scenarios; _i < _a.length; _i++) {
                var scenario = _a[_i];
                this.testHooks.beforeScenario();
                if (!scenario.scenarioTitle) {
                    this.testReporter.summary(scenario.featureTitle, 'Ignored', true);
                    afterScenarioHandler();
                    continue;
                }
                this.runScenario(scenario, afterScenarioHandler);
            }
        };
        // HOOK BEFORE / AFTER SCENARIO
        FeatureRunner.prototype.runScenario = function (scenario, scenarioCompleteHandler) {
            var tableRowCount = (scenario.tableRows.length > 0) ? scenario.tableRows.length : 1;
            var completedExamples = 0;
            var examplesCompleteHandler = function () {
                completedExamples++;
                if (completedExamples === tableRowCount) {
                    scenarioCompleteHandler();
                }
            };
            // Each Example Row
            for (var exampleIndex = 0; exampleIndex < tableRowCount; exampleIndex++) {
                try {
                    var context = {};
                    this.testReporter.information('--------------------------------------');
                    this.testReporter.information(scenario.featureTitle);
                    this.testReporter.information('\t' + scenario.featureDescription.join('\r\n\t') + '\r\n\r\n');
                    // Process the scenario steps
                    var conditions = scenario.getAllConditions();
                    this.runNextCondition(conditions, 0, context, scenario, exampleIndex, true, examplesCompleteHandler);
                }
                catch (ex) {
                    this.testReporter.error(scenario.featureTitle, this.currentCondition, ex);
                }
            }
        };
        // HOOK BEFORE / AFTER CONDITION
        FeatureRunner.prototype.runNextCondition = function (conditions, conditionIndex, context, scenario, exampleIndex, passing, examplesCompleteHandler) {
            var _this = this;
            try {
                var next = conditions[conditionIndex];
                var nextConditionIndex_1 = conditionIndex + 1;
                var completionHandled_1 = false;
                var timer_1 = null;
                this.testHooks.beforeCondition();
                this.currentCondition = next.condition;
                /* Handler to run after the condition completes... */
                context.done = function () {
                    if (completionHandled_1) {
                        return;
                    }
                    completionHandled_1 = true;
                    if (timer_1) {
                        clearTimeout(timer_1);
                    }
                    _this.testHooks.afterCondition();
                    if (nextConditionIndex_1 < conditions.length) {
                        _this.runNextCondition(conditions, nextConditionIndex_1, context, scenario, exampleIndex, passing, examplesCompleteHandler);
                    }
                    else {
                        _this.testReporter.summary(scenario.featureTitle, scenario.scenarioTitle, passing);
                        examplesCompleteHandler();
                    }
                };
                var condition_1 = scenario.prepareCondition(next.condition, exampleIndex);
                this.testReporter.information('\t' + condition_1);
                var stepExecution = this.steps.find(condition_1, next.type);
                if (stepExecution === null) {
                    var stepMethodBuilder = new StepMethodBuilder(condition_1);
                    throw new Error('No step definition defined.\n\n' + stepMethodBuilder.getSuggestedStepMethod());
                }
                var isAsync = stepExecution.isAsync;
                if (stepExecution.parameters) {
                    // Add the context container as the first argument
                    stepExecution.parameters.unshift(context);
                    // Call the step method
                    stepExecution.method.apply(null, stepExecution.parameters);
                }
                else {
                    // Call the step method
                    stepExecution.method.call(null, context);
                }
                if (isAsync) {
                    timer_1 = setTimeout(function () {
                        if (completionHandled_1) {
                            return;
                        }
                        completionHandled_1 = true;
                        passing = false;
                        _this.testReporter.error('Async Exception', condition_1, new Error('Async step timed out'));
                        _this.testReporter.summary(scenario.featureTitle, scenario.scenarioTitle, passing);
                        examplesCompleteHandler();
                    }, this.asyncTimeout);
                }
                else {
                    context.done();
                }
            }
            catch (ex) {
                passing = false;
                this.testReporter.error(scenario.featureTitle, this.currentCondition, ex);
                this.testReporter.summary(scenario.featureTitle, scenario.scenarioTitle, passing);
                examplesCompleteHandler();
            }
        };
        return FeatureRunner;
    }());
    var StepMethodBuilder = (function () {
        function StepMethodBuilder(originalCondition) {
            this.originalCondition = originalCondition;
        }
        StepMethodBuilder.prototype.getSuggestedStepMethod = function () {
            var argumentParser = new ArgumentParser(this.originalCondition);
            /* Template for step method */
            var params = argumentParser.getParameters();
            var comma = (params.length > 0) ? ', ' : '';
            var suggestion = '    runner.addStep(/^' + argumentParser.getCondition() + '$/i,\n' +
                '        (context: any' + comma + params + ') => {\n' +
                '            throw new Error(\'Not implemented.\');\n' +
                '        });';
            return suggestion;
        };
        return StepMethodBuilder;
    }());
    var ArgumentParser = (function () {
        function ArgumentParser(originalCondition) {
            this.originalCondition = originalCondition;
            this.arguments = [];
            this.condition = originalCondition;
            this.parseArguments();
        }
        ArgumentParser.prototype.getCondition = function () {
            return this.condition;
        };
        ArgumentParser.prototype.getParameters = function () {
            return this.arguments.join(', ');
        };
        ArgumentParser.prototype.parseArguments = function () {
            var foundArguments = this.originalCondition.match(RegEx_1.ExpressionLibrary.quotedArgumentsRegExp);
            if (!foundArguments || foundArguments.length === 0) {
                return;
            }
            for (var i = 0; i < foundArguments.length; i++) {
                var foundArgument = foundArguments[i];
                this.replaceArgumentWithExpression(foundArgument, i);
            }
        };
        ArgumentParser.prototype.replaceArgumentWithExpression = function (quotedArgument, position) {
            var trimmedArgument = quotedArgument.replace(/"/g, '');
            var argumentExpression = null;
            if (this.isBooleanArgument(trimmedArgument)) {
                this.arguments.push('p' + position + ': boolean');
                argumentExpression = RegEx_1.ExpressionLibrary.trueFalseString;
            }
            else if (this.isNumericArgument(trimmedArgument)) {
                this.arguments.push('p' + position + ': number');
                argumentExpression = RegEx_1.ExpressionLibrary.numberString;
            }
            else {
                this.arguments.push('p' + position + ': string');
                argumentExpression = RegEx_1.ExpressionLibrary.defaultString;
            }
            this.condition = this.condition.replace(quotedArgument, argumentExpression);
        };
        ArgumentParser.prototype.isBooleanArgument = function (argument) {
            return (argument.toLowerCase() === 'true' || argument.toLowerCase() === 'false');
        };
        ArgumentParser.prototype.isNumericArgument = function (argument) {
            return (parseFloat(argument).toString() === argument);
        };
        return ArgumentParser;
    }());
});
//# sourceMappingURL=Parser.js.map