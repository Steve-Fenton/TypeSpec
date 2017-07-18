var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Keyword", "./Steps"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Keyword_1 = require("./Keyword");
    var Steps_1 = require("./Steps");
    var Scenario = (function () {
        function Scenario(priorState) {
            this.givens = [];
            this.whens = [];
            this.thens = [];
            this.featureDescription = [];
            this.tags = [];
            this.tagsToExclude = [];
            this.tableHeaders = [];
            this.tableRows = [];
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
        Scenario.prototype.getAllConditions = function () {
            var conditions = [];
            for (var _i = 0, _a = this.givens; _i < _a.length; _i++) {
                var given = _a[_i];
                conditions.push({
                    condition: given,
                    type: Steps_1.StepType.Given
                });
            }
            for (var _b = 0, _c = this.whens; _b < _c.length; _b++) {
                var when = _c[_b];
                conditions.push({
                    condition: when,
                    type: Steps_1.StepType.When
                });
            }
            for (var _d = 0, _e = this.thens; _d < _e.length; _d++) {
                var then = _e[_d];
                conditions.push({
                    condition: then,
                    type: Steps_1.StepType.Then
                });
            }
            return conditions;
        };
        Scenario.prototype.prepareCondition = function (condition, index) {
            if (this.tableRows.length > index) {
                var data = this.tableRows[index];
                for (var prop in data) {
                    var token = Keyword_1.Keyword.getToken(prop);
                    condition = condition.replace(token, data[prop]);
                }
            }
            return condition;
        };
        Scenario.prototype.process = function (line) {
            line = line.trim();
            if (!line) {
                // Skip empty lines
                return this;
            }
            if (Keyword_1.Keyword.is(line, Keyword_1.KeywordType.Feature)) {
                return this.feature(line);
            }
            if (Keyword_1.Keyword.is(line, Keyword_1.KeywordType.Tag)) {
                return this.tag(line);
            }
            if (Keyword_1.Keyword.is(line, Keyword_1.KeywordType.Scenario)) {
                return this.scenario(line);
            }
            if (Keyword_1.Keyword.is(line, Keyword_1.KeywordType.Outline)) {
                return this.outline(line);
            }
            if (Keyword_1.Keyword.is(line, Keyword_1.KeywordType.Given)) {
                return this.given(line);
            }
            if (Keyword_1.Keyword.is(line, Keyword_1.KeywordType.When)) {
                return this.when(line);
            }
            if (Keyword_1.Keyword.is(line, Keyword_1.KeywordType.Then)) {
                return this.then(line);
            }
            if (Keyword_1.Keyword.is(line, Keyword_1.KeywordType.And)) {
                return this.and(line);
            }
            if (Keyword_1.Keyword.is(line, Keyword_1.KeywordType.Examples)) {
                return this.examples(line);
            }
            if (Keyword_1.Keyword.is(line, Keyword_1.KeywordType.Table)) {
                return this.table(line);
            }
            return this.unknown(line);
        };
        Scenario.prototype.isTagExcluded = function (tag) {
            for (var _i = 0, _a = this.tagsToExclude; _i < _a.length; _i++) {
                var excludedTag = _a[_i];
                if (tag === excludedTag) {
                    return true;
                }
            }
            return false;
        };
        Scenario.prototype.isNewScenario = function (line) {
            return false;
        };
        Scenario.prototype.unknown = function (line) {
            throw new Error('Unknown line ' + line);
        };
        Scenario.prototype.feature = function (line) {
            throw new Error('Did not expect line: ' + line);
        };
        Scenario.prototype.tag = function (line) {
            throw new Error('Did not expect line: ' + line);
        };
        Scenario.prototype.scenario = function (line) {
            throw new Error('Did not expect line: ' + line);
        };
        Scenario.prototype.outline = function (line) {
            throw new Error('Did not expect line: ' + line);
        };
        Scenario.prototype.given = function (line) {
            throw new Error('Did not expect line: ' + line);
        };
        Scenario.prototype.when = function (line) {
            throw new Error('Did not expect line: ' + line);
        };
        Scenario.prototype.then = function (line) {
            throw new Error('Did not expect line: ' + line);
        };
        Scenario.prototype.and = function (line) {
            throw new Error('Did not expect line: ' + line);
        };
        Scenario.prototype.examples = function (line) {
            throw new Error('Did not expect line: ' + line);
        };
        Scenario.prototype.table = function (line) {
            throw new Error('Did not expect line: ' + line);
        };
        return Scenario;
    }());
    exports.Scenario = Scenario;
    /*
        Each state objects only has the methods it allows.
        This makes it easy to see which methods are allowed in
        any given state
    */
    var InitializedState = (function (_super) {
        __extends(InitializedState, _super);
        function InitializedState(tagsToExclude) {
            if (tagsToExclude === void 0) { tagsToExclude = []; }
            var _this = _super.call(this, null) || this;
            _this.tagsToExclude = tagsToExclude;
            return _this;
        }
        InitializedState.prototype.feature = function (line) {
            this.featureTitle = Keyword_1.Keyword.trimKeyword(line, Keyword_1.KeywordType.Feature);
            return new FeatureState(this);
        };
        return InitializedState;
    }(Scenario));
    exports.InitializedState = InitializedState;
    var FeatureState = (function (_super) {
        __extends(FeatureState, _super);
        function FeatureState(priorState) {
            return _super.call(this, priorState) || this;
        }
        FeatureState.prototype.unknown = function (line) {
            this.featureDescription.push(line);
            return this;
        };
        FeatureState.prototype.tag = function (line) {
            var tags = Keyword_1.Keyword.getTags(line);
            var trimmedTags = [];
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
        };
        FeatureState.prototype.scenario = function (line) {
            this.scenarioTitle = Keyword_1.Keyword.trimKeyword(line, Keyword_1.KeywordType.Scenario);
            return new ScenarioState(this);
        };
        FeatureState.prototype.outline = function (line) {
            this.scenarioTitle = Keyword_1.Keyword.trimKeyword(line, Keyword_1.KeywordType.Scenario);
            return new ScenarioState(this);
        };
        return FeatureState;
    }(Scenario));
    exports.FeatureState = FeatureState;
    var ExcludedScenarioState = (function (_super) {
        __extends(ExcludedScenarioState, _super);
        function ExcludedScenarioState(priorState) {
            var _this = _super.call(this, priorState) || this;
            _this.hasScenario = false;
            return _this;
        }
        ExcludedScenarioState.prototype.isNewScenario = function (line) {
            return this.hasScenario && (Keyword_1.Keyword.is(line, Keyword_1.KeywordType.Scenario) || Keyword_1.Keyword.is(line, Keyword_1.KeywordType.Outline) || Keyword_1.Keyword.is(line, Keyword_1.KeywordType.Tag));
        };
        ExcludedScenarioState.prototype.tag = function (line) {
            // Discard
            return this;
        };
        ExcludedScenarioState.prototype.scenario = function (line) {
            // Discard
            this.hasScenario = true;
            return this;
        };
        ExcludedScenarioState.prototype.outline = function (line) {
            // Discard
            this.hasScenario = true;
            return this;
        };
        ExcludedScenarioState.prototype.given = function (line) {
            // Discard
            return this;
        };
        ExcludedScenarioState.prototype.when = function (line) {
            // Discard
            return this;
        };
        ExcludedScenarioState.prototype.then = function (line) {
            // Discard
            return this;
        };
        ExcludedScenarioState.prototype.and = function (line) {
            // Discard
            return this;
        };
        ExcludedScenarioState.prototype.examples = function (line) {
            // Discard
            return this;
        };
        ExcludedScenarioState.prototype.table = function (line) {
            // Discard
            return this;
        };
        return ExcludedScenarioState;
    }(Scenario));
    var ScenarioState = (function (_super) {
        __extends(ScenarioState, _super);
        function ScenarioState(priorState) {
            return _super.call(this, priorState) || this;
        }
        ScenarioState.prototype.given = function (line) {
            this.givens.push(Keyword_1.Keyword.trimKeyword(line, Keyword_1.KeywordType.Given));
            return new GivenState(this);
        };
        return ScenarioState;
    }(Scenario));
    var GivenState = (function (_super) {
        __extends(GivenState, _super);
        function GivenState(priorState) {
            return _super.call(this, priorState) || this;
        }
        GivenState.prototype.when = function (line) {
            this.whens.push(Keyword_1.Keyword.trimKeyword(line, Keyword_1.KeywordType.When));
            return new WhenState(this);
        };
        GivenState.prototype.then = function (line) {
            this.thens.push(Keyword_1.Keyword.trimKeyword(line, Keyword_1.KeywordType.Then));
            return new ThenState(this);
        };
        GivenState.prototype.and = function (line) {
            this.givens.push(Keyword_1.Keyword.trimKeyword(line, Keyword_1.KeywordType.And));
            return this;
        };
        return GivenState;
    }(Scenario));
    var WhenState = (function (_super) {
        __extends(WhenState, _super);
        function WhenState(priorState) {
            return _super.call(this, priorState) || this;
        }
        WhenState.prototype.then = function (line) {
            this.thens.push(Keyword_1.Keyword.trimKeyword(line, Keyword_1.KeywordType.Then));
            return new ThenState(this);
        };
        WhenState.prototype.and = function (line) {
            this.whens.push(Keyword_1.Keyword.trimKeyword(line, Keyword_1.KeywordType.And));
            return this;
        };
        return WhenState;
    }(Scenario));
    var ThenState = (function (_super) {
        __extends(ThenState, _super);
        function ThenState(priorState) {
            return _super.call(this, priorState) || this;
        }
        ThenState.prototype.isNewScenario = function (line) {
            return (Keyword_1.Keyword.is(line, Keyword_1.KeywordType.Scenario) || Keyword_1.Keyword.is(line, Keyword_1.KeywordType.Outline) || Keyword_1.Keyword.is(line, Keyword_1.KeywordType.Tag));
        };
        ThenState.prototype.and = function (line) {
            this.thens.push(Keyword_1.Keyword.trimKeyword(line, Keyword_1.KeywordType.And));
            return this;
        };
        ThenState.prototype.examples = function (line) {
            return new ExampleState(this);
        };
        return ThenState;
    }(Scenario));
    var ExampleState = (function (_super) {
        __extends(ExampleState, _super);
        function ExampleState(priorState) {
            return _super.call(this, priorState) || this;
        }
        ExampleState.prototype.table = function (line) {
            var headings = Keyword_1.Keyword.getTableRow(line);
            for (var _i = 0, headings_1 = headings; _i < headings_1.length; _i++) {
                var heading = headings_1[_i];
                var trimmedHeading = heading.trim();
                this.tableHeaders.push(trimmedHeading);
            }
            return new TableState(this);
        };
        return ExampleState;
    }(Scenario));
    var TableState = (function (_super) {
        __extends(TableState, _super);
        function TableState(priorState) {
            return _super.call(this, priorState) || this;
        }
        TableState.prototype.table = function (line) {
            var data = Keyword_1.Keyword.getTableRow(line);
            var row = {};
            for (var i = 0; i < data.length; i++) {
                var trimmedData = data[i].trim();
                if (this.tableHeaders[i]) {
                    row[this.tableHeaders[i]] = trimmedData;
                }
            }
            this.tableRows.push(row);
            return this;
        };
        return TableState;
    }(Scenario));
});
//# sourceMappingURL=State.js.map