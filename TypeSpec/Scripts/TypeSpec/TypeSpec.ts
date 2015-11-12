// Need to find/load specs
class ScenarioState {
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
        var stepDefinition = this.steps.find(condition);
        if (stepDefinition === null) {
            throw new Error('No step definition defined.');
        }
        stepDefinition.step();
    }

    run() {
        var i: number;
        var stepDefinition: StepDefinition;

        console.log('--------------------------------------');
        console.log(Keyword.Feature);
        for (i = 0; i < this.featureDescription.length; i++) {
            console.log('\t' + this.featureDescription[i]);
        }

        console.log(Keyword.Given);
        for (i = 0; i < this.givens.length; i++) {
            console.log('\t' + this.givens[i]);
            this.runCondition(this.givens[i]);
        }

        console.log(Keyword.When);
        for (i = 0; i < this.whens.length; i++) {
            console.log('\t' + this.whens[i]);
            this.runCondition(this.whens[i]);
        }

        console.log(Keyword.Then);
        for (i = 0; i < this.thens.length; i++) {
            console.log('\t' + this.thens[i]);
            this.runCondition(this.thens[i]);
        }
    }
}

class Keyword {
    public static Feature = 'Feature:';
    public static Scenario = 'Scenario:';
    public static Outline = 'Scenario Outline:';
    public static Examples = 'Examples:';
    public static Tag = '@';

    public static Given = 'Given ';
    public static And = 'And ';
    public static When = 'When ';
    public static Then = 'Then ';

    private static isKeywordMatch(text: string, keyword: string) {
        return (text.length > keyword.length && text.substring(0, keyword.length) === keyword);
    }

    public static isFeatureDeclaration(text: string) {
        return this.isKeywordMatch(text, this.Feature);
    }

    public static isScenarioDeclaration(text: string) {
        return this.isKeywordMatch(text, this.Scenario);
    }

    public static isOutlineDeclaration(text: string) {
        return this.isKeywordMatch(text, this.Outline);
    }

    public static isExamplesDeclaration(text: string) {
        return this.isKeywordMatch(text, this.Examples);
    }

    public static isTagDeclaration(text: string) {
        return this.isKeywordMatch(text, this.Tag);
    }

    public static isGivenDeclaration(text: string) {
        return this.isKeywordMatch(text, this.Given);
    }

    public static isWhenDeclaration(text: string) {
        return this.isKeywordMatch(text, this.When);
    }

    public static isThenDeclaration(text: string) {
        return this.isKeywordMatch(text, this.Then);
    }

    public static isAndDeclaration(text: string) {
        return this.isKeywordMatch(text, this.And);
    }
}

class StepDefinition {
    constructor(public expression: string, public step: Function) { }
}

export class StepDefinitions {
    private steps: StepDefinition[] = [];

    add(expression: string, step: Function) {
        this.steps.push(new StepDefinition(expression, step));
    }

    find(text: string) {
        for (var i = 0; i < this.steps.length; i++) {
            var step = this.steps[i];
            if (step.expression === text) {
                return step;
            }
        }
        return null;
        // TODO: regex match the text to a step, not just string match
    }
}

export class SpecReader {
    constructor(private steps: StepDefinitions) { }

    read(...url: string[]) {
        this.readFile(0, url);
    }

    private readFile(index: number, url: string[]) {
        if (index < url.length) {
            var nextIndex = index + 1;
            this.getFile(url[index], () => { this.readFile(nextIndex, url); });
        }

    }

    private getFile(url: string, callback: Function) {
        var _this = this;
        var client = new XMLHttpRequest();
        client.open('GET', url);
        client.onreadystatechange = function () {
            if (client.readyState === 4 && client.status === 200) {
                _this.processSpecification(client.responseText);
                callback();
            }
        }
        client.send();
    }

    private processSpecification(spec: string) {

        var state = new ScenarioState(this.steps);
        var lines = spec.replace('\r\n', '\n').split('\n');

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();

            if (!line) {
                // Skip empty lines
                continue;
            }

            if (Keyword.isFeatureDeclaration(line)) {
                state.startFeature(line);
                continue;
            }

            if (state.hasFeatureSection) {

                if (Keyword.isScenarioDeclaration(line)) {
                    state.startScenario(line);
                    continue;
                }

                if (Keyword.isOutlineDeclaration(line)) {
                    state.startOutline(line);
                    continue;
                }

                if (state.hasOutlineSection) {
                    if (Keyword.isExamplesDeclaration(line)) {
                        state.startExamples();
                    }
                }

                if (Keyword.isTagDeclaration(line)) {
                    var rawTags = line.split('@');
                    for (var tagIndex = 0; tagIndex < rawTags.length; tagIndex++) {
                        var trimmedTag = rawTags[tagIndex].trim().toLowerCase();
                        if (trimmedTag) {
                            state.tags.push(trimmedTag);
                        }
                    }

                    continue;
                }

                if (state.isFeatureSection) {
                    state.featureDescription.push(line);
                    continue;
                }

                if (Keyword.isGivenDeclaration(line)) {
                    state.startGiven(line);
                    continue;
                }

                if (Keyword.isWhenDeclaration(line)) {
                    state.startWhen(line);
                    continue;
                }

                if (Keyword.isThenDeclaration(line)) {
                    state.startThen(line);
                    continue;
                }

                if (Keyword.isAndDeclaration(line)) {
                    state.and(line);
                    continue;
                }

            }

            throw new Error('I don\'t know what to do with: ' + line);
        }

        //state.writeDebug();

        state.run();
    }
}


// Need to link lines from specs to methods
