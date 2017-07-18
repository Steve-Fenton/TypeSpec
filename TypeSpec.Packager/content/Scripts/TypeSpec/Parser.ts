import {ITestReporter} from './Keyword';
import {ExpressionLibrary} from './RegEx';
import {StepCollection, StepType} from './Steps';
import {Scenario, InitializedState, FeatureState} from './State';

export class FeatureParser {
    public scenarios: Scenario[] = [];
    private scenarioIndex = 0;
    private featureRunner: FeatureRunner;

    constructor(private steps: StepCollection, private testReporter: ITestReporter, private tagsToExclude: string[]) {
        this.scenarios[this.scenarioIndex] = new InitializedState(this.tagsToExclude);
        this.featureRunner = new FeatureRunner(steps, testReporter);
    }

    process(line: string) {
        if (this.scenarios[this.scenarioIndex].isNewScenario(line)) {
            // This is an additional scenario within the same feature file.
            const existingFeatureTitle = this.scenarios[this.scenarioIndex].featureTitle;
            const existingFeatureDescription = this.scenarios[this.scenarioIndex].featureDescription;

            this.scenarioIndex++;

            this.scenarios[this.scenarioIndex] = new FeatureState(null);
            this.scenarios[this.scenarioIndex].featureTitle = existingFeatureTitle;
            this.scenarios[this.scenarioIndex].featureDescription = existingFeatureDescription;
            this.scenarios[this.scenarioIndex].tagsToExclude = this.tagsToExclude;
        }

        // Process the new line
        this.scenarios[this.scenarioIndex] = this.scenarios[this.scenarioIndex].process(line);
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

        let completedScenarios = 0;
        const scenarioComplete = () => {
            completedScenarios++;
            if (completedScenarios === this.scenarios.length) {
                featureComplete();
            }
        };

        // Each Scenario
        for (const scenario of this.scenarios) {
            if (typeof scenario.scenarioTitle === 'undefined') {
                this.testReporter.information(scenario.featureTitle + ' has an ignored scenario, or a scenario missing a title.');
                scenarioComplete();
                continue;
            }

            this.runScenario(scenario, scenarioComplete);
        }
    }

    private runScenario(scenario: Scenario, scenarioComplete: Function) {
        const tableRowCount = (scenario.tableRows.length > 0) ? scenario.tableRows.length : 1;

        let completedExamples = 0;
        const examplesComplete = () => {
            completedExamples++;
            if (completedExamples === tableRowCount) {
                scenarioComplete();
            }
        };

        // Each Example Row
        for (let exampleIndex = 0; exampleIndex < tableRowCount; exampleIndex++) {
            try {
                const context: any = {};

                this.testReporter.information('--------------------------------------');
                this.testReporter.information(scenario.featureTitle);
                this.testReporter.information('\t' + scenario.featureDescription.join('\r\n\t') + '\r\n\r\n');

                // Process the scenario steps
                const conditions = scenario.getAllConditions();
                this.runNextCondition(conditions, 0, context, scenario, exampleIndex, true, examplesComplete);

            } catch (ex) {
                this.testReporter.error(scenario.featureTitle, this.currentCondition, ex);
            }
        }
    }

    private runNextCondition(conditions: { condition: string; type: StepType; }[], conditionIndex: number, context: any, scenario: Scenario, exampleIndex: number, passing: boolean, examplesComplete: Function) {
        try {
            const next = conditions[conditionIndex];
            const nextConditionIndex = conditionIndex + 1;
            let timer: any = null;

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

            const condition = scenario.prepareCondition(next.condition, exampleIndex);
            this.testReporter.information('\t' + condition);
            const stepExecution = this.steps.find(condition, next.type);

            if (stepExecution === null) {
                const stepMethodBuilder = new StepMethodBuilder(condition);
                throw new Error('No step definition defined.\n\n' + stepMethodBuilder.getSuggestedStepMethod());
            }

            const isAsync = stepExecution.isAsync;

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
        const argumentParser = new ArgumentParser(this.originalCondition);

        /* Template for step method */
        const params = argumentParser.getParameters();
        const comma = (params.length > 0) ? ', ' : '';
        const suggestion = '    runner.addStep(/^' + argumentParser.getCondition() + '$/i,\n' +
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
        const foundArguments = this.originalCondition.match(ExpressionLibrary.quotedArgumentsRegExp);

        if (!foundArguments || foundArguments.length === 0) {
            return;
        }

        for (let i = 0; i < foundArguments.length; i++) {
            var foundArgument = foundArguments[i];
            this.replaceArgumentWithExpression(foundArgument, i);
        }
    }

    private replaceArgumentWithExpression(quotedArgument: string, position: number) {
        const trimmedArgument = quotedArgument.replace(/"/g, '');
        let argumentExpression: string = null;

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