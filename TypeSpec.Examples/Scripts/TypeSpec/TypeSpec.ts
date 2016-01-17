import {FeatureParser} from './Parser';
import {StepCollection, StepType} from './Steps';
import {ITestReporter} from './Keyword';

declare var require: any;

export class SpecRunner {
    private steps: StepCollection;
    private excludedTags: string[] = [];
    private hasWindow = (typeof window !== 'undefined');

    private fileCount = 0;

    constructor(private testReporter: ITestReporter = new TestReporter()) {
        this.steps = new StepCollection(testReporter);
    }

    addStep(expression: RegExp, step: Function) {
        this.steps.add(expression, step, false);
    }

    addStepAsync(expression: RegExp, step: Function) {
        this.steps.add(expression, step, true);
    }

    given(expression: RegExp, step: Function) {
        this.steps.add(expression, step, false, StepType.Given);
    }

    givenAsync(expression: RegExp, step: Function) {
        this.steps.add(expression, step, true, StepType.Given);
    }

    when(expression: RegExp, step: Function) {
        this.steps.add(expression, step, false, StepType.When);
    }

    whenAsync(expression: RegExp, step: Function) {
        this.steps.add(expression, step, true, StepType.When);
    }

    then(expression: RegExp, step: Function) {
        this.steps.add(expression, step, false, StepType.Then);
    }

    thenAsync(expression: RegExp, step: Function) {
        this.steps.add(expression, step, true, StepType.Then);
    }

    run(...url: string[]) {
        this.fileCount = url.length;
        this.readFile(0, url);
    }

    runInRandomOrder(...url: string[]) {
        this.fileCount = url.length;
        var specList = new SpecificationList(url);
        this.readFile(0, specList.randomise());
    }

    excludeTags(...tags: string[]) {
        for (var i = 0; i < tags.length; i++) {
            this.excludedTags.push(tags[i].replace(/@/g, ''));
        }
    }

    private readFile(index: number, urls: string[]) {
        var cacheBust = '?cb=' + new Date().getTime();
        if (index < urls.length) {
            var nextIndex = index + 1;

            var finalCallback = () => { };
            //if (nextIndex === urls.length) {
            //    finalCallback = () => { this.testReporter.complete(); };
            //}

            var completedFiles = 0;
            var fileComplete = () => {
                completedFiles++;
                if (completedFiles === urls.length) {
                    this.testReporter.complete();
                    alert('done');
                }
            };

            if (this.hasWindow) {
                this.getFile(urls[index], cacheBust, () => { this.readFile(nextIndex, urls); }, finalCallback, fileComplete);
            } else {
                this.getNodeFile(urls[index], cacheBust, () => { this.readFile(nextIndex, urls); }, finalCallback, fileComplete);
            }
        }
    }

    private getFile(url: string, cacheBust: string, successCallback: Function, allCallback: Function, fileComplete: Function) {
        var client = new XMLHttpRequest();
        client.open('GET', url + cacheBust);
        client.onreadystatechange = () => {
            if (client.readyState === 4) {
                try {
                    if (client.status === 200) {
                        this.processSpecification(client.responseText, fileComplete);
                        successCallback();
                    } else {
                        this.testReporter.error('getFile', url, new Error('Error loading specification: ' + client.statusText + ' (' + client.status + ').'));
                    }
                } finally {
                    allCallback();
                }
            }
        }
        client.send();
    }

    private getNodeFile(url: string, cacheBust: string, successCallback: Function, allCallback: Function, fileComplete: Function) {
        var fs: any = require('fs');
        var path: any = require('path');

        // Make the path relative in Node's terms and resolve it
        var resolvedUrl = path.resolve('.' + url);

        fs.readFile(resolvedUrl, 'utf8', (err: any, data: string) => {
            if (err) {
                this.testReporter.error('getNodeFile', url, new Error('Error loading specification: ' + err + ').'));
                allCallback();
            }
            this.processSpecification(data, fileComplete);
            successCallback();
            allCallback();
        });
    }

    private processSpecification(spec: string, fileComplete: Function) {
        var hasParsed = true;
        var composer = new FeatureParser(this.steps, this.testReporter, this.excludedTags);

        /* Normalise line endings before splitting */
        var lines = spec.replace('\r\n', '\n').split('\n');

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];

