import {Keyword, KeywordType} from './Keyword';
import {StepType} from './Steps';

export class Scenario {
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

    constructor(priorState: Scenario) {
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
                var token = Keyword.getToken(prop);
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

        if (Keyword.is(line, KeywordType.Feature)) {
            return this.feature(line);
        }

        if (Keyword.is(line, KeywordType.Tag)) {
            return this.tag(line);
        }

        if (Keyword.is(line, KeywordType.Scenario)) {
            return this.scenario(line);
        }

        if (Keyword.is(line, KeywordType.Outline)) {
            return this.outline(line);
        }

        if (Keyword.is(line, KeywordType.Given)) {
            return this.given(line);
        }

        if (Keyword.is(line, KeywordType.When)) {
            return this.when(line);
        }

        if (Keyword.is(line, KeywordType.Then)) {
            return this.then(line);
        }

        if (Keyword.is(line, KeywordType.And)) {
            return this.and(line);
        }

        if (Keyword.is(line, KeywordType.Examples)) {
            return this.examples(line);
        }

        if (Keyword.is(line, KeywordType.Table)) {
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

    unknown(line: string): Scenario {
        throw new Error('Unknown line ' + line);
    }

    feature(line: string): Scenario {
        throw new Error('Did not expect line: ' + line);
    }

    tag(line: string): Scenario {
        throw new Error('Did not expect line: ' + line);
    }

    scenario(line: string): Scenario {
        throw new Error('Did not expect line: ' + line);
    }

    outline(line: string): Scenario {
        throw new Error('Did not expect line: ' + line);
    }

    given(line: string): Scenario {
        throw new Error('Did not expect line: ' + line);
    }

    when(line: string): Scenario {
        throw new Error('Did not expect line: ' + line);
    }

    then(line: string): Scenario {
        throw new Error('Did not expect line: ' + line);
    }

    and(line: string): Scenario {
        throw new Error('Did not expect line: ' + line);
    }

    examples(line: string): Scenario {
        throw new Error('Did not expect line: ' + line);
    }

    table(line: string): Scenario {
        throw new Error('Did not expect line: ' + line);
    }

    //protected trimLine(text: string, keyword: string) {
    //    return text.substring(keyword.length).trim()
    //}
}

/*
    Each state objects only has the methods it allows.
    This makes it easy to see which methods are allowed in 
    any given state
*/

export class InitializedState extends Scenario {

    constructor(tagsToExclude: string[] = []) {
        super(null);
        this.tagsToExclude = tagsToExclude;
    }

    feature(line: string): Scenario {
        this.featureTitle = Keyword.trimKeyword(line, KeywordType.Feature);
        return new FeatureState(this);
    }
}

export class FeatureState extends Scenario {

    constructor(priorState: Scenario) {
        super(priorState);
    }

    unknown(line: string) {
        this.featureDescription.push(line);
        return this;
    }

    tag(line: string): Scenario {
        var tags = Keyword.getTags(line);
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

    scenario(line: string): Scenario {
        this.scenarioTitle = Keyword.trimKeyword(line, KeywordType.Scenario);
        return new ScenarioState(this);
    }

    outline(line: string): Scenario {
        this.scenarioTitle = Keyword.trimKeyword(line, KeywordType.Scenario);
        return new ScenarioState(this);
    }
}

class ExcludedScenarioState extends Scenario {
    private hasScenario: boolean = false;

    constructor(priorState: Scenario) {
        super(priorState);
    }

    isNewScenario(line: string) {
        return this.hasScenario && (Keyword.is(line, KeywordType.Scenario) || Keyword.is(line, KeywordType.Outline) || Keyword.is(line, KeywordType.Tag));
    }

    tag(line: string): Scenario {
        // Discard
        return this;
    }

    scenario(line: string): Scenario {
        // Discard
        this.hasScenario = true;
        return this;
    }

    outline(line: string): Scenario {
        // Discard
        this.hasScenario = true;
        return this;
    }

    given(line: string): Scenario {
        // Discard
        return this;
    }

    when(line: string): Scenario {
        // Discard
        return this;
    }

    then(line: string): Scenario {
        // Discard
        return this;
    }

    and(line: string): Scenario {
        // Discard
        return this;
    }

    examples(line: string): Scenario {
        // Discard
        return this;
    }

    table(line: string): Scenario {
        // Discard
        return this;
    }
}

class ScenarioState extends Scenario {

    constructor(priorState: Scenario) {
        super(priorState);
    }

    given(line: string): Scenario {
        this.givens.push(Keyword.trimKeyword(line, KeywordType.Given));
        return new GivenState(this);
    }
}

class GivenState extends Scenario {

    constructor(priorState: Scenario) {
        super(priorState);
    }

    when(line: string): Scenario {
        this.whens.push(Keyword.trimKeyword(line, KeywordType.When));
        return new WhenState(this);
    }

    then(line: string): Scenario {
        this.thens.push(Keyword.trimKeyword(line, KeywordType.Then));
        return new ThenState(this);
    }

    and(line: string) {
        this.givens.push(Keyword.trimKeyword(line, KeywordType.And));
        return this;
    }
}

class WhenState extends Scenario {

    constructor(priorState: Scenario) {
        super(priorState);
    }

    then(line: string): Scenario {
        this.thens.push(Keyword.trimKeyword(line, KeywordType.Then));
        return new ThenState(this);
    }

    and(line: string) {
        this.whens.push(Keyword.trimKeyword(line, KeywordType.And));
        return this;
    }
}

class ThenState extends Scenario {

    constructor(priorState: Scenario) {
        super(priorState);
    }

    isNewScenario(line: string) {
        return (Keyword.is(line, KeywordType.Scenario) || Keyword.is(line, KeywordType.Outline) || Keyword.is(line, KeywordType.Tag));
    }

    and(line: string) {
        this.thens.push(Keyword.trimKeyword(line, KeywordType.And));
        return this;
    }

    examples(line: string): Scenario {
        return new ExampleState(this);
    }
}

class ExampleState extends Scenario {
    constructor(priorState: Scenario) {
        super(priorState);
    }

    table(line: string): Scenario {
        var headings = Keyword.getTableRow(line);
        for (var i = 0; i < headings.length; i++) {
            var trimmedHeading = headings[i].trim();
            this.tableHeaders.push(trimmedHeading);
        }
        return new TableState(this);
    }
}

class TableState extends Scenario {
    constructor(priorState: Scenario) {
        super(priorState);
    }

    table(line: string): Scenario {
        var data = Keyword.getTableRow(line);
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