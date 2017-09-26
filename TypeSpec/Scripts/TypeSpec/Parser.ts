import { ITestReporter, ITestHooks } from './Hooks';
import { ExpressionLibrary } from './RegEx';
import { StepCollection, StepType } from './Steps';
import { Scenario, InitializedState, FeatureState } from './State';

export class FeatureParser {
    public scenarios: Scenario[] = [];
    private scenarioIndex = 0;
    private featureRunner: FeatureRunner;
    private hasParsed = false;

    constructor(private testReporter: ITestReporter, testHooks: ITestHooks, steps: StepCollection, private tagsToExclude: string[]) {
        this.scenarios[this.scenarioIndex] = new InitializedState(this.tagsToExclude);
        this.featureRunner = new FeatureRunner(steps, testReporter, testHooks);
    }

    run(spec: string, afterFeatureHandler: Function) {
        this.parseSpecification(spec);
        this.runFeature(afterFeatureHandler);
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

    private runFeature(afterFeatureHandler: Function) {
        if (this.hasParsed) {
            this.featureRunner.run(this.scenarios, afterFeatureHandler);
        } else {
            afterFeatureHandler();
        }
    }
}

class FeatureRunner {
    private scenarios: Scenario[] = [];
    private currentCondition = '';
    private asyncTimeout = 1000; // TODO: Make user configurable

    constructor(private steps: StepCollection, private testReporter: ITestReporter, private testHooks: ITestHooks) {

    }

    // HOOK BEFORE / AFTER FEATURE
    run(scenarios: Scenario[], afterFeatureHandler: Function) {
        this.testHooks.beforeFeature();

        this.scenarios = scenarios;

        let completedScenarios = 0;
        const afterScenarioHandler = () => {
            this.testHooks.afterScenario();
            completedScenarios++;
            if (completedScenarios === this.scenarios.length) {
                afterFeatureHandler();
            }
        };

        // Each Scenario
        for (const scenario of this.scenarios) {

            this.testHooks.beforeScenario();

            if (!scenario.scenarioTitle) {
                this.testReporter.summary(scenario.featureTitle, 'Ignored', true);
                afterScenarioHandler();
                continue;
            }

            this.runScenario(scenario, afterScenarioHandler);
        }
    }

    // HOOK BEFORE / AFTER SCENARIO
    private runScenario(scenario: Scenario, scenarioCompleteHandler: Function) {
        const tableRowCount = (scenario.tableRows.length > 0) ? scenario.tableRows.length : 1;

        let completedExamples = 0;

        const examplesCompleteHandler = () => {
            completedExamples++;
            if (completedExamples === tableRowCount) {
                scenarioCompleteHandler();
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
                this.runNextCondition(conditions, 0, context, scenario, exampleIndex, true, examplesCompleteHandler);

            } catch (ex) {
                this.testReporter.error(scenario.featureTitle, this.currentCondition, ex);
            }
        }
    }

    // HOOK BEFORE / AFTER CONDITION
    private runNextCondition(conditions: { condition: string; type: StepType; }[], conditionIndex: number, context: any, scenario: Scenario, exampleIndex: number, passing: boolean, examplesCompleteHandler: Function) {
        try {
            const next = conditions[conditionIndex];
            const nextConditionIndex = conditionIndex + 1;
            let completionHandled = false;
            let timer: any = null;

            this.testHooks.beforeCondition();

            this.currentCondition = next.condition;

            /* Handler to run after the condition completes... */
            context.done = () => {
                if (completionHandled) {
                    return;
                }

                completionHandled = true;

                if (timer) {
                    clearTimeout(timer);
                }

                this.testHooks.afterCondition();

                if (nextConditionIndex < conditions.length) {
                    this.runNextCondition(conditions, nextConditionIndex, context, scenario, exampleIndex, passing, examplesCompleteHandler);
                } else {
                    this.testReporter.summary(scenario.featureTitle, scenario.scenarioTitle, passing);
                    examplesCompleteHandler();
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
                    if (completionHandled) {
                        return;
                    }

                    completionHandled = true;

                    passing = false;
                    this.testReporter.error('Async Exception', condition, new Error('Async step timed out'));
                    this.testReporter.summary(scenario.featureTitle, scenario.scenarioTitle, passing);
                    examplesCompleteHandler();
                }, this.asyncTimeout);
            } else {
                context.done();
            }
        } catch (ex) {
            passing = false;
            this.testReporter.error(scenario.featureTitle, this.currentCondition, ex);
            this.testReporter.summary(scenario.featureTitle, scenario.scenarioTitle, passing);
            examplesCompleteHandler();
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
        const suggestion = '    @step(/^' + argumentParser.getCondition() + '$/i)\n' +
            '    stepName(context: any' + comma + params + ') {\n' +
            '        throw new Error(\'Not implemented.\');\n' +
            '    }';

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
        let argumentExpression: string = '';

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