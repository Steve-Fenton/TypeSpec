import {Keyword, ITestReporter} from './Keyword';
import {ExpressionLibrary} from './RegEx';
import {StepCollection, StepType} from './Steps';
import {StateBase, InitializedState, FeatureState} from './State';

export class FeatureParser {
    public tags: string[] = [];
    public state: StateBase[] = [];
    public scenarioIndex = 0;
    public currentCondition = '';
    public asyncTimeout = 1000;
    public asyncTimer: any;

    constructor(private steps: StepCollection, private testReporter: ITestReporter, private tagsToExclude: string[]) {
        this.state[this.scenarioIndex] = new InitializedState(this.tagsToExclude);
    }

    process(line: string) {
        if (this.state[this.scenarioIndex].isNewScenario(line)) {
            // This is an additional scenario within the same feature.
            var existingFeatureTitle = this.state[this.scenarioIndex].featureTitle;
            var existingFeatureDescription = this.state[this.scenarioIndex].featureDescription;

            this.scenarioIndex++;

            this.state[this.scenarioIndex] = new FeatureState(null);
            this.state[this.scenarioIndex].featureTitle = existingFeatureTitle;
            this.state[this.scenarioIndex].featureDescription = existingFeatureDescription;
            this.state[this.scenarioIndex].tagsToExclude = this.tagsToExclude;
        }

        // Process the new line
        this.state[this.scenarioIndex] = this.state[this.scenarioIndex].process(line);
    }

    run(featureComplete: Function) {
        var completedScenarios = 0;
        var scenarioComplete = () => {
            completedScenarios++;
            if (completedScenarios === this.state.length) {
                featureComplete();
            }
        };

        // Each Scenario
        for (var scenarioIndex = 0; scenarioIndex < this.state.length; scenarioIndex++) {
            var scenario = this.state[scenarioIndex];

            if (typeof scenario.scenarioTitle === 'undefined') {
                this.testReporter.information(scenario.featureTitle + ' has an ignored scenario, or a scenario missing a title.');
                scenarioComplete();
                continue;
            }

            this.runScenario(scenario, scenarioComplete);
        }
    }

    private runScenario(scenario: StateBase, scenarioComplete: Function) {
        var tableRowCount = (scenario.tableRows.length > 0) ? scenario.tableRows.length : 1;

        var completedExamples = 0;
        var examplesComplete = () => {
            completedExamples++;
            if (completedExamples === tableRowCount) {
                scenarioComplete();
            }
        };

        // Each Example Row
        for (var exampleIndex = 0; exampleIndex < tableRowCount; exampleIndex++) {
            try {
                var passed = true;

                var i: number;
                var context: any = {};

                this.testReporter.information('--------------------------------------');
                this.testReporter.information(Keyword.Feature);
                this.testReporter.information(scenario.featureTitle);
                this.testReporter.information('\t' + scenario.featureDescription.join('\r\n\t') + '\r\n\r\n');

                // Process the scenario steps
                var conditions = scenario.getAllConditions();
                this.runNextCondition(conditions, 0, context, scenario, exampleIndex, true, examplesComplete);

            } catch (ex) {
                passed = false;
                this.testReporter.error(scenario.featureTitle, this.currentCondition, ex);
            }
        }
    }

    private runNextCondition(conditions: { condition: string; type: StepType; }[], conditionIndex: number, context: any, scenario: StateBase, exampleIndex: number, passing: boolean, examplesComplete: Function) {
        try {
            var next = conditions[conditionIndex];
            var i = conditionIndex + 1;

            this.currentCondition = next.condition;

            context.done = () => {
                if (this.asyncTimer) {
                    clearTimeout(this.asyncTimer);
                }
                if (i < conditions.length) {
                    this.runNextCondition(conditions, i, context, scenario, exampleIndex, passing, examplesComplete);
                } else {
                    this.testReporter.summary(scenario.featureTitle, scenario.scenarioTitle, passing);
                    examplesComplete();
                }
            }

            var condition = scenario.prepareCondition(next.condition, exampleIndex);
            this.testReporter.information('\t' + condition);
            var stepExecution = this.steps.find(condition, next.type);
            var isAsync = stepExecution.isAsync;

            if (stepExecution === null) {
                var stepMethodBuilder = new StepMethodBuilder(condition);
                throw new Error('No step definition defined.\n\n' + stepMethodBuilder.getSuggestedStepMethod());
            }

            if (stepExecution.parameters) {
                // Add the context container as the first argument
                stepExecution.parameters.unshift(context);
                // Call the step method
                stepExecution.method.apply(null, stepExecution.parameters);
            } else {
                // Call the step method
                stepExecution.method.call(null, context);
            }

            if (isAsync) {
                this.asyncTimer = setTimeout(() => {
                    this.testReporter.error('Async Exception', condition, new Error('Async step timed out'));
                    this.runNextCondition(conditions, i, context, scenario, exampleIndex, false, examplesComplete);
                }, this.asyncTimeout);
            } else {
                context.done();
            }
        } catch (ex) {
            passing = false;
            this.testReporter.error(scenario.featureTitle, this.currentCondition, ex);
            this.testReporter.summary(scenario.featureTitle, scenario.scenarioTitle, passing);
            examplesComplete();
        }
    }
}

class StepMethodBuilder {
    constructor(private originalCondition: string) { }

    getSuggestedStepMethod() {
        var argumentParser = new ArgumentParser(this.originalCondition);

        /* Template for step method */
        var params = argumentParser.getParameters();
        var comma = (params.length > 0) ? ', ' : '';
        var suggestion = '    runner.addStep(/' + argumentParser.getCondition() + '/i,\n' +
            '        (context: any' + comma + params + ') => {\n' +
            '            throw new Error(\'Not implemented.\');\n' +
            '        });';

        return suggestion;
    }
}

class ArgumentParser {
    private arguments: string[] = [];
    private condition: string;

    constructor(private originalCondition: string) {
        this.condition = originalCondition;
        this.parseArguments();
    }

    getCondition() {
        return this.condition;
    }

    getParameters() {
        return this.arguments.join(', ');
    }

    private parseArguments() {
        var foundArguments = this.originalCondition.match(ExpressionLibrary.quotedArgumentsRegExp);

        if (foundArguments && foundArguments.length > 0) {
            for (var i = 0; i < foundArguments.length; i++) {
                var foundArgument = foundArguments[i];
                this.processFoundArgument(foundArgument, i);
            }
        }
    }

    private processFoundArgument(quotedArgument: string, position: number) {
        var trimmedArgument = quotedArgument.replace(/"/g, '');
        var argumentExpression: string = null;

        if (trimmedArgument.toLowerCase() === 'true' || trimmedArgument.toLowerCase() === 'false') {
            // Argument is boolean
            this.arguments.push('p' + position + ': boolean');
            argumentExpression = ExpressionLibrary.trueFalseString;
        } else if (parseFloat(trimmedArgument).toString() === trimmedArgument) {
            // Argument is number
            this.arguments.push('p' + position + ': number');
            argumentExpression = ExpressionLibrary.numberString;
        } else {
            // Argument is string
            this.arguments.push('p' + position + ': string');
            argumentExpression = ExpressionLibrary.defaultString;
        }

        this.condition = this.condition.replace(quotedArgument, argumentExpression);
    }
}