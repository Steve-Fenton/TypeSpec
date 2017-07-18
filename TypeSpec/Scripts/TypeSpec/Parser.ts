import {ITestReporter} from './Keyword';
import {ExpressionLibrary} from './RegEx';
import {StepCollection, StepType} from './Steps';
import {Scenario, InitializedState, FeatureState} from './State';

export class FeatureParser {
    public scenarios: Scenario[] = [];
    private i = 0;
    private featureRunner: FeatureRunner;

    constructor(private steps: StepCollection, private testReporter: ITestReporter, private tagsToExclude: string[]) {
        this.scenarios[this.i] = new InitializedState(this.tagsToExclude);
        this.featureRunner = new FeatureRunner(steps, testReporter);
    }

    process(line: string) {
        if (this.scenarios[this.i].isNewScenario(line)) {
            // This is an additional scenario within the same feature file.
            var existingFeatureTitle = this.scenarios[this.i].featureTitle;
            var existingFeatureDescription = this.scenarios[this.i].featureDescription;

            this.i++;

            this.scenarios[this.i] = new FeatureState(null);
            this.scenarios[this.i].featureTitle = existingFeatureTitle;
            this.scenarios[this.i].featureDescription = existingFeatureDescription;
            this.scenarios[this.i].tagsToExclude = this.tagsToExclude;
        }

        // Process the new line
        this.scenarios[this.i] = this.scenarios[this.i].process(line);
    }

    runFeature(featureComplete: Function) {
        this.featureRunner.run(this.scenarios, featureComplete);
    }
}

export class FeatureRunner {
    private scenarios: Scenario[] = [];
    private currentCondition = '';
    private asyncTimeout = 1000; // TODO: Make user configurable

    constructor(private steps: StepCollection, private testReporter: ITestReporter) {

    }

    run(scenarios: Scenario[], featureComplete: Function) {
        this.scenarios = scenarios;

        var completedScenarios = 0;
        var scenarioComplete = () => {
            completedScenarios++;
            if (completedScenarios === this.scenarios.length) {
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
    }

    private runScenario(scenario: Scenario, scenarioComplete: Function) {
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

    private runNextCondition(conditions: { condition: string; type: StepType; }[], conditionIndex: number, context: any, scenario: Scenario, exampleIndex: number, passing: boolean, examplesComplete: Function) {
        try {
            var next = conditions[conditionIndex];
            var nextConditionIndex = conditionIndex + 1;
            var timer: any = null;

            this.currentCondition = next.condition;

            context.done = () => {
                if (timer) {
                    clearTimeout(timer);
                }
                if (nextConditionIndex < conditions.length) {
                    this.runNextCondition(conditions, nextConditionIndex, context, scenario, exampleIndex, passing, examplesComplete);
                } else {
                    this.testReporter.summary(scenario.featureTitle, scenario.scenarioTitle, passing);
                    examplesComplete();
                }
            }

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
            } else {
                // Call the step method
                stepExecution.method.call(null, context);
            }

            if (isAsync) {
                timer = setTimeout(() => {
                    console.log('Timer Expired');
                    this.testReporter.error('Async Exception', condition, new Error('Async step timed out'));
                    this.testReporter.summary(scenario.featureTitle, scenario.scenarioTitle, false);
                    examplesComplete();
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
        var suggestion = '    runner.addStep(/^' + argumentParser.getCondition() + '$/i,\n' +
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

        if (!foundArguments || foundArguments.length === 0) {
            return;
        }

        for (var i = 0; i < foundArguments.length; i++) {
            var foundArgument = foundArguments[i];
            this.replaceArgumentWithExpression(foundArgument, i);
        }
    }

    private replaceArgumentWithExpression(quotedArgument: string, position: number) {
        var trimmedArgument = quotedArgument.replace(/"/g, '');
        var argumentExpression: string = null;

        if (this.isBooleanArgument(trimmedArgument)) {
            this.arguments.push('p' + position + ': boolean');
            argumentExpression = ExpressionLibrary.trueFalseString;
        } else if (this.isNumericArgument(trimmedArgument)) {
            this.arguments.push('p' + position + ': number');
            argumentExpression = ExpressionLibrary.numberString;
        } else {
            this.arguments.push('p' + position + ': string');
            argumentExpression = ExpressionLibrary.defaultString;
        }

        this.condition = this.condition.replace(quotedArgument, argumentExpression);
    }

    private isBooleanArgument(argument: string) {
        return (argument.toLowerCase() === 'true' || argument.toLowerCase() === 'false');
    }

    private isNumericArgument(argument: string) {
        return (parseFloat(argument).toString() === argument);
    }
}