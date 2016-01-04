(function (deps, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(deps, factory);
    }
})(["require", "exports", './Keyword', './RegEx', './Steps', './State'], function (require, exports) {
    var Keyword_1 = require('./Keyword');
    var RegEx_1 = require('./RegEx');
    var Steps_1 = require('./Steps');
    var State_1 = require('./State');
    var FeatureParser = (function () {
        function FeatureParser(steps, testReporter, tagsToExclude) {
            this.steps = steps;
            this.testReporter = testReporter;
            this.tagsToExclude = tagsToExclude;
            this.tags = [];
            this.state = [];
            this.scenarioIndex = 0;
            this.state[this.scenarioIndex] = new State_1.InitializedState(this.tagsToExclude);
        }
        FeatureParser.prototype.process = function (line) {
            if (this.state[this.scenarioIndex].isNewScenario(line)) {
                // This is an additional scenario within the same feature.
                var existingFeatureTitle = this.state[this.scenarioIndex].featureTitle;
                var existingFeatureDescription = this.state[this.scenarioIndex].featureDescription;
                this.scenarioIndex++;
                this.state[this.scenarioIndex] = new State_1.FeatureState(null);
                this.state[this.scenarioIndex].featureTitle = existingFeatureTitle;
                this.state[this.scenarioIndex].featureDescription = existingFeatureDescription;
                this.state[this.scenarioIndex].tagsToExclude = this.tagsToExclude;
            }
            // Process the new line
            this.state[this.scenarioIndex] = this.state[this.scenarioIndex].process(line);
        };
        FeatureParser.prototype.run = function () {
            for (var scenarioIndex = 0; scenarioIndex < this.state.length; scenarioIndex++) {
                var scenario = this.state[scenarioIndex];
                if (typeof scenario.scenarioTitle === 'undefined') {
                    this.testReporter.information(scenario.featureTitle + ' has an ignored scenario, or a scenario missing a title.');
                    continue;
                }
                this.runScenario(scenario);
            }
        };
        FeatureParser.prototype.runScenario = function (scenario) {
            var tableRowCount = (scenario.tableRows.length > 0) ? scenario.tableRows.length : 1;
            for (var exampleIndex = 0; exampleIndex < tableRowCount; exampleIndex++) {
                try {
                    var passed = true;
                    var i;
                    var dynamicStateContainer = {};
                    this.testReporter.information('--------------------------------------');
                    this.testReporter.information(Keyword_1.Keyword.Feature);
                    this.testReporter.information(scenario.featureTitle);
                    for (i = 0; i < scenario.featureDescription.length; i++) {
                        this.testReporter.information('\t' + scenario.featureDescription[i]);
                    }
                    // Given
                    this.testReporter.information(Keyword_1.Keyword.Given);
                    for (i = 0; i < scenario.givens.length; i++) {
                        passed = passed && this.executeWithErrorHandling(dynamicStateContainer, scenario, exampleIndex, scenario.givens[i], scenario.featureTitle, scenario.scenarioTitle, Steps_1.StepType.Given);
                    }
                    // When
                    this.testReporter.information(Keyword_1.Keyword.When);
                    for (i = 0; i < scenario.whens.length; i++) {
                        passed = passed && this.executeWithErrorHandling(dynamicStateContainer, scenario, exampleIndex, scenario.whens[i], scenario.featureTitle, scenario.scenarioTitle, Steps_1.StepType.When);
                    }
                    // Then
                    this.testReporter.information(Keyword_1.Keyword.Then);
                    for (i = 0; i < scenario.thens.length; i++) {
                        passed = passed && this.executeWithErrorHandling(dynamicStateContainer, scenario, exampleIndex, scenario.thens[i], scenario.featureTitle, scenario.scenarioTitle, Steps_1.StepType.Then);
                    }
                }
                catch (ex) {
                    passed = false;
                }
                finally {
                    this.testReporter.summary(scenario.featureTitle, scenario.scenarioTitle, passed);
                }
            }
        };
        FeatureParser.prototype.executeWithErrorHandling = function (dynamicStateContainer, scenario, exampleIndex, condition, featureTitle, scenarioTitle, type) {
            try {
                this.runCondition(dynamicStateContainer, scenario, exampleIndex, condition, type);
                return true;
            }
            catch (ex) {
                this.testReporter.error(featureTitle, condition, ex);
                return false;
            }
        };
        FeatureParser.prototype.runCondition = function (dynamicStateContainer, scenario, exampleIndex, condition, type) {
            condition = scenario.prepareCondition(condition, exampleIndex);
            this.testReporter.information('\t' + condition);
            var stepExecution = this.steps.find(condition, type);
            if (stepExecution === null) {
                var stepMethodBuilder = new StepMethodBuilder(condition);
                throw new Error('No step definition defined.\n\n' + stepMethodBuilder.getSuggestedStepMethod());
            }
            if (stepExecution.parameters) {
                // Add the context container as the first argument
                stepExecution.parameters.unshift(dynamicStateContainer);
                // Call the step method
                stepExecution.method.apply(null, stepExecution.parameters);
            }
            else {
                // Call the step method
                stepExecution.method(dynamicStateContainer);
            }
        };
        return FeatureParser;
    })();
    exports.FeatureParser = FeatureParser;
    var StepMethodBuilder = (function () {
        function StepMethodBuilder(originalCondition) {
            this.originalCondition = originalCondition;
        }
        StepMethodBuilder.prototype.getSuggestedStepMethod = function () {
            var argumentParser = new ArgumentParser(this.originalCondition);
            /* Template for step method */
            var suggestion = '    runner.addStep(/' + argumentParser.getCondition() + '/i,\n' +
                '        (context: any, ' + argumentParser.getParameters() + ') => {\n' +
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
            if (foundArguments && foundArguments.length > 0) {
                for (var i = 0; i < foundArguments.length; i++) {
                    var foundArgument = foundArguments[i];
                    this.processFoundArgument(foundArgument, i);
                }
            }
        };
        ArgumentParser.prototype.processFoundArgument = function (quotedArgument, position) {
            var trimmedArgument = quotedArgument.replace(/"/g, '');
            var argumentExpression = null;
            if (trimmedArgument.toLowerCase() === 'true' || trimmedArgument.toLowerCase() === 'false') {
                // Argument is boolean
                this.arguments.push('p' + position + ': boolean');
                argumentExpression = RegEx_1.ExpressionLibrary.trueFalseString;
            }
            else if (parseFloat(trimmedArgument).toString() === trimmedArgument) {
                // Argument is number
                this.arguments.push('p' + position + ': number');
                argumentExpression = RegEx_1.ExpressionLibrary.numberString;
            }
            else {
                // Argument is string
                this.arguments.push('p' + position + ': string');
                argumentExpression = RegEx_1.ExpressionLibrary.defaultString;
            }
            this.condition = this.condition.replace(quotedArgument, argumentExpression);
        };
        return ArgumentParser;
    })();
});
//# sourceMappingURL=Parser.js.map