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
        define(["require", "exports", "./Parser", "./Steps"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Parser_1 = require("./Parser");
    var Steps_1 = require("./Steps");
    var SpecRunner = (function () {
        function SpecRunner(testReporter) {
            if (testReporter === void 0) { testReporter = new TestReporter(); }
            this.testReporter = testReporter;
            this.excludedTags = [];
            this.expectedFiles = 0;
            this.completedFiles = 0;
            this.steps = new Steps_1.StepCollection(testReporter);
            this.fileReader = FileReader.getInstance(this.testReporter);
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
            this.readFile(0, url);
        };
        SpecRunner.prototype.runInRandomOrder = function () {
            var url = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                url[_i] = arguments[_i];
            }
            this.expectedFiles = url.length;
            var specList = new SpecificationList(url);
            this.readFile(0, specList.randomise());
        };
        SpecRunner.prototype.excludeTags = function () {
            var tags = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                tags[_i] = arguments[_i];
            }
            for (var i = 0; i < tags.length; i++) {
                this.excludedTags.push(tags[i].replace(/@/g, ''));
            }
        };
        SpecRunner.prototype.fileCompleted = function () {
            this.completedFiles++;
            if (this.completedFiles === this.expectedFiles) {
                this.testReporter.complete();
            }
        };
        SpecRunner.prototype.readFile = function (index, urls) {
            var _this = this;
            if (index < urls.length) {
                var nextIndex = index + 1;
                this.fileReader.getFile(urls[index], function (responseText) {
                    _this.processSpecification(responseText, function () { return _this.fileCompleted(); });
                    _this.readFile(nextIndex, urls);
                });
            }
        };
        SpecRunner.prototype.processSpecification = function (spec, fileComplete) {
            var hasParsed = true;
            var composer = new Parser_1.FeatureParser(this.steps, this.testReporter, this.excludedTags);
            /* Normalise line endings before splitting */
            var lines = spec.replace('\r\n', '\n').split('\n');
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                try {
                    composer.process(line);
                }
                catch (ex) {
                    hasParsed = false;
                    var state = composer.scenarios[0] || { featureTitle: 'Unknown' };
                    this.testReporter.error(state.featureTitle, line, ex);
                }
            }
            if (hasParsed) {
                composer.runFeature(fileComplete);
            }
            else {
                fileComplete();
            }
        };
        return SpecRunner;
    }());
    exports.SpecRunner = SpecRunner;
    var FileReader = (function () {
        function FileReader() {
        }
        FileReader.getInstance = function (testReporter) {
            if (typeof window !== 'undefined') {
                return new BrowserFileReader(testReporter);
            }
            return new NodeFileReader(testReporter);
        };
        return FileReader;
    }());
    var BrowserFileReader = (function (_super) {
        __extends(BrowserFileReader, _super);
        function BrowserFileReader(testReporter) {
            var _this = _super.call(this) || this;
            _this.testReporter = testReporter;
            return _this;
        }
        BrowserFileReader.prototype.getFile = function (url, successCallback) {
            var _this = this;
            var cacheBust = '?cb=' + new Date().getTime();
            var client = new XMLHttpRequest();
            client.open('GET', url + cacheBust);
            client.onreadystatechange = function () {
                if (client.readyState === 4) {
                    if (client.status === 200) {
                        successCallback(client.responseText);
                    }
                    else {
                        _this.testReporter.error('getFile', url, new Error('Error loading specification: ' + client.statusText + ' (' + client.status + ').'));
                    }
                }
            };
            client.send();
        };
        return BrowserFileReader;
    }(FileReader));
    var NodeFileReader = (function (_super) {
        __extends(NodeFileReader, _super);
        function NodeFileReader(testReporter) {
            var _this = _super.call(this) || this;
            _this.testReporter = testReporter;
            return _this;
        }
        NodeFileReader.prototype.getFile = function (url, successCallback) {
            var _this = this;
            var fs = require('fs');
            var path = require('path');
            // Make the path relative in Node's terms and resolve it
            var resolvedUrl = path.resolve('.' + url);
            fs.readFile(resolvedUrl, 'utf8', function (err, data) {
                if (err) {
                    _this.testReporter.error('getNodeFile', url, new Error('Error loading specification: ' + err + ').'));
                }
                successCallback(data);
            });
        };
        return NodeFileReader;
    }(FileReader));
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
            for (var i = 0; i < this.results.length; i++) {
                console.log(this.results[i].output());
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