import {Keyword} from './Keyword';
import {StepDefinition, StepDefinitions} from './Steps';

// Need to find/load specs
export class ScenarioState {
    constructor(private steps: StepDefinitions) { }

    public tags: string[] = [];
    public featureTitle: string;
    public featureDescription: string[] = [];
    public scenarioTitle: string

    public givens: string[] = [];
    public whens: string[] = [];
    public thens: string[] = [];

    public isFeatureSection = false;
    public isScenarioSection = false;
    public isOutlineSection = false;
    public isExampleSection = false;

    public isGivenSection = false;
    public isWhenSection = false;
    public isThenSection = false;

    public hasFeatureSection = false;
    public hasScenarioSection = false;
    public hasOutlineSection = false;
    public hasExampleSection = false;

    public hasGivenSection = false;
    public hasWhenSection = false;
    public hasThenSection = false;

    private reset() {
        // TODO: replace this class with proper state pattern
        this.isFeatureSection = false;
        this.isScenarioSection = false;
        this.isOutlineSection = false;
        this.isExampleSection = false;

        this.isGivenSection = false;
        this.isWhenSection = false;
        this.isThenSection = false;
    }

    private trimLine(text: string, keyword: string) {
        return text.substring(keyword.length).trim()
    }

    public startFeature(line: string) {
        this.reset();
        this.featureTitle = this.trimLine(line, Keyword.Feature);
        this.isFeatureSection = true;
        this.hasFeatureSection = true;
    }

    public startScenario(line: string) {
        this.reset();
        this.scenarioTitle = this.trimLine(line, Keyword.Scenario);
        this.isScenarioSection = true;
        this.hasScenarioSection = true;
    }

    public startOutline(line: string) {
        this.reset();
        this.scenarioTitle = this.trimLine(line, Keyword.Outline);
        this.isOutlineSection = true;
        this.hasOutlineSection = true;
    }

    public startExamples() {
        this.reset();
        this.isExampleSection = true;
        this.hasExampleSection = true;
    }

    public startGiven(line: string) {
        this.reset();
        this.isGivenSection = true;
        this.hasGivenSection = true;
        this.givens.push(this.trimLine(line, Keyword.Given));
    }

    public startWhen(line: string) {
        this.reset();
        this.isWhenSection = true;
        this.hasWhenSection = true;
        this.whens.push(this.trimLine(line, Keyword.When));
    }

    public startThen(line: string) {
        this.reset();
        this.isThenSection = true;
        this.hasThenSection = true;
        this.thens.push(this.trimLine(line, Keyword.Then));
    }

    public and(line: string) {
        if (this.isGivenSection) {
            this.givens.push(this.trimLine(line, Keyword.And));
            return;
        }

        if (this.isWhenSection) {
            this.whens.push(this.trimLine(line, Keyword.And));
            return;
        }

        if (this.isThenSection) {
            this.thens.push(this.trimLine(line, Keyword.And));
            return;
        }

        throw new Error('"' + Keyword.And + '" detected with no ' + Keyword.Given + ', ' + Keyword.When + ', or ' + Keyword.Then + '.');
    }

    private runCondition(condition: string) {
        var stepExecution = this.steps.find(condition);
        if (stepExecution === null) {
            throw new Error('No step definition defined.');
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