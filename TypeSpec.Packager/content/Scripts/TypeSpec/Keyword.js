(function (deps, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(deps, factory);
    }
})(["require", "exports"], function (require, exports) {
    var Keyword = (function () {
        function Keyword() {
        }
        Keyword.isKeywordMatch = function (text, keyword) {
            return (text.length >= keyword.length && text.substring(0, keyword.length) === keyword);
        };
        Keyword.isFeatureDeclaration = function (text) {
            return this.isKeywordMatch(text, this.Feature);
        };
        Keyword.isScenarioDeclaration = function (text) {
            return this.isKeywordMatch(text, this.Scenario);
        };
        Keyword.isOutlineDeclaration = function (text) {
            return this.isKeywordMatch(text, this.Outline);
        };
        Keyword.isTagDeclaration = function (text) {
            return this.isKeywordMatch(text, this.Tag);
        };
        Keyword.isGivenDeclaration = function (text) {
            return this.isKeywordMatch(text, this.Given);
        };
        Keyword.isWhenDeclaration = function (text) {
            return this.isKeywordMatch(text, this.When);
        };
        Keyword.isThenDeclaration = function (text) {
            return this.isKeywordMatch(text, this.Then);
        };
        Keyword.isAndDeclaration = function (text) {
            return this.isKeywordMatch(text, this.And);
        };
        Keyword.isExamplesDeclaration = function (text) {
            return this.isKeywordMatch(text, this.Examples);
        };
        Keyword.isTableDeclaration = function (text) {
            return this.isKeywordMatch(text, this.Table);
        };
        Keyword.Feature = 'Feature:';
        Keyword.Scenario = 'Scenario:';
        Keyword.Outline = 'Scenario Outline:';
        Keyword.Examples = 'Examples:';
        Keyword.Tag = '@';
        Keyword.Table = '|';
        Keyword.TokenStart = '<';
        Keyword.TokenEnd = '>';
        Keyword.Given = 'Given ';
        Keyword.And = 'And ';
        Keyword.When = 'When ';
        Keyword.Then = 'Then ';
        return Keyword;
    })();
    exports.Keyword = Keyword;
});