            try {
                composer.process(line);
            } catch (ex) {
                hasParsed = false;
                var state = composer.state[0] || { featureTitle: 'Unknown' };
                this.testReporter.error(state.featureTitle, line, ex);
            }
        }

        if (hasParsed) {
            composer.run(fileComplete);
        }
    }
}

export class SpecificationList {
    constructor(private specifications: string[]) {
    }

    randomise() {
        var orderedSpecs: string[] = [];

        while (this.specifications.length > 0) {
            var index = this.getRandomInt(0, this.specifications.length);
            orderedSpecs.push(this.specifications[index]);
            this.specifications.splice(index, 1);
        }

        return orderedSpecs;
    }

    private getRandomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
}

export class TestReporter implements ITestReporter {
    summary(featureTitle: string, scenarioTitle: string, isSuccess: boolean) {
        console.info((isSuccess ? '✔' : '✘') + ' ' + featureTitle + ' : ' + scenarioTitle + '\n');
    }

    error(featureTitle: string, condition: string, error: Error) {
        console.error(featureTitle + '\n\n' + condition + '\n\n' + error);
    }

    information(message: string) {
        console.log(message);
    }

    complete() {
        console.log('Run has finished');
    }

    protected escape(input: string) {
        return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
}

class TapResult {
    constructor(public hash: number, public isOk: boolean, public description: string) { }

    output() {
        return (this.isOk ? '' : 'not ') + 'ok ' + this.hash + ' ' + this.description
    }
}

export class TapReporter implements ITestReporter {
    private hash: number = 0;
    private results: TapResult[] = [];

    summary(featureTitle: string, scenarioTitle: string, isSuccess: boolean) {
        this.hash++;
        this.results.push(new TapResult(this.hash, isSuccess, featureTitle + ': ' + scenarioTitle));
    }

    error(featureTitle: string, condition: string, error: Error) {
    }

    information(message: string) {
    }

    complete() {
        console.log('1..' + this.results.length);
        for (var i = 0; i < this.results.length; i++) {
            console.log(this.results[i].output());
        }
    }
}

// Assertions lifted from tsUnit and made static here.

export interface IThrowsParameters {
    fn: () => void;
    message?: string;
    errorString?: string;
}

export class Assert {
    public static areIdentical(expected: any, actual: any, message = ''): void {
        if (expected !== actual) {
            throw this.getError('areIdentical failed when given ' +
                this.printVariable(expected) + ' and ' + this.printVariable(actual),
                message);
        }
    }

    public static areNotIdentical(expected: any, actual: any, message = ''): void {
        if (expected === actual) {
            throw this.getError('areNotIdentical failed when given ' +
                this.printVariable(expected) + ' and ' + this.printVariable(actual),
                message);
        }
    }

    public static areCollectionsIdentical(expected: any[], actual: any[], message = ''): void {
        function resultToString(result: number[]): string {
            var msg = '';

            while (result.length > 0) {
                msg = '[' + result.pop() + ']' + msg;
            }

            return msg;
        }

        var compareArray = (expected: any[], actual: any[], result: number[]): void => {
            var indexString = '';

            if (expected === null) {
                if (actual !== null) {
                    indexString = resultToString(result);
                    throw this.getError('areCollectionsIdentical failed when array a' +
                        indexString + ' is null and b' +
                        indexString + ' is not null',
                        message);
                }

                return; // correct: both are nulls
            } else if (actual === null) {
                indexString = resultToString(result);
                throw this.getError('areCollectionsIdentical failed when array a' +
                    indexString + ' is not null and b' +
                    indexString + ' is null',
                    message);
            }

            if (expected.length !== actual.length) {
                indexString = resultToString(result);
                throw this.getError('areCollectionsIdentical failed when length of array a' +
                    indexString + ' (length: ' + expected.length + ') is different of length of array b' +
                    indexString + ' (length: ' + actual.length + ')',
                    message);
            }

            for (var i = 0; i < expected.length; i++) {
                if ((expected[i] instanceof Array) && (actual[i] instanceof Array)) {
                    result.push(i);
                    compareArray(expected[i], actual[i], result);
                    result.pop();
                } else if (expected[i] !== actual[i]) {
                    result.push(i);
                    indexString = resultToString(result);
                    throw this.getError('areCollectionsIdentical failed when element a' +
                        indexString + ' (' + this.printVariable(expected[i]) + ') is different than element b' +
                        indexString + ' (' + this.printVariable(actual[i]) + ')',
                        message);
                }
            }

            return;
        }

        compareArray(expected, actual, []);
    }

