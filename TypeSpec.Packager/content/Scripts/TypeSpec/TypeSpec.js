(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Parser", "./FileSystem", "./Steps"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Parser_1 = require("./Parser");
    var FileSystem_1 = require("./FileSystem");
    var Steps_1 = require("./Steps");
    var SpecRunner = (function () {
        function SpecRunner(testReporter, testHooks) {
            if (testReporter === void 0) { testReporter = new TestReporter(); }
            if (testHooks === void 0) { testHooks = new TestHooks(); }
            this.testReporter = testReporter;
            this.testHooks = testHooks;
            this.excludedTags = [];
            this.urls = [];
            this.expectedFiles = 0;
            this.completedFiles = 0;
            this.steps = new Steps_1.StepCollection(testReporter);
            this.fileReader = FileSystem_1.FileReader.getInstance(this.testReporter);
        }
        SpecRunner.prototype.addStep = function (expression, step) {
            this.steps.add(expression, step, false);
        };
        SpecRunner.prototype.addStepAsync = function (expression, step) {
            this.steps.add(expression, step, true);
        };
        SpecRunner.prototype.given = function (expression, step) {
            this.steps.add(expression, step, false, Steps_1.StepType.Given);
        };
        SpecRunner.prototype.givenAsync = function (expression, step) {
            this.steps.add(expression, step, true, Steps_1.StepType.Given);
        };
        SpecRunner.prototype.when = function (expression, step) {
            this.steps.add(expression, step, false, Steps_1.StepType.When);
        };
        SpecRunner.prototype.whenAsync = function (expression, step) {
            this.steps.add(expression, step, true, Steps_1.StepType.When);
        };
        SpecRunner.prototype.then = function (expression, step) {
            this.steps.add(expression, step, false, Steps_1.StepType.Then);
        };
        SpecRunner.prototype.thenAsync = function (expression, step) {
            this.steps.add(expression, step, true, Steps_1.StepType.Then);
        };
        SpecRunner.prototype.run = function () {
            var url = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                url[_i] = arguments[_i];
            }
            this.expectedFiles = url.length;
            this.urls = url;
            this.readFile(0);
        };
        SpecRunner.prototype.runInRandomOrder = function () {
            var url = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                url[_i] = arguments[_i];
            }
            var specList = new SpecificationList(url);
            this.expectedFiles = url.length;
            this.urls = specList.randomise();
            this.readFile(0);
        };
        SpecRunner.prototype.excludeTags = function () {
            var tags = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                tags[_i] = arguments[_i];
            }
            for (var _a = 0, tags_1 = tags; _a < tags_1.length; _a++) {
                var tag = tags_1[_a];
                this.excludedTags.push(tag.replace(/@/g, ''));
            }
        };
        SpecRunner.prototype.fileCompleted = function (index) {
            this.completedFiles++;
            if (this.completedFiles === this.expectedFiles) {
                this.testReporter.complete();
            }
            else {
                this.readFile(index);
            }
        };
        SpecRunner.prototype.readFile = function (index) {
            var _this = this;
            // TODO: Probably need a timeout per file as if the test ran "forever" the overall test would never pass or fail
            if (index < this.urls.length) {
                var nextIndex_1 = index + 1;
                var afterFeatureHandler_1 = function () {
                    _this.testHooks.afterFeature();
                    _this.fileCompleted(nextIndex_1);
                };
                this.fileReader.getFile(this.urls[index], function (responseText) {
                    _this.processSpecification(responseText, afterFeatureHandler_1);
                });
            }
        };
        SpecRunner.prototype.processSpecification = function (spec, afterFeatureHandler) {
            var featureParser = new Parser_1.FeatureParser(this.testReporter, this.testHooks, this.steps, this.excludedTags);
            featureParser.run(spec, afterFeatureHandler);
        };
        return SpecRunner;
    }());
    exports.SpecRunner = SpecRunner;
    var SpecificationList = (function () {
        function SpecificationList(specifications) {
            this.specifications = specifications;
        }
        SpecificationList.prototype.randomise = function () {
            var orderedSpecs = [];
            while (this.specifications.length > 0) {
                var index = this.getRandomInt(0, this.specifications.length);
                orderedSpecs.push(this.specifications[index]);
                this.specifications.splice(index, 1);
            }
            return orderedSpecs;
        };
        SpecificationList.prototype.getRandomInt = function (min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        };
        return SpecificationList;
    }());
    exports.SpecificationList = SpecificationList;
    var TestHooks = (function () {
        function TestHooks() {
        }
        TestHooks.prototype.beforeTestRun = function () {
        };
        TestHooks.prototype.beforeFeature = function () {
        };
        TestHooks.prototype.beforeScenario = function () {
        };
        TestHooks.prototype.beforeCondition = function () {
        };
        TestHooks.prototype.afterCondition = function () {
        };
        TestHooks.prototype.afterScenario = function () {
        };
        TestHooks.prototype.afterFeature = function () {
        };
        TestHooks.prototype.afterTestRun = function () {
        };
        return TestHooks;
    }());
    exports.TestHooks = TestHooks;
    var TestReporter = (function () {
        function TestReporter() {
        }
        TestReporter.prototype.summary = function (featureTitle, scenarioTitle, isSuccess) {
            console.info((isSuccess ? '✔' : '✘') + ' ' + featureTitle + ' : ' + scenarioTitle + '\n');
        };
        TestReporter.prototype.error = function (featureTitle, condition, error) {
            console.error(featureTitle + '\n\n' + condition + '\n\n' + error);
        };
        TestReporter.prototype.information = function (message) {
            console.log(message);
        };
        TestReporter.prototype.complete = function () {
            console.log('Run has finished');
        };
        TestReporter.prototype.escape = function (input) {
            return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        };
        return TestReporter;
    }());
    exports.TestReporter = TestReporter;
    var TapResult = (function () {
        function TapResult(hash, isOk, description) {
            this.hash = hash;
            this.isOk = isOk;
            this.description = description;
        }
        TapResult.prototype.output = function () {
            return (this.isOk ? '' : 'not ') + 'ok ' + this.hash + ' ' + this.description;
        };
        return TapResult;
    }());
    var TapReporter = (function () {
        function TapReporter() {
            this.hash = 0;
            this.results = [];
        }
        TapReporter.prototype.summary = function (featureTitle, scenarioTitle, isSuccess) {
            this.hash++;
            this.results.push(new TapResult(this.hash, isSuccess, featureTitle + ': ' + scenarioTitle));
        };
        TapReporter.prototype.error = function (featureTitle, condition, error) {
        };
        TapReporter.prototype.information = function (message) {
        };
        TapReporter.prototype.complete = function () {
            console.log('1..' + this.results.length);
            for (var _i = 0, _a = this.results; _i < _a.length; _i++) {
                var result = _a[_i];
                console.log(result.output());
            }
        };
        return TapReporter;
    }());
    exports.TapReporter = TapReporter;
    var Assert = (function () {
        function Assert() {
        }
        Assert.areIdentical = function (expected, actual, message) {
            if (message === void 0) { message = ''; }
            if (expected !== actual) {
                throw this.getError('areIdentical failed when given ' +
                    this.printVariable(expected) + ' and ' + this.printVariable(actual), message);
            }
        };
        Assert.areNotIdentical = function (expected, actual, message) {
            if (message === void 0) { message = ''; }
            if (expected === actual) {
                throw this.getError('areNotIdentical failed when given ' +
                    this.printVariable(expected) + ' and ' + this.printVariable(actual), message);
            }
        };
        Assert.areCollectionsIdentical = function (expected, actual, message) {
            var _this = this;
            if (message === void 0) { message = ''; }
            function resultToString(result) {
                var msg = '';
                while (result.length > 0) {
                    msg = '[' + result.pop() + ']' + msg;
                }
                return msg;
            }
            var compareArray = function (expected, actual, result) {
                var indexString = '';
                if (expected === null) {
                    if (actual !== null) {
                        indexString = resultToString(result);
                        throw _this.getError('areCollectionsIdentical failed when array a' +
                            indexString + ' is null and b' +
                            indexString + ' is not null', message);
                    }
                    return; // correct: both are nulls
                }
                else if (actual === null) {
                    indexString = resultToString(result);
                    throw _this.getError('areCollectionsIdentical failed when array a' +
                        indexString + ' is not null and b' +
                        indexString + ' is null', message);
                }
                if (expected.length !== actual.length) {
                    indexString = resultToString(result);
                    throw _this.getError('areCollectionsIdentical failed when length of array a' +
                        indexString + ' (length: ' + expected.length + ') is different of length of array b' +
                        indexString + ' (length: ' + actual.length + ')', message);
                }
                for (var i = 0; i < expected.length; i++) {
                    if ((expected[i] instanceof Array) && (actual[i] instanceof Array)) {
                        result.push(i);
                        compareArray(expected[i], actual[i], result);
                        result.pop();
                    }
                    else if (expected[i] !== actual[i]) {
                        result.push(i);
                        indexString = resultToString(result);
                        throw _this.getError('areCollectionsIdentical failed when element a' +
                            indexString + ' (' + _this.printVariable(expected[i]) + ') is different than element b' +
                            indexString + ' (' + _this.printVariable(actual[i]) + ')', message);
                    }
                }
                return;
            };
            compareArray(expected, actual, []);
        };
        Assert.areCollectionsNotIdentical = function (expected, actual, message) {
            if (message === void 0) { message = ''; }
            try {
                this.areCollectionsIdentical(expected, actual);
            }
            catch (ex) {
                return;
            }
            throw this.getError('areCollectionsNotIdentical failed when both collections are identical', message);
        };
        Assert.isTrue = function (actual, message) {
            if (message === void 0) { message = ''; }
            if (!actual) {
                throw this.getError('isTrue failed when given ' + this.printVariable(actual), message);
            }
        };
        Assert.isFalse = function (actual, message) {
            if (message === void 0) { message = ''; }
            if (actual) {
                throw this.getError('isFalse failed when given ' + this.printVariable(actual), message);
            }
        };
        Assert.isTruthy = function (actual, message) {
            if (message === void 0) { message = ''; }
            if (!actual) {
                throw this.getError('isTrue failed when given ' + this.printVariable(actual), message);
            }
        };
        Assert.isFalsey = function (actual, message) {
            if (message === void 0) { message = ''; }
            if (actual) {
                throw this.getError('isFalse failed when given ' + this.printVariable(actual), message);
            }
        };
        Assert.isString = function (actual, message) {
            if (message === void 0) { message = ''; }
            if (typeof actual !== 'string') {
                throw this.getError('isString failed when given ' + this.printVariable(actual), message);
            }
        };
        Assert.isNumber = function (actual, message) {
            if (message === void 0) { message = ''; }
            if (typeof actual !== 'number') {
                throw this.getError('isNumber failed when given ' + this.printVariable(actual), message);
            }
        };
        Assert.isBoolean = function (actual, message) {
            if (message === void 0) { message = ''; }
            if (typeof actual !== 'boolean') {
                throw this.getError('isBoolean failed when given ' + this.printVariable(actual), message);
            }
        };
        Assert.throws = function (a, message, errorString) {
            if (message === void 0) { message = ''; }
            if (errorString === void 0) { errorString = ''; }
            var actual;
            if (typeof a === 'function') {
                actual = a;
            }
            else if (a.fn) {
                actual = a.fn;
                message = a.message;
                errorString = a.exceptionString;
            }
            var isThrown = false;
            try {
                actual();
            }
            catch (ex) {
                if (!errorString || ex.message === errorString) {
                    isThrown = true;
                }
                if (errorString && ex.message !== errorString) {
                    throw this.getError('different error string than supplied');
                }
            }
            if (!isThrown) {
                throw this.getError('did not throw an error', message || '');
            }
        };
        Assert.doesNotThrow = function (actual, message) {
            try {
                actual();
            }
            catch (ex) {
                throw this.getError('threw an error ' + ex, message || '');
            }
        };
        Assert.executesWithin = function (actual, timeLimit, message) {
            if (message === void 0) { message = null; }
            function getTime() {
                return window.performance.now();
            }
            function timeToString(value) {
                return Math.round(value * 100) / 100;
            }
            var startOfExecution = getTime();
            try {
                actual();
            }
            catch (ex) {
                throw this.getError('isExecuteTimeLessThanLimit fails when given code throws an exception: "' + ex + '"', message);
            }
            var executingTime = getTime() - startOfExecution;
            if (executingTime > timeLimit) {
                throw this.getError('isExecuteTimeLessThanLimit fails when execution time of given code (' + timeToString(executingTime) + ' ms) ' +
                    'exceed the given limit(' + timeToString(timeLimit) + ' ms)', message);
            }
        };
        Assert.fail = function (message) {
            if (message === void 0) { message = ''; }
            throw this.getError('fail', message);
        };
        Assert.getError = function (resultMessage, message) {
            if (message === void 0) { message = ''; }
            if (message) {
                return new Error(resultMessage + '. ' + message);
            }
            return new Error(resultMessage);
        };
        Assert.getNameOfClass = function (inputClass) {
            // see: https://www.stevefenton.co.uk/Content/Blog/Date/201304/Blog/Obtaining-A-Class-Name-At-Runtime-In-TypeScript/
            var funcNameRegex = /function (.{1,})\(/;
            var results = (funcNameRegex).exec(inputClass.constructor.toString());
            return (results && results.length > 1) ? results[1] : '';
        };
        Assert.printVariable = function (variable) {
            if (variable === null) {
                return '"null"';
            }
            if (typeof variable === 'object') {
                return '{object: ' + Assert.getNameOfClass(variable) + '}';
            }
            return '{' + (typeof variable) + '} "' + variable + '"';
        };
        return Assert;
    }());
    exports.Assert = Assert;
});
//# sourceMappingURL=TypeSpec.js.map