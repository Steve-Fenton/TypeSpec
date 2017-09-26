export enum KeywordType {
    Unknown,
    Feature,
    Scenario,
    Outline,
    Examples,
    Tag,
    Table,
    TokenStart,
    TokenEnd,
    Given,
    When,
    Then,
    And
}

interface KeywordMap {
    [key: string]: KeywordType;
}

interface KeywordTypeMap {
    [key: number]: string;
}

export class Keywords {
    private Feature = 'Feature:';
    private Scenario = 'Scenario:';
    private Outline = 'Scenario Outline:';
    private Examples = 'Examples:';
    private Tag = '@';
    private Table = '|';
    private TokenStart = '<';
    private TokenEnd = '>';

    private Given = 'Given ';
    private When = 'When ';
    private Then = 'Then ';
    private And = 'And ';

    private KeywordMap: KeywordMap = {};
    private KeywordTypeMap: KeywordTypeMap = {};

    constructor() {
        this.addMap(this.Feature, KeywordType.Feature);
        this.addMap(this.Scenario, KeywordType.Scenario);
        this.addMap(this.Outline, KeywordType.Outline);
        this.addMap(this.Examples, KeywordType.Examples);
        this.addMap(this.Tag, KeywordType.Tag);
        this.addMap(this.Table, KeywordType.Table);
        this.addMap(this.TokenStart, KeywordType.TokenStart);
        this.addMap(this.TokenEnd, KeywordType.TokenEnd);

        this.addMap(this.Given, KeywordType.Given);
        this.addMap(this.When, KeywordType.When);
        this.addMap(this.Then, KeywordType.Then);
        this.addMap(this.And, KeywordType.And);
    }

    public is(text: string, keywordType: KeywordType) {
        const keyword = this.KeywordTypeMap[keywordType];
        return (text.length >= keyword.length && text.substring(0, keyword.length) === keyword);
    }

    public trimKeyword(text: string, keywordType: KeywordType) {
        const keyword = this.KeywordTypeMap[keywordType];
        return text.substring(keyword.length).trim();
    }

    public getToken(text: string) {
        return Keyword.TokenStart + text + Keyword.TokenEnd;
    }

    public getTags(text: string) {
        return text.split(Keyword.Tag);
    }

    public getTableRow(text: string) {
        return text.split(Keyword.Table);
    }

    private addMap(keyword: string, keywordType: KeywordType) {
        this.KeywordMap[keyword] = keywordType;
        this.KeywordTypeMap[keywordType] = keyword;
    }
}

export const Keyword = new Keywords();