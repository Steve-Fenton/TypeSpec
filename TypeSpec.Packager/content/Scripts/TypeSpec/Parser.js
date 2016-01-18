(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './RegEx', './State'], factory);
    }
})(function (require, exports) {
    var RegEx_1 = require('./RegEx');
    var State_1 = require('./State');
    var FeatureParser = (function () {
        function FeatureParser(steps, testReporter, tagsToExclude) {
            this.steps = steps;
            this.testReporter = testReporter;
            this.tagsToExclude = tagsToExclude;
            this.scenarios = [];
            this.i = 0;
            this.scenarios[this.i] = new State_1.InitializedState(this.tagsToExclude);
            this.featureRunner = new FeatureRunner(steps, testReporter);
        }
        FeatureParser.prototype.process = function (line) {
            if (this.scenarios[this.i].isNewScenario(line)) {
                // This is an additional scenario within the same feature file.
                var existingFeatureTitle = this.scenarios[this.i].featureTitle;
                var existingFeatureDescription = this.scenarios[this.i].featureDescription;
                this.i++;
                this.scenarios[this.i] = new State_1.FeatureState(null);
                this.scenarios[this.i].featureTitle = existingFeatureTitle;
                this.scenarios[this.i].featureDescription = existingFeatureDescription;
                this.scenarios[this.i].tagsToExclude = this.tagsToExclude;
            }
            // Process the new line
            this.scenarios[this.i] = this.scenarios[this.i].process(line);
        };
        FeatureParser.prototype.runFeature = function (featureComplete) {
            this.featureRunner.run(this.scenarios, featureComplete);
        };
        return FeatureParser;
    })();
    exports.FeatureParser = FeatureParser;
    var FeatureRunner = (function () {
        function FeatureRunner(steps, testReporter) {
            this.steps = steps;
            this.testReporter = testReporter;
            this.scenarios = [];
            this.currentCondition = '';
            this.asyncTimeout = 1000; // TODO: Make user configurable
        }
        FeatureRunner.prototype.run = function (scenarios, featureComplete) {
            var _this = this;
            this.scenarios = scenarios;
            var completedScenarios = 0;
            var scenarioComplete = function () {
                completedScenarios++;
                if (completedScenarios === _this.scenarios.length) {
                    featureComplete();
                }
            };
            // Each Scenario
            for (var scenarioIndex = 0; scenarioIndex < this.scenarios.length; scenarioIndex++) {
                var scenario = this.scenarios[scenarioIndex];
                if (typeof scenario.scenarioTitle === 'undefined') {
                    this.testReporter.information(scenario.featureTitle + ' has an ignored scenario, or a scenario missing a title.');
                    scenarioComplete();
                    continue;
                }
                this.runScenario(scenario, scenarioComplete);
            }
        };
        FeatureRunner.prototype.runScenario = function (scenario, scenarioComplete) {
            var tableRowCount = (scenario.tableRows.length > 0) ? scenario.tableRows.length : 1;
            var completedExamples = 0;
            var examplesComplete = function () {
                completedExamples++;
                if (completedExamples === tableRowCount) {
                    scenarioComplete();
                }
            };
            // Each Example Row
            for (var exampleIndex = 0; exampleIndex < tableRowCount; exampleIndex++) {
                try {
                    var passed = true;
                    var i;
                    var context = {};
                    this.testReporter.information('--------------------------------------');
                    this.testReporter.information(scenario.featureTitle);
                    this.testReporter.information('\t' + scenario.featureDescription.join('\r\n\t') + '\r\n\r\n');
                    // Process the scenario steps
                    var conditions = scenario.getAllConditions();
                    this.runNextCondition(conditions, 0, context, scenario, exampleIndex, true, examplesComplete);
                }
                catch (ex) {
                    passed = false;
                    this.testReporter.error(scenario.featureTitle, this.currentCondition, ex);
                }
            }
        };
        FeatureRunner.prototype.runNextCondition = function (conditions, conditionIndex, context, scenario, exampleIndex, passing, examplesComplete) {
            var _this = this;
            try {
                var next = conditions[conditionIndex];
                var i = conditionIndex + 1;
                this.currentCondition = next.condition;
                context.done = function () {
                    if (_this.asyncTimer) {
                        clearTimeout(_this.asyncTimer);
                    }
                    if (i < conditions.length) {
                        _this.runNextCondition(conditions, i, context, scenario, exampleIndex, passing, examplesComplete);
                    }
                    else {
                        _this.testReporter.summary(scenario.featureTitle, scenario.scenarioTitle, passing);
                        examplesComplete();
                    }
                };
                var condition = scenario.prepareCondition(next.condition, exampleIndex);
                this.testReporter.information('\t' + condition);
                var stepExecution = this.steps.find(condition, next.type);
                if (stepExecution === null) {
                    var stepMethodBuilder = new StepMethodBuilder(condition);
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
                    this.asyncTimer = setTimeout(function () {
                        _this.testReporter.error('Async Exception', condition, new Error('Async step timed out'));
                        _this.runNextCondition(conditions, i, context, scenario, exampleIndex, false, examplesComplete);
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
                examplesComplete();
            }
        };
        return FeatureRunner;
    })();
    exports.FeatureRunner = FeatureRunner;
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
    })();
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
            if (foundArguments && foundArguments.length === 0) {
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
    })();
});
//# sourceMappingURL=Parser.js.map