import {Keyword} from './Keyword';
import {StepDefinition, StepCollection} from './Steps';

abstract class ScenarioStateBase {
    public givens: string[] = [];
    public whens: string[] = [];
    public thens: string[] = [];

    public featureTitle: string;
    public featureDescription: string[] = [];
    public scenarioTitle: string;

    public tags: string[] = [];

    public tableHeaders: string[] = [];
    public tableRows: {}[] = [];

    constructor(priorState: ScenarioStateBase) {
        if (priorState !== null) {
            this.featureTitle = priorState.featureTitle;
            this.featureDescription = priorState.featureDescription;
            this.scenarioTitle = priorState.scenarioTitle;

            this.tableHeaders = priorState.tableHeaders;
            this.tableRows = priorState.tableRows;

            this.givens = priorState.givens;
            this.whens = priorState.whens;
            this.thens = priorState.thens;
        }
    }

    prepareCondition(condition: string, index: number) {
        if (this.tableRows.length > index) {
            var data: any = this.tableRows[index];
            for (var prop in data) {
                var token = Keyword.TokenStart + prop + Keyword.TokenEnd;
                condition = condition.replace(token, data[prop]);
            }
        }
        return condition;
    }

    process(line: string) {
        line = line.trim();

        if (!line) {
            // Skip empty lines
            return this;
        }

        if (Keyword.isFeatureDeclaration(line)) {
            return this.feature(line);
        }

        if (Keyword.isTagDeclaration(line)) {
            return this.tag(line);
        }

        if (Keyword.isScenarioDeclaration(line)) {
            return this.scenario(line);
        }

        if (Keyword.isOutlineDeclaration(line)) {
            return this.outline(line);
        }

        if (Keyword.isGivenDeclaration(line)) {
            return this.given(line);
        }

        if (Keyword.isWhenDeclaration(line)) {
            return this.when(line);
        }

        if (Keyword.isThenDeclaration(line)) {
            return this.then(line);
        }

        if (Keyword.isAndDeclaration(line)) {
            return this.and(line);
        }

        if (Keyword.isExamplesDeclaration(line)) {
            return this.examples(line);
        }

        if (Keyword.isTableDeclaration(line)) {
            return this.table(line);
        }

        return this.unknown(line);
    }

    isNewScenario(line: string) {
        return false;
    }

    unknown(line: string): ScenarioStateBase {
        throw new Error('Unknown line ' + line);
    }

    feature(line: string): ScenarioStateBase {
        throw new Error('Did not expect line: ' + line);
    }

    tag(line: string): ScenarioStateBase {
        throw new Error('Did not expect line: ' + line);
    }

    scenario(line: string): ScenarioStateBase {
        throw new Error('Did not expect line: ' + line);
    }

    outline(line: string): ScenarioStateBase {
        throw new Error('Did not expect line: ' + line);
    }

    given(line: string): ScenarioStateBase {
        throw new Error('Did not expect line: ' + line);
    }

    when(line: string): ScenarioStateBase {
        throw new Error('Did not expect line: ' + line);
    }

    then(line: string): ScenarioStateBase {
        throw new Error('Did not expect line: ' + line);
    }

    and(line: string): ScenarioStateBase {
        throw new Error('Did not expect line: ' + line);
    }

    examples(line: string): ScenarioStateBase {
        throw new Error('Did not expect line: ' + line);
    }

    table(line: string): ScenarioStateBase {
        throw new Error('Did not expect line: ' + line);
    }

    protected trimLine(text: string, keyword: string) {
        return text.substring(keyword.length).trim()
    }
}

class InitializedState extends ScenarioStateBase {

    constructor(priorState: ScenarioStateBase) {
        super(priorState);
    }

    feature(line: string): ScenarioStateBase {
        this.featureTitle = this.trimLine(line, Keyword.Feature);
        return new FeatureState(this);
    }
}

