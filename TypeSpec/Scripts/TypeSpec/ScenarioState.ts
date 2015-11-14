import {Keyword} from './Keyword';
import {StepDefinition, StepDefinitions} from './Steps';

abstract class ScenarioStateBase {
    public givens: string[] = [];
    public whens: string[] = [];
    public thens: string[] = [];

    public featureTitle: string;
    public featureDescription: string[] = [];
    public tags: string[] = [];
    public scenarioTitle: string

    public isGivenSection = false;
    public isWhenSection = false;
    public isThenSection = false;

    constructor(priorState: ScenarioStateBase) {
        if (priorState !== null) {
            this.featureTitle = priorState.featureTitle;
            this.featureDescription = priorState.featureDescription;
            this.scenarioTitle = priorState.scenarioTitle;
            this.givens = priorState.givens;
            this.whens = priorState.whens;
            this.thens = priorState.thens;
        }
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

        if (Keyword.isScenarioDeclaration(line)) {
            return this.scenario(line);
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

        if (Keyword.isTagDeclaration(line)) {
            return this.tag(line);
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

    protected trimLine(text: string, keyword: string) {
        return text.substring(keyword.length).trim()
    }
}

class InitializedState extends ScenarioStateBase {
    feature(line: string): ScenarioStateBase {
        this.featureTitle = this.trimLine(line, Keyword.Feature);
        return new FeatureState(this);
    }
}

class FeatureState extends ScenarioStateBase {
    unknown(line: string) {
        this.featureDescription.push(line);
        return this;
    }

    tag(line: string): ScenarioStateBase {
        var rawTags = line.split('@');
        for (var tagIndex = 0; tagIndex < rawTags.length; tagIndex++) {
            var trimmedTag = rawTags[tagIndex].trim().toLowerCase();
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
}

class ScenarioState extends ScenarioStateBase {

    constructor(priorState: ScenarioState) {
        super(priorState);
    }

    given(line: string): ScenarioStateBase {
        this.givens.push(this.trimLine(line, Keyword.Given));
        return new GivenState(this);
    }
}

class GivenState extends ScenarioStateBase {
    public isGivenSection = true;

    constructor(priorState: ScenarioState) {
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
    public isWhenSection = true;

    constructor(priorState: ScenarioState) {
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
    public isThenSection = true;

    constructor(priorState: ScenarioState) {
        super(priorState);
    }

    isNewScenario(line: string) {
        return (Keyword.isScenarioDeclaration(line) || Keyword.isTagDeclaration(line));
    }

    and(line: string) {
        this.thens.push(this.trimLine(line, Keyword.And));
        return this;
    }
}

export class ScenarioComposer {
    public tags: string[] = [];
    public state: ScenarioStateBase[] = [];
    public scenarioIndex = 0;

    constructor(private steps: StepDefinitions, private raiseError: (featureTitle: string, condition: string, error: Error) => any) {
        this.state[this.scenarioIndex] = new InitializedState(null);
    }

    process(line: string) {
        if (this.state[this.scenarioIndex].isNewScenario(line)) {
            // Detects another scenario in the same feature file
            console.log('DETECTED ANOTHER SCENARIO... YAY');
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
        for (var idx = 0; idx < this.state.length; idx++) {
            var scenario = this.state[idx];
            var featureTitle = scenario.featureTitle;

            var i: number;
            var dynamicStateContainer: any = {};
            var stepDefinition: StepDefinition;

            console.log('--------------------------------------');
            console.log(Keyword.Feature);
            console.log(scenario.featureTitle);
            for (i = 0; i < scenario.featureDescription.length; i++) {
                console.log('\t' + scenario.featureDescription[i]);
            }

            console.log(Keyword.Given);
            for (i = 0; i < scenario.givens.length; i++) {
                console.log('\t' + scenario.givens[i]);
                this.executeWithErrorHandling(dynamicStateContainer, scenario.givens[i], featureTitle);
            }

            console.log(Keyword.When);
            for (i = 0; i < scenario.whens.length; i++) {
                console.log('\t' + scenario.whens[i]);
                this.executeWithErrorHandling(dynamicStateContainer, scenario.whens[i], featureTitle);
            }

            console.log(Keyword.Then);
            for (i = 0; i < scenario.thens.length; i++) {
                console.log('\t' + scenario.thens[i]);
                this.executeWithErrorHandling(dynamicStateContainer, scenario.thens[i], featureTitle);
            }
        }
    }

    private executeWithErrorHandling(dynamicStateContainer: any, condition: string, featureTitle: string) {
        try {
            this.runCondition(dynamicStateContainer, condition);
        } catch (ex) {
            this.raiseError(featureTitle, condition, ex);
            console.error('\t ERROR: "' + featureTitle + '". ' + condition + ' - ' + ex);
        }
    }

    private runCondition(dynamicStateContainer: any, condition: string) {
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