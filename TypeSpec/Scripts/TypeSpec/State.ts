import {Keyword} from './Keyword';
import {StepType} from './Steps';

export class StateBase {
    public givens: string[] = [];
    public whens: string[] = [];
    public thens: string[] = [];

    public featureTitle: string;
    public featureDescription: string[] = [];
    public scenarioTitle: string;

    public tags: string[] = [];
    public tagsToExclude: string[] = [];

    public tableHeaders: string[] = [];
    public tableRows: {}[] = [];

    constructor(priorState: StateBase) {
        if (priorState !== null) {
            this.featureTitle = priorState.featureTitle;
            this.featureDescription = priorState.featureDescription;
            this.scenarioTitle = priorState.scenarioTitle;

            this.tags = priorState.tags;
            this.tagsToExclude = priorState.tagsToExclude;

            this.tableHeaders = priorState.tableHeaders;
            this.tableRows = priorState.tableRows;

            this.givens = priorState.givens;
            this.whens = priorState.whens;
            this.thens = priorState.thens;
        }
    }

    getAllConditions() {
        var conditions: { condition: string; type: StepType; }[] = [];

        for (var i = 0; i < this.givens.length; i++) {
            conditions.push({
                condition: this.givens[i],
                type: StepType.Given
            });
        }

        for (var i = 0; i < this.whens.length; i++) {
            conditions.push({
                condition: this.whens[i],
                type: StepType.When
            });
        }

        for (var i = 0; i < this.thens.length; i++) {
            conditions.push({
                condition: this.thens[i],
                type: StepType.Then
            });
        }

        return conditions;
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

    isTagExcluded(tag: string) {
        for (var i = 0; i < this.tagsToExclude.length; i++) {
            if (this.tagsToExclude[i] === tag) {
                return true;
            }
        }

        return false;
    }

    isNewScenario(line: string) {
        return false;
    }

    unknown(line: string): StateBase {
        throw new Error('Unknown line ' + line);
    }

    feature(line: string): StateBase {
        throw new Error('Did not expect line: ' + line);
    }

    tag(line: string): StateBase {
        throw new Error('Did not expect line: ' + line);
    }

    scenario(line: string): StateBase {
        throw new Error('Did not expect line: ' + line);
    }

    outline(line: string): StateBase {
        throw new Error('Did not expect line: ' + line);
    }

    given(line: string): StateBase {
        throw new Error('Did not expect line: ' + line);
    }

    when(line: string): StateBase {
        throw new Error('Did not expect line: ' + line);
    }

    then(line: string): StateBase {
        throw new Error('Did not expect line: ' + line);
    }

    and(line: string): StateBase {
        throw new Error('Did not expect line: ' + line);
    }

    examples(line: string): StateBase {
        throw new Error('Did not expect line: ' + line);
    }

    table(line: string): StateBase {
        throw new Error('Did not expect line: ' + line);
    }

    protected trimLine(text: string, keyword: string) {
        return text.substring(keyword.length).trim()
    }
}

/*
    Each state objects only has the methods it allows.
    This makes it easy to see which methods are allowed in 
    any given state
*/

export class InitializedState extends StateBase {

    constructor(tagsToExclude: string[] = []) {
        super(null);
        this.tagsToExclude = tagsToExclude;
    }

    feature(line: string): StateBase {
        this.featureTitle = this.trimLine(line, Keyword.Feature);
        return new FeatureState(this);
    }
}

export class FeatureState extends StateBase {

    constructor(priorState: StateBase) {
        super(priorState);
    }

    unknown(line: string) {
        this.featureDescription.push(line);
        return this;
    }

    tag(line: string): StateBase {
        var tags = line.split(Keyword.Tag);
        var trimmedTags: string[] = [];
        for (var i = 0; i < tags.length; i++) {
            var trimmedTag = tags[i].trim().toLowerCase();
            if (trimmedTag) {
                if (this.isTagExcluded(trimmedTag)) {
                    // Exclude this scenario...
                    return new ExcludedScenarioState(this);
                }
                trimmedTags.push(trimmedTag);
            }
        }

        this.tags.push.apply(this.tags, trimmedTags);

        return this;
    }

    scenario(line: string): StateBase {
        this.scenarioTitle = this.trimLine(line, Keyword.Scenario);
        return new ScenarioState(this);
    }

    outline(line: string): StateBase {
        this.scenarioTitle = this.trimLine(line, Keyword.Scenario);
        return new ScenarioState(this);
    }
}

class ExcludedScenarioState extends StateBase {
    private hasScenario: boolean = false;

    constructor(priorState: StateBase) {
        super(priorState);
    }

    isNewScenario(line: string) {
        return this.hasScenario && (Keyword.isScenarioDeclaration(line) || Keyword.isOutlineDeclaration(line) || Keyword.isTagDeclaration(line));
    }

    tag(line: string): StateBase {
        // Discard
        return this;
    }

    scenario(line: string): StateBase {
        // Discard
        this.hasScenario = true;
        return this;
    }

    outline(line: string): StateBase {
        // Discard
        this.hasScenario = true;
        return this;
    }

    given(line: string): StateBase {
        // Discard
        return this;
    }

    when(line: string): StateBase {
        // Discard
        return this;
    }

    then(line: string): StateBase {
        // Discard
        return this;
    }

    and(line: string): StateBase {
        // Discard
        return this;
    }

    examples(line: string): StateBase {
        // Discard
        return this;
    }

    table(line: string): StateBase {
        // Discard
        return this;
    }
}

class ScenarioState extends StateBase {

    constructor(priorState: StateBase) {
        super(priorState);
    }

    given(line: string): StateBase {
        this.givens.push(this.trimLine(line, Keyword.Given));
        return new GivenState(this);
    }
}

class GivenState extends StateBase {

    constructor(priorState: StateBase) {
        super(priorState);
    }

    when(line: string): StateBase {
        this.whens.push(this.trimLine(line, Keyword.When));
        return new WhenState(this);
    }

    then(line: string): StateBase {
        this.thens.push(this.trimLine(line, Keyword.Then));
        return new ThenState(this);
    }

    and(line: string) {
        this.givens.push(this.trimLine(line, Keyword.And));
        return this;
    }
}

class WhenState extends StateBase {

    constructor(priorState: StateBase) {
        super(priorState);
    }

    then(line: string): StateBase {
        this.thens.push(this.trimLine(line, Keyword.Then));
        return new ThenState(this);
    }

    and(line: string) {
        this.whens.push(this.trimLine(line, Keyword.And));
        return this;
    }
}

class ThenState extends StateBase {

    constructor(priorState: StateBase) {
        super(priorState);
    }

    isNewScenario(line: string) {
        return (Keyword.isScenarioDeclaration(line) || Keyword.isOutlineDeclaration(line) || Keyword.isTagDeclaration(line));
    }

    and(line: string) {
        this.thens.push(this.trimLine(line, Keyword.And));
        return this;
    }

    examples(line: string): StateBase {
        return new ExampleState(this);
    }
}

class ExampleState extends StateBase {
    constructor(priorState: StateBase) {
        super(priorState);
    }

    table(line: string): StateBase {
        var headings = line.split(Keyword.Table);
        for (var i = 0; i < headings.length; i++) {
            var trimmedHeading = headings[i].trim();
            this.tableHeaders.push(trimmedHeading);
        }
        return new TableState(this);
    }
}

class TableState extends StateBase {
    constructor(priorState: StateBase) {
        super(priorState);
    }

    table(line: string): StateBase {
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