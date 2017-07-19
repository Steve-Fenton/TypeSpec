import { FeatureParser } from './Parser';
import { FileReaderCallback, FileReader, BrowserFileReader, NodeFileReader } from './FileSystem';
import { StepCollection, StepType } from './Steps';
import { ITestReporter, ITestHooks } from './Keyword';

export class SpecRunner {
    private steps: StepCollection;
    private excludedTags: string[] = [];
    private urls: string[] = [];

    private fileReader: FileReader;

    private expectedFiles = 0;
    private completedFiles = 0;

    constructor(private testReporter: ITestReporter = new TestReporter(), private testHooks: ITestHooks = new TestHooks()) {
        this.steps = new StepCollection(testReporter);
        this.fileReader = FileReader.getInstance(this.testReporter);
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
        this.expectedFiles = url.length;
        this.urls = url;
        this.readFile(0);
    }

    runInRandomOrder(...url: string[]) {
        const specList = new SpecificationList(url);
        this.expectedFiles = url.length;
        this.urls = specList.randomise();
        this.readFile(0);
    }

    excludeTags(...tags: string[]) {
        for(const tag of tags) {
            this.excludedTags.push(tag.replace(/@/g, ''));
        }
    }

    private fileCompleted(index: number) {
        this.completedFiles++;
        if (this.completedFiles === this.expectedFiles) {
            this.testReporter.complete();
        } else {
            this.readFile(index);
        }
    }

    private readFile(index: number) {
        // TODO: Probably need a timeout per file as if the test ran "forever" the overall test would never pass or fail
        if (index < this.urls.length) {
            const nextIndex = index + 1;

            const afterFeatureHandler = () => {
                this.testHooks.afterFeature();
                this.fileCompleted(nextIndex);
            };

            this.fileReader.getFile(this.urls[index], (responseText: string) => {
                this.processSpecification(responseText, afterFeatureHandler);
            });
        }
    }

    private processSpecification(spec: string, afterFeatureHandler: Function) {
        const featureParser = new FeatureParser(this.testReporter, this.testHooks, this.steps, this.excludedTags);
        featureParser.run(spec, afterFeatureHandler);
    }
}

export class SpecificationList {
    constructor(private specifications: string[]) {
    }

    randomise() {
        let orderedSpecs: string[] = [];

        while (this.specifications.length > 0) {
            const index = this.getRandomInt(0, this.specifications.length);
            orderedSpecs.push(this.specifications[index]);
            this.specifications.splice(index, 1);
        }

        return orderedSpecs;
    }

    private getRandomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
}

export class TestHooks implements ITestHooks {
    beforeTestRun(): void {
        console.info('Run Started');
    }

    beforeFeature(): void {
        console.info('|--Feature Started');
    }

    beforeScenario(): void {
        console.info('|--|--Scenario Started');
    }

    beforeCondition(): void {
        console.info('|--|--|--Condition Started');
    }

    afterCondition(): void {
        console.info('|--|--|--Condition Ended');
    }

    afterScenario(): void {
        console.info('|--|--Scenario Ended');
    }

    afterFeature(): void {
        console.info('|--Feature Ended');
    }

    afterTestRun(): void {
        console.info('Run Ended');
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

        for (const result of this.results) {
            console.log(result.output());
        }
    }
}

// Assertions lifted from tsUnit and made static here. Any improvements ought to be passed back to tsUnit too.

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
            let msg = '';

            while (result.length > 0) {
                msg = '[' + result.pop() + ']' + msg;
            }

            return msg;
        }

        var compareArray = (expected: any[], actual: any[], result: number[]): void => {
            let indexString = '';

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
        let actual: () => void;

        if (typeof a === 'function') {
            actual = a;
        } else if (a.fn) {
            actual = a.fn;
            message = a.message;
            errorString = a.exceptionString;
        }

        let isThrown = false;

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

        const startOfExecution = getTime();

        try {
            actual();
        } catch (ex) {
            throw this.getError('isExecuteTimeLessThanLimit fails when given code throws an exception: "' + ex + '"', message);
        }

        const executingTime = getTime() - startOfExecution;

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
        const funcNameRegex = /function (.{1,})\(/;
        const results = (funcNameRegex).exec((<any>inputClass).constructor.toString());
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