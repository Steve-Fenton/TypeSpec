import {Keyword} from './Keyword';
import {StepDefinition, StepDefinitions} from './Steps';

abstract class ScenarioStateBase {
    constructor() { }

    abstract given(line: string): ScenarioStateBase;

    abstract when(line: string): ScenarioStateBase;

    abstract then(line: string): ScenarioStateBase;

    abstract and(line: string): ScenarioStateBase;
}

class ScenarioState extends ScenarioStateBase {
    public givens: string[] = [];
    public whens: string[] = [];
    public thens: string[] = [];

    public isGivenSection = false;
    public isWhenSection = false;
    public isThenSection = false;

    constructor(priorState: ScenarioState) {
        super();
        if (priorState !== null) {
            this.givens = priorState.givens;
            this.whens = priorState.whens;
            this.thens = priorState.thens;
        }
    }

    protected trimLine(text: string, keyword: string) {
        return text.substring(keyword.length).trim()
    }

    given(line: string) {
        this.givens.push(this.trimLine(line, Keyword.Given));
        return this;
    }

    when(line: string) {
        throw new Error('"When" is not valid in Scenario State.');
        return this;
    }

    then(line: string) {
        throw new Error('"Then" is not valid in Scenario State.');
        return this;
    }

    and(line: string) {
        throw new Error('"And" is not valid in Scenario State.');
        return this;
    }
}

class GivenState extends ScenarioState {
    public isGivenSection = true;

    constructor(priorState: ScenarioState) {
        super(priorState);
    }

    given() {
        throw new Error('"Given" is not valid in Given State.');
        return this;
    }

    when(line: string) {
        this.whens.push(this.trimLine(line, Keyword.When));
        return this;
    }

    then(line: string) {
        this.thens.push(this.trimLine(line, Keyword.Then));
        return this;
    }

    and(line: string) {
        this.givens.push(this.trimLine(line, Keyword.And));
        return this;
    }
}

class WhenState extends ScenarioState {
    public isWhenSection = true;

    constructor(priorState: ScenarioState) {
        super(priorState);
    }

    given() {
        throw new Error('"Given" is not valid in When State.');
        return this;
    }

    when() {
        throw new Error('"When" is not valid in When State.');
        return this;
    }

    then(line: string) {
        this.thens.push(this.trimLine(line, Keyword.Then));
        return this;
    }

    and(line: string) {
        this.whens.push(this.trimLine(line, Keyword.And));
        return this;
    }
}

class ThenState extends ScenarioState {
    public isThenSection = true;

    constructor(priorState: ScenarioState) {
        super(priorState);
    }

    given() {
        throw new Error('"Given" is not valid in Then State.');
        return this;
    }

    when() {
        throw new Error('"When" is not valid in Them State.');
        return this;
    }

    then() {
        throw new Error('"Then" is not valid in Then State.');
        return this;
    }

    and(line: string) {
        this.thens.push(this.trimLine(line, Keyword.And));
        return this;
    }
}

//TODO: break this up
export class ClassToBeStarved {
    constructor(private steps: StepDefinitions) { }

    public tags: string[] = [];
    public featureTitle: string;
    public featureDescription: string[] = [];
    public scenarioTitle: string

    public givens: string[] = [];
    public whens: string[] = [];
    public thens: string[] = [];

    public isFeatureSection = false;
    public isOutlineSection = false;
    public isExampleSection = false;

    public state = new ScenarioState(null);

    private reset() {
        // TODO: replace this class with proper state pattern
        this.isFeatureSection = false;
        this.isOutlineSection = false;
        this.isExampleSection = false;
    }

    private trimLine(text: string, keyword: string) {
        return text.substring(keyword.length).trim()
    }

    public startFeature(line: string) {
        this.reset();
        this.featureTitle = this.trimLine(line, Keyword.Feature);
        this.isFeatureSection = true;
    }

    public startScenario(line: string) {
        this.scenarioTitle = this.trimLine(line, Keyword.Scenario);
    }

    public startOutline(line: string) {
        this.reset();
        this.scenarioTitle = this.trimLine(line, Keyword.Outline);
        this.isOutlineSection = true;
    }

    public startExamples() {
        this.reset();
        this.isExampleSection = true;
    }

    public startGiven(line: string) {
        this.state = this.state.given(line);
    }

    public startWhen(line: string) {
        this.state = this.state.when(line);
    }

    public startThen(line: string) {
        this.state = this.state.then(line);
    }

    public and(line: string) {
        this.state = this.state.and(line);
    }

    private runCondition(condition: string) {
        var stepExecution = this.steps.find(condition);
        if (stepExecution === null) {

            var suggestion = '\trunner.addStep(/' + condition + '/i, () => { \n' +
                '\t\tthrow new Error(\'Not implemented.\');\n' +
            '\t});';

            throw new Error('No step definition defined.\n\n' + suggestion);
        }

        if (stepExecution.parameters) {
            stepExecution.method.apply(null, stepExecution.parameters);
        } else {
            stepExecution.method();
        }
    }

    run() {
        var i: number;
        var stepDefinition: StepDefinition;

        console.log('--------------------------------------');
        console.log(Keyword.Feature);
        console.log(this.featureTitle);
        for (i = 0; i < this.featureDescription.length; i++) {
            console.log('\t' + this.featureDescription[i]);
        }

        console.log(Keyword.Given);
        for (i = 0; i < this.givens.length; i++) {
            console.log('\t' + this.givens[i]);
            this.executeWithErrorHandling(this.givens[i]);
        }

        console.log(Keyword.When);
        for (i = 0; i < this.whens.length; i++) {
            console.log('\t' + this.whens[i]);
            this.executeWithErrorHandling(this.whens[i]);
        }

        console.log(Keyword.Then);
        for (i = 0; i < this.thens.length; i++) {
            console.log('\t' + this.thens[i]);
            this.executeWithErrorHandling(this.thens[i]);
        }
    }

    private executeWithErrorHandling(condition: string) {
        try {
            this.runCondition(condition);
        } catch (ex) {
            // TODO: collect errors for later display
            console.error('\t ERROR: "' + this.featureTitle + '". ' + condition + ' - ' + ex);
        }
    }
}