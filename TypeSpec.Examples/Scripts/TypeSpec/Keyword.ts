export class Keyword {
    public static Feature = 'Feature:';
    public static Scenario = 'Scenario:';
    public static Outline = 'Scenario Outline:';
    public static Examples = 'Examples:';
    public static Tag = '@';
    public static Table = '|';
    public static TokenStart = '<';
    public static TokenEnd = '>';

    public static Given = 'Given ';
    public static And = 'And ';
    public static When = 'When ';
    public static Then = 'Then ';

    private static isKeywordMatch(text: string, keyword: string) {
        return (text.length >= keyword.length && text.substring(0, keyword.length) === keyword);
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

    public static isExamplesDeclaration(text: string) {
        return this.isKeywordMatch(text, this.Examples);
    }

    public static isTableDeclaration(text: string) {
        return this.isKeywordMatch(text, this.Table);
    }
}

export interface ITestReporter {
    summary(featureTitle: string, scenarioTitle: string, isSuccess: boolean): void;
    error(featureTitle: string, condition: string, error: Error): void;
    information(message: string): void;
    complete(): void;
}