    public static areCollectionsNotIdentical(expected: any[], actual: any[], message = ''): void {
        try {
            this.areCollectionsIdentical(expected, actual);
        } catch (ex) {
            return;
        }

        throw this.getError('areCollectionsNotIdentical failed when both collections are identical', message);
    }

    public static isTrue(actual: boolean, message = '') {
        if (!actual) {
            throw this.getError('isTrue failed when given ' + this.printVariable(actual), message);
        }
    }

    public static isFalse(actual: boolean, message = '') {
        if (actual) {
            throw this.getError('isFalse failed when given ' + this.printVariable(actual), message);
        }
    }

    public static isTruthy(actual: any, message = '') {
        if (!actual) {
            throw this.getError('isTrue failed when given ' + this.printVariable(actual), message);
        }
    }

    public static isFalsey(actual: any, message = '') {
        if (actual) {
            throw this.getError('isFalse failed when given ' + this.printVariable(actual), message);
        }
    }

    public static isString(actual: any, message = '') {
        if (typeof actual !== 'string') {
            throw this.getError('isString failed when given ' + this.printVariable(actual), message);
        }
    }

    public static isNumber(actual: any, message = '') {
        if (typeof actual !== 'number') {
            throw this.getError('isNumber failed when given ' + this.printVariable(actual), message);
        }
    }

    public static isBoolean(actual: any, message = '') {
        if (typeof actual !== 'boolean') {
            throw this.getError('isBoolean failed when given ' + this.printVariable(actual), message);
        }
    }

    public static throws(params: IThrowsParameters): void;
    public static throws(actual: () => void, message?: string): void;
    public static throws(a: any, message = '', errorString = '') {
        var actual: () => void;

        if (typeof a === 'function') {
            actual = a;
        } else if (a.fn) {
            actual = a.fn;
            message = a.message;
            errorString = a.exceptionString;
        }

        var isThrown = false;
        try {
            actual();
        } catch (ex) {
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
    }

    public static doesNotThrow(actual: () => void, message?: string): void {
        try {
            actual();
        } catch (ex) {
            throw this.getError('threw an error ' + ex, message || '');
        }
    }

    public static executesWithin(actual: () => void, timeLimit: number, message: string = null): void {
        function getTime() {
            return window.performance.now();
        }

        function timeToString(value: number) {
            return Math.round(value * 100) / 100;
        }

        var startOfExecution = getTime();

        try {
            actual();
        } catch (ex) {
            throw this.getError('isExecuteTimeLessThanLimit fails when given code throws an exception: "' + ex + '"', message);
        }

        var executingTime = getTime() - startOfExecution;
        if (executingTime > timeLimit) {
            throw this.getError('isExecuteTimeLessThanLimit fails when execution time of given code (' + timeToString(executingTime) + ' ms) ' +
                'exceed the given limit(' + timeToString(timeLimit) + ' ms)',
                message);
        }
    }

    public static fail(message = '') {
        throw this.getError('fail', message);
    }

    private static getError(resultMessage: string, message: string = '') {
        if (message) {
            return new Error(resultMessage + '. ' + message);
        }

        return new Error(resultMessage);
    }

    private static getNameOfClass(inputClass: {}) {
        // see: https://www.stevefenton.co.uk/Content/Blog/Date/201304/Blog/Obtaining-A-Class-Name-At-Runtime-In-TypeScript/
        var funcNameRegex = /function (.{1,})\(/;
        var results = (funcNameRegex).exec((<any>inputClass).constructor.toString());
        return (results && results.length > 1) ? results[1] : '';
    }

    private static printVariable(variable: any) {
        if (variable === null) {
            return '"null"';
        }

        if (typeof variable === 'object') {
            return '{object: ' + Assert.getNameOfClass(variable) + '}';
        }

        return '{' + (typeof variable) + '} "' + variable + '"';
    }
}