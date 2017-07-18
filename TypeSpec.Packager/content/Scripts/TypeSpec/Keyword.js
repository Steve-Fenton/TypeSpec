(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    (function (KeywordType) {
        KeywordType[KeywordType["Unknown"] = 0] = "Unknown";
        KeywordType[KeywordType["Feature"] = 1] = "Feature";
        KeywordType[KeywordType["Scenario"] = 2] = "Scenario";
        KeywordType[KeywordType["Outline"] = 3] = "Outline";
        KeywordType[KeywordType["Examples"] = 4] = "Examples";
        KeywordType[KeywordType["Tag"] = 5] = "Tag";
        KeywordType[KeywordType["Table"] = 6] = "Table";
        KeywordType[KeywordType["TokenStart"] = 7] = "TokenStart";
        KeywordType[KeywordType["TokenEnd"] = 8] = "TokenEnd";
        KeywordType[KeywordType["Given"] = 9] = "Given";
        KeywordType[KeywordType["When"] = 10] = "When";
        KeywordType[KeywordType["Then"] = 11] = "Then";
        KeywordType[KeywordType["And"] = 12] = "And";
    })(exports.KeywordType || (exports.KeywordType = {}));
    var KeywordType = exports.KeywordType;
    var KeywordMap = (function () {
        function KeywordMap() {
        }
        return KeywordMap;
    }());
    var KeywordTypeMap = (function () {
        function KeywordTypeMap() {
        }
        return KeywordTypeMap;
    }());
    var Keywords = (function () {
        function Keywords() {
            this.Feature = 'Feature:';
            this.Scenario = 'Scenario:';
            this.Outline = 'Scenario Outline:';
            this.Examples = 'Examples:';
            this.Tag = '@';
            this.Table = '|';
            this.TokenStart = '<';
            this.TokenEnd = '>';
            this.Given = 'Given ';
            this.When = 'When ';
            this.Then = 'Then ';
            this.And = 'And ';
            this.KeywordMap = {};
            this.KeywordTypeMap = {};
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
        Keywords.prototype.is = function (text, keywordType) {
            var keyword = this.KeywordTypeMap[keywordType];
            return (text.length >= keyword.length && text.substring(0, keyword.length) === keyword);
        };
        Keywords.prototype.trimKeyword = function (text, keywordType) {
            var keyword = this.KeywordTypeMap[keywordType];
            return text.substring(keyword.length).trim();
        };
        Keywords.prototype.getToken = function (text) {
            return exports.Keyword.TokenStart + text + exports.Keyword.TokenEnd;
        };
        Keywords.prototype.getTags = function (text) {
            return text.split(exports.Keyword.Tag);
        };
        Keywords.prototype.getTableRow = function (text) {
            return text.split(exports.Keyword.Table);
        };
        Keywords.prototype.addMap = function (keyword, keywordType) {
            this.KeywordMap[keyword] = keywordType;
            this.KeywordTypeMap[keywordType] = keyword;
        };
        Keywords.prototype.getKeywordType = function (text) {
            if (this.KeywordMap[text]) {
                return this.KeywordMap[text];
            }
            return KeywordType.Unknown;
        };
        return Keywords;
    }());
    exports.Keywords = Keywords;
    exports.Keyword = new Keywords();
});
//# sourceMappingURL=Keyword.js.map