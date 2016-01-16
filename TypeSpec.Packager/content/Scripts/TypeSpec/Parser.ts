import {Keyword, ITestReporter} from './Keyword';
import {ExpressionLibrary} from './RegEx';
import {StepCollection, StepType} from './Steps';
import {StateBase, InitializedState, FeatureState} from './State';

export class FeatureParser {
    public tags: string[] = [];
    public state: StateBase[] = [];
    public scenarioIndex = 0;

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

    run() {
        for (var scenarioIndex = 0; scenarioIndex < this.state.length; scenarioIndex++) {
            var scenario = this.state[scenarioIndex];

            if (typeof scenario.scenarioTitle === 'undefined') {
                this.testReporter.information(scenario.featureTitle + ' has an ignored scenario, or a scenario missing a title.');
                continue;
            }

            this.runScenario(scenario);
        }
    }

    private runScenario(scenario: StateBase) {
        var tableRowCount = (scenario.tableRows.length > 0) ? scenario.tableRows.length : 1;

        for (var exampleIndex = 0; exampleIndex < tableRowCount; exampleIndex++) {
            try {
                var passed = true;

                var i: number;
                var dynamicStateContainer: any = {};

                this.testReporter.information('--------------------------------------');
                this.testReporter.information(Keyword.Feature);
                this.testReporter.information(scenario.featureTitle);
                for (i = 0; i < scenario.featureDescription.length; i++) {
                    this.testReporter.information('\t' + scenario.featureDescription[i]);
                }

                // Process the scenario steps
                var conditions = scenario.getAllConditions();

                for (var conditionIndex = 0; conditionIndex < conditions.length; conditionIndex++) {
                    var next = conditions[conditionIndex];
                    try {
                        dynamicStateContainer.done = () => {
                            this.testReporter.error(scenario.featureTitle, next.condition, new Error('done() called in non-async context.'));
                        };

                        this.runCondition(dynamicStateContainer, scenario, exampleIndex, next.condition, next.type);
                    } catch (ex) {
                        this.testReporter.error(scenario.featureTitle, next.condition, ex);
                        passed = false;
                    }
                }
                //

            } catch (ex) {
                passed = false;
            } finally {
                this.testReporter.summary(scenario.featureTitle, scenario.scenarioTitle, passed);
            }
        }
    }

    private runCondition(dynamicStateContainer: any, scenario: StateBase, exampleIndex: number, condition: string, type: StepType) {

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
        } else {
            // Call the step method
            stepExecution.method.call(null, dynamicStateContainer);
        }
    }
}

class StepMethodBuilder {
    constructor(private originalCondition: string) { }

    getSuggestedStepMethod() {
        var argumentParser = new ArgumentParser(this.originalCondition);

        /* Template for step method */
        var suggestion = '    runner.addStep(/' + argumentParser.getCondition() + '/i,\n' +
            '        (context: any, ' + argumentParser.getParameters() + ') => {\n' +
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