class FeatureState extends ScenarioStateBase {

    constructor(priorState: ScenarioStateBase) {
        super(priorState);
    }

    unknown(line: string) {
        this.featureDescription.push(line);
        return this;
    }

    tag(line: string): ScenarioStateBase {
        var tags = line.split(Keyword.Tag);
        for (var i = 0; i < tags.length; i++) {
            var trimmedTag = tags[i].trim().toLowerCase();
            if (trimmedTag) {
                this.tags.push(trimmedTag);
            }
        }
        return this;
    }

    scenario(line: string): ScenarioStateBase {
        this.scenarioTitle = this.trimLine(line, Keyword.Scenario);
        return new ScenarioState(this);
    }

    outline(line: string): ScenarioStateBase {
        this.scenarioTitle = this.trimLine(line, Keyword.Scenario);
        return new ScenarioState(this);
    }
}

class ScenarioState extends ScenarioStateBase {

    constructor(priorState: ScenarioStateBase) {
        super(priorState);
    }

    given(line: string): ScenarioStateBase {
        this.givens.push(this.trimLine(line, Keyword.Given));
        return new GivenState(this);
    }
}

class GivenState extends ScenarioStateBase {

    constructor(priorState: ScenarioStateBase) {
        super(priorState);
    }

    when(line: string): ScenarioStateBase {
        this.whens.push(this.trimLine(line, Keyword.When));
        return new WhenState(this);
    }

    then(line: string): ScenarioStateBase {
        this.thens.push(this.trimLine(line, Keyword.Then));
        return new ThenState(this);
    }

    and(line: string) {
        this.givens.push(this.trimLine(line, Keyword.And));
        return this;
    }
}

class WhenState extends ScenarioStateBase {

    constructor(priorState: ScenarioStateBase) {
        super(priorState);
    }

    then(line: string): ScenarioStateBase {
        this.thens.push(this.trimLine(line, Keyword.Then));
        return new ThenState(this);
    }

    and(line: string) {
        this.whens.push(this.trimLine(line, Keyword.And));
        return this;
    }
}

class ThenState extends ScenarioStateBase {

    constructor(priorState: ScenarioStateBase) {
        super(priorState);
    }

    isNewScenario(line: string) {
        return (Keyword.isScenarioDeclaration(line) || Keyword.isTagDeclaration(line));
    }

    and(line: string) {
        this.thens.push(this.trimLine(line, Keyword.And));
        return this;
    }

    examples(line: string): ScenarioStateBase {
        return new ExampleState(this);
    }
}

class ExampleState extends ScenarioStateBase {
    constructor(priorState: ScenarioStateBase) {
        super(priorState);
    }

    table(line: string): ScenarioStateBase {
        var headings = line.split(Keyword.Table);
        for (var i = 0; i < headings.length; i++) {
            var trimmedHeading = headings[i].trim();
            this.tableHeaders.push(trimmedHeading);
        }
        return new TableState(this);
    }
}

class TableState extends ScenarioStateBase {
    constructor(priorState: ScenarioStateBase) {
        super(priorState);
    }

    table(line: string): ScenarioStateBase {
        var data = line.split(Keyword.Table);
        var row: any = {};
        for (var i = 0; i < data.length; i++) {
            var trimmedData = data[i].trim();
            if (this.tableHeaders[i]) {
                row[this.tableHeaders[i]] = trimmedData;
            }
        }
        this.tableRows.push(row);
        return this;
    }
}

export interface ITestReporter {
    summary(featureTitle: string, scenarioTitle: string, isSuccess: boolean): void;
    error(featureTitle: string, condition: string, error: Error): void;
    information(message: string): void;
}

export class ScenarioComposer {
    public tags: string[] = [];
    public state: ScenarioStateBase[] = [];
    public scenarioIndex = 0;

    constructor(private steps: StepCollection, private testReporter: ITestReporter) {
        this.state[this.scenarioIndex] = new InitializedState(null);
    }

    process(line: string) {
        if (this.state[this.scenarioIndex].isNewScenario(line)) {
            // Detects another scenario in the same feature file
            var ft = this.state[this.scenarioIndex].featureTitle;
            var fd = this.state[this.scenarioIndex].featureDescription;

            this.scenarioIndex++;
            this.state[this.scenarioIndex] = new FeatureState(null);
            this.state[this.scenarioIndex].featureTitle = ft;
            this.state[this.scenarioIndex].featureDescription = fd;
        }

        this.state[this.scenarioIndex] = this.state[this.scenarioIndex].process(line);
    }

    run() {
        for (var scenarioIndex = 0; scenarioIndex < this.state.length; scenarioIndex++) {

            var scenario = this.state[scenarioIndex];

            var tableRowCount = (scenario.tableRows.length > 0) ? scenario.tableRows.length : 1;

            for (var dataIndex = 0; dataIndex < tableRowCount; dataIndex++) {
                try {
                    var featureTitle = scenario.featureTitle;
                    var scenarioTitle = scenario.scenarioTitle;
                    var passed = true;

                    var i: number;
                    var dynamicStateContainer: any = {};
                    var stepDefinition: StepDefinition;

                    this.testReporter.information('--------------------------------------');
                    this.testReporter.information(Keyword.Feature);
                    this.testReporter.information(scenario.featureTitle);
                    for (i = 0; i < scenario.featureDescription.length; i++) {
                        this.testReporter.information('\t' + scenario.featureDescription[i]);
                    }

                    this.testReporter.information(Keyword.Given);
                    for (i = 0; i < scenario.givens.length; i++) {
                        passed = passed && this.executeWithErrorHandling(dynamicStateContainer, scenario, dataIndex, scenario.givens[i], featureTitle, scenarioTitle);
                    }

                    this.testReporter.information(Keyword.When);
                    for (i = 0; i < scenario.whens.length; i++) {
                        passed = passed && this.executeWithErrorHandling(dynamicStateContainer, scenario, dataIndex, scenario.whens[i], featureTitle, scenarioTitle);
                    }

                    this.testReporter.information(Keyword.Then);
                    for (i = 0; i < scenario.thens.length; i++) {
                        passed = passed && this.executeWithErrorHandling(dynamicStateContainer, scenario, dataIndex, scenario.thens[i], featureTitle, scenarioTitle);
                    }

                    this.testReporter.summary(scenario.featureTitle, scenario.scenarioTitle, passed);
                } catch (ex) {
                    this.testReporter.summary(scenario.featureTitle, scenario.scenarioTitle, false);
                }
            }
        }
    }

    private executeWithErrorHandling(dynamicStateContainer: any, scenario: ScenarioStateBase, dataIndex: number, condition: string, featureTitle: string, scenarioTitle: string) {
        try {
            this.runCondition(dynamicStateContainer, scenario, dataIndex, condition);
            return true;
        } catch (ex) {
            this.testReporter.error(featureTitle, condition, ex);
            return false;
        }
    }

    private runCondition(dynamicStateContainer: any, scenario: ScenarioStateBase, dataIndex: number, condition: string) {

        condition = scenario.prepareCondition(condition, dataIndex);

        this.testReporter.information('\t' + condition);

        var stepExecution = this.steps.find(condition);
        if (stepExecution === null) {

            var suggestion = '\trunner.addStep(/' + condition + '/i, () => { \n' +
                '\t\tthrow new Error(\'Not implemented.\');\n' +
                '\t});';

            throw new Error('No step definition defined.\n\n' + suggestion);
        }

        if (stepExecution.parameters) {
            stepExecution.parameters.unshift(dynamicStateContainer);
            stepExecution.method.apply(null, stepExecution.parameters);
        } else {
            stepExecution.method(dynamicStateContainer);
        }
    }
}