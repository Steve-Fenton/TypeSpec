var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
(function (deps, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(deps, factory);
    }
})(["require", "exports", './Keyword', './Steps'], function (require, exports) {
    var Keyword_1 = require('./Keyword');
    var Steps_1 = require('./Steps');
    var StateBase = (function () {
        function StateBase(priorState) {
            this.givens = [];
            this.whens = [];
            this.thens = [];
            this.featureDescription = [];
            this.tags = [];
            this.tagsToExclude = [];
            this.tableHeaders = [];
            this.tableRows = [];
            this.givenIndex = -1;
            this.whenIndex = -1;
            this.thenIndex = -1;
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
        StateBase.prototype.getAllConditions = function () {
            var conditions = [];
            if (this.givenIndex < this.givens.length - 1) {
                this.givenIndex++;
                conditions.push({
                    condition: this.givens[this.givenIndex],
                    type: Steps_1.StepType.Given
                });
            }
            if (this.whenIndex < this.whens.length - 1) {
                this.whenIndex++;
                conditions.push({
                    condition: this.whens[this.whenIndex],
                    type: Steps_1.StepType.When
                });
            }
            if (this.thenIndex < this.thens.length - 1) {
                this.thenIndex++;
                conditions.push({
                    condition: this.thens[this.thenIndex],
                    type: Steps_1.StepType.Then
                });
            }
            return conditions;
        };
        StateBase.prototype.prepareCondition = function (condition, index) {
            if (this.tableRows.length > index) {
                var data = this.tableRows[index];
                for (var prop in data) {
                    var token = Keyword_1.Keyword.TokenStart + prop + Keyword_1.Keyword.TokenEnd;
                    condition = condition.replace(token, data[prop]);
                }
            }
            return condition;
        };
        StateBase.prototype.process = function (line) {
            line = line.trim();
            if (!line) {
                return this;
            }
            if (Keyword_1.Keyword.isFeatureDeclaration(line)) {
                return this.feature(line);
            }
            if (Keyword_1.Keyword.isTagDeclaration(line)) {
                return this.tag(line);
            }
            if (Keyword_1.Keyword.isScenarioDeclaration(line)) {
                return this.scenario(line);
            }
            if (Keyword_1.Keyword.isOutlineDeclaration(line)) {
                return this.outline(line);
            }
            if (Keyword_1.Keyword.isGivenDeclaration(line)) {
                return this.given(line);
            }
            if (Keyword_1.Keyword.isWhenDeclaration(line)) {
                return this.when(line);
            }
            if (Keyword_1.Keyword.isThenDeclaration(line)) {
                return this.then(line);
            }
            if (Keyword_1.Keyword.isAndDeclaration(line)) {
                return this.and(line);
            }
            if (Keyword_1.Keyword.isExamplesDeclaration(line)) {
                return this.examples(line);
            }
            if (Keyword_1.Keyword.isTableDeclaration(line)) {
                return this.table(line);
            }
            return this.unknown(line);
        };
        StateBase.prototype.isTagExcluded = function (tag) {
            for (var i = 0; i < this.tagsToExclude.length; i++) {
                if (this.tagsToExclude[i] === tag) {
                    return true;
                }
            }
            return false;
        };
        StateBase.prototype.isNewScenario = function (line) {
            return false;
        };
        StateBase.prototype.unknown = function (line) {
            throw new Error('Unknown line ' + line);
        };
        StateBase.prototype.feature = function (line) {
            throw new Error('Did not expect line: ' + line);
        };
        StateBase.prototype.tag = function (line) {
            throw new Error('Did not expect line: ' + line);
        };
        StateBase.prototype.scenario = function (line) {
            throw new Error('Did not expect line: ' + line);
        };
        StateBase.prototype.outline = function (line) {
            throw new Error('Did not expect line: ' + line);
        };
        StateBase.prototype.given = function (line) {
            throw new Error('Did not expect line: ' + line);
        };
        StateBase.prototype.when = function (line) {
            throw new Error('Did not expect line: ' + line);
        };
        StateBase.prototype.then = function (line) {
            throw new Error('Did not expect line: ' + line);
        };
        StateBase.prototype.and = function (line) {
            throw new Error('Did not expect line: ' + line);
        };
        StateBase.prototype.examples = function (line) {
            throw new Error('Did not expect line: ' + line);
        };
        StateBase.prototype.table = function (line) {
            throw new Error('Did not expect line: ' + line);
        };
        StateBase.prototype.trimLine = function (text, keyword) {
            return text.substring(keyword.length).trim();
        };
        return StateBase;
    })();
    exports.StateBase = StateBase;
    var InitializedState = (function (_super) {
        __extends(InitializedState, _super);
        function InitializedState(tagsToExclude) {
            if (tagsToExclude === void 0) { tagsToExclude = []; }
            _super.call(this, null);
            this.tagsToExclude = tagsToExclude;
        }
        InitializedState.prototype.feature = function (line) {
            this.featureTitle = this.trimLine(line, Keyword_1.Keyword.Feature);
            return new FeatureState(this);
        };
        return InitializedState;
    })(StateBase);
    exports.InitializedState = InitializedState;
    var FeatureState = (function (_super) {
        __extends(FeatureState, _super);
        function FeatureState(priorState) {
            _super.call(this, priorState);
        }
        FeatureState.prototype.unknown = function (line) {
            this.featureDescription.push(line);
            return this;
        };
        FeatureState.prototype.tag = function (line) {
            var tags = line.split(Keyword_1.Keyword.Tag);
            var trimmedTags = [];
            for (var i = 0; i < tags.length; i++) {
                var trimmedTag = tags[i].trim().toLowerCase();
                if (trimmedTag) {
                    if (this.isTagExcluded(trimmedTag)) {
                        return new ExcludedScenarioState(this);
                    }
                    trimmedTags.push(trimmedTag);
                }
            }
            this.tags.push.apply(this.tags, trimmedTags);
            return this;
        };
        FeatureState.prototype.scenario = function (line) {
            this.scenarioTitle = this.trimLine(line, Keyword_1.Keyword.Scenario);
            return new ScenarioState(this);
        };
        FeatureState.prototype.outline = function (line) {
            this.scenarioTitle = this.trimLine(line, Keyword_1.Keyword.Scenario);
            return new ScenarioState(this);
        };
        return FeatureState;
    })(StateBase);
    exports.FeatureState = FeatureState;
    var ExcludedScenarioState = (function (_super) {
        __extends(ExcludedScenarioState, _super);
        function ExcludedScenarioState(priorState) {
            _super.call(this, priorState);
            this.hasScenario = false;
        }
        ExcludedScenarioState.prototype.isNewScenario = function (line) {
            return this.hasScenario && (Keyword_1.Keyword.isScenarioDeclaration(line) || Keyword_1.Keyword.isOutlineDeclaration(line) || Keyword_1.Keyword.isTagDeclaration(line));
        };
        ExcludedScenarioState.prototype.tag = function (line) {
            return this;
        };
        ExcludedScenarioState.prototype.scenario = function (line) {
            this.hasScenario = true;
            return this;
        };
        ExcludedScenarioState.prototype.outline = function (line) {
            this.hasScenario = true;
            return this;
        };
        ExcludedScenarioState.prototype.given = function (line) {
            return this;
        };
        ExcludedScenarioState.prototype.when = function (line) {
            return this;
        };
        ExcludedScenarioState.prototype.then = function (line) {
            return this;
        };
        ExcludedScenarioState.prototype.and = function (line) {
            return this;
        };
        ExcludedScenarioState.prototype.examples = function (line) {
            return this;
        };
        ExcludedScenarioState.prototype.table = function (line) {
            return this;
        };
        return ExcludedScenarioState;
    })(StateBase);
    var ScenarioState = (function (_super) {
        __extends(ScenarioState, _super);
        function ScenarioState(priorState) {
            _super.call(this, priorState);
        }
        ScenarioState.prototype.given = function (line) {
            this.givens.push(this.trimLine(line, Keyword_1.Keyword.Given));
            return new GivenState(this);
        };
        return ScenarioState;
    })(StateBase);
    var GivenState = (function (_super) {
        __extends(GivenState, _super);
        function GivenState(priorState) {
            _super.call(this, priorState);
        }
        GivenState.prototype.when = function (line) {
            this.whens.push(this.trimLine(line, Keyword_1.Keyword.When));
            return new WhenState(this);
        };
        GivenState.prototype.then = function (line) {
            this.thens.push(this.trimLine(line, Keyword_1.Keyword.Then));
            return new ThenState(this);
        };
        GivenState.prototype.and = function (line) {
            this.givens.push(this.trimLine(line, Keyword_1.Keyword.And));
            return this;
        };
        return GivenState;
    })(StateBase);
    var WhenState = (function (_super) {
        __extends(WhenState, _super);
        function WhenState(priorState) {
            _super.call(this, priorState);
        }
        WhenState.prototype.then = function (line) {
            this.thens.push(this.trimLine(line, Keyword_1.Keyword.Then));
            return new ThenState(this);
        };
        WhenState.prototype.and = function (line) {
            this.whens.push(this.trimLine(line, Keyword_1.Keyword.And));
            return this;
        };
        return WhenState;
    })(StateBase);
    var ThenState = (function (_super) {
        __extends(ThenState, _super);
        function ThenState(priorState) {
            _super.call(this, priorState);
        }
        ThenState.prototype.isNewScenario = function (line) {
            return (Keyword_1.Keyword.isScenarioDeclaration(line) || Keyword_1.Keyword.isOutlineDeclaration(line) || Keyword_1.Keyword.isTagDeclaration(line));
        };
        ThenState.prototype.and = function (line) {
            this.thens.push(this.trimLine(line, Keyword_1.Keyword.And));
            return this;
        };
        ThenState.prototype.examples = function (line) {
            return new ExampleState(this);
        };
        return ThenState;
    })(StateBase);
    var ExampleState = (function (_super) {
        __extends(ExampleState, _super);
        function ExampleState(priorState) {
            _super.call(this, priorState);
        }
        ExampleState.prototype.table = function (line) {
            var headings = line.split(Keyword_1.Keyword.Table);
            for (var i = 0; i < headings.length; i++) {
                var trimmedHeading = headings[i].trim();
                this.tableHeaders.push(trimmedHeading);
            }
            return new TableState(this);
        };
        return ExampleState;
    })(StateBase);
    var TableState = (function (_super) {
        __extends(TableState, _super);
        function TableState(priorState) {
            _super.call(this, priorState);
        }
        TableState.prototype.table = function (line) {
            var data = line.split(Keyword_1.Keyword.Table);
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
    })(StateBase);
});
