import { Keyword, KeywordType } from './Keyword';
import { StepType } from './Steps';

export class Scenario {
    public givens: string[] = [];
    public whens: string[] = [];
    public thens: string[] = [];

    public featureTitle: string = '';
    public featureDescription: string[] = [];
    public scenarioTitle: string = '';

    public tags: string[] = [];
    public tagsToExclude: string[] = [];

    public tableHeaders: string[] = [];
    public tableRows: {}[] = [];

    constructor(priorState: Scenario | null) {
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
        const conditions: { condition: string; type: StepType; }[] = [];

        for (const given of this.givens) {
            conditions.push({
                condition: given,
                type: StepType.Given
            });
        }

        for (const when of this.whens) {
            conditions.push({
                condition: when,
                type: StepType.When
            });
        }

        for (const then of this.thens) {
            conditions.push({
                condition: then,
                type: StepType.Then
            });
        }

        return conditions;
    }

    prepareCondition(condition: string, index: number) {
        if (this.tableRows.length > index) {
            const data: any = this.tableRows[index];
            for (const prop in data) {
                const token = Keyword.getToken(prop);
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
        for (const excludedTag of this.tagsToExclude) {
            if (tag === excludedTag) {
                return true;
            }
        }

        return false;
    }

    isNewScenario(line: string) {
        return false;
    }

    unknown(line: string): Scenario {
        throw new Error(`Unknown line ${line}`);
    }

    feature(line: string): Scenario {
        throw new Error(this.unexpectedLine(line));
    }

    tag(line: string): Scenario {
        throw new Error(this.unexpectedLine(line));
    }

    scenario(line: string): Scenario {
        throw new Error(this.unexpectedLine(line));
    }

    outline(line: string): Scenario {
        throw new Error(this.unexpectedLine(line));
    }

    given(line: string): Scenario {
        throw new Error(this.unexpectedLine(line));
    }

    when(line: string): Scenario {
        throw new Error(this.unexpectedLine(line));
    }

    then(line: string): Scenario {
        throw new Error(this.unexpectedLine(line));
    }

    and(line: string): Scenario {
        throw new Error(this.unexpectedLine(line));
    }

    examples(line: string): Scenario {
        throw new Error(this.unexpectedLine(line));
    }

    table(line: string): Scenario {
        throw new Error(this.unexpectedLine(line));
    }

    private unexpectedLine(line: string) {
        return `Did not expect line: ${line}`;
    }
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

    constructor(priorState: Scenario | null) {
        super(priorState);
    }

    unknown(line: string) {
        this.featureDescription.push(line);
        return this;
    }

    tag(line: string): Scenario {
        const tags = Keyword.getTags(line);
        let trimmedTags: string[] = [];

        for (let i = 0; i < tags.length; i++) {
            const trimmedTag = tags[i].trim().toLowerCase();
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
        const headings = Keyword.getTableRow(line);

        for (const heading of headings) {
            const trimmedHeading = heading.trim();
            this.tableHeaders.push(trimmedHeading);
        }
        return new TableState(this);
    }
}

class TableState extends Scenario {
    constructor(priorState: Scenario) {
        super(priorState);
    }

    isNewScenario(line: string) {
        return (Keyword.is(line, KeywordType.Scenario) || Keyword.is(line, KeywordType.Outline) || Keyword.is(line, KeywordType.Tag));
    }

    table(line: string): Scenario {
        const data = Keyword.getTableRow(line);
        let row: any = {};

        for (let i = 0; i < data.length; i++) {
            const trimmedData = data[i].trim();
            if (this.tableHeaders[i]) {
                row[this.tableHeaders[i]] = trimmedData;
            }
        }

        this.tableRows.push(row);

        return this;
    }
}