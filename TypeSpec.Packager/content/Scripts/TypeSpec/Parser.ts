import { ITestReporter } from './Keyword';
import { ExpressionLibrary } from './RegEx';
import { StepCollection, StepType } from './Steps';
import { Scenario, InitializedState, FeatureState } from './State';

export class FeatureParser {
    public scenarios: Scenario[] = [];
    private scenarioIndex = 0;
    private featureRunner: FeatureRunner;
    private hasParsed = false;

    constructor(private steps: StepCollection, private testReporter: ITestReporter, private tagsToExclude: string[]) {
        this.scenarios[this.scenarioIndex] = new InitializedState(this.tagsToExclude);
        this.featureRunner = new FeatureRunner(steps, testReporter);
    }

    run(spec: string, featureCompleteHandler: Function) {
        this.parseSpecification(spec);
        this.runFeature(featureCompleteHandler);
    }

    private parseSpecification(spec: string): void {
        this.hasParsed = true;

        /* Normalise line endings before splitting */
        const lines = spec.replace('\r\n', '\n').split('\n');

        /* Parse the steps */
        for (const line of lines) {
            try {
                this.process(line);
            } catch (ex) {
                this.hasParsed = false;
                const state = this.scenarios[0] || { featureTitle: 'Unknown' };
                this.testReporter.error(state.featureTitle, line, ex);
            }
        }
    }

    private process(line: string) {
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

    private runFeature(featureComplete: Function) {
        if (this.hasParsed) {
            this.featureRunner.run(this.scenarios, featureComplete);
        } else {
            featureComplete();
        }
    }
}

class FeatureRunner {
    private scenarios: Scenario[] = [];
    private currentCondition = '';
    private asyncTimeout = 1000; // TODO: Make user configurable

    constructor(private steps: StepCollection, private testReporter: ITestReporter) {

    }

    // HOOK BEFORE / AFTER FEATURE
    run(scenarios: Scenario[], featureComplete: Function) {
        console.log('BEFORE FEATURE ' + scenarios[0].featureTitle);

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
            if (!scenario.scenarioTitle) {
                this.testReporter.information(scenario.featureTitle + ' has an ignored scenario, or a scenario missing a title.');
                scenarioComplete();
                continue;
            }

            this.runScenario(scenario, scenarioComplete);
        }

        console.log('AFTER FEATURE ' + scenarios[0].featureTitle);
    }

    // HOOK BEFORE / AFTER SCENARIO
    private runScenario(scenario: Scenario, scenarioComplete: Function) {
        console.log('BEFORE SCENARIO ' + scenario.featureTitle);

        const tableRowCount = (scenario.tableRows.length > 0) ? scenario.tableRows.length : 1;

        let completedExamples = 0;

        const examplesComplete = (fail: boolean = false) => {
            completedExamples++;
            if (completedExamples === tableRowCount || fail) {
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

        console.log('AFTER SCENARIO ' + scenario.featureTitle);
    }

    // HOOK BEFORE / AFTER CONDITION
    private runNextCondition(conditions: { condition: string; type: StepType; }[], conditionIndex: number, context: any, scenario: Scenario, exampleIndex: number, passing: boolean, examplesComplete: Function) {
        try {
            const next = conditions[conditionIndex];
            const nextConditionIndex = conditionIndex + 1;
            let timer: any = null;

            console.log('BEFORE CONDITION ' + next.condition);

            this.currentCondition = next.condition;

            context.done = () => {
                if (timer) {
                    clearTimeout(timer);
                }

                console.log('AFTER CONDITION ' + next.condition);

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
                    passing = false;
                    this.testReporter.error('Async Exception', condition, new Error('Async step timed out'));
                    examplesComplete(true);
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