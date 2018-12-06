import { FeatureParser } from './Parser';
import { FileReader } from './FileSystem';
import { StepCollection, StepType } from './Steps';
import { ITestReporter, ITestHooks, TestReporter, TestHooks } from './Hooks';

export interface Runner {
    run(...url: string[]): Promise<{}>;
    runInRandomOrder(...url: string[]): Promise<{}>;
    excludeTags(...tags: string[]): void;
    testReporter: ITestReporter;
    testHooks: ITestHooks;
    timeLimitMS: number
}

export enum Kind {
    Sync,
    Async
}

export class SpecRunner implements Runner {
    public timeLimitMS = 30000;

    private steps: StepCollection;
    private excludedTags: string[] = [];
    private urls: string[] = [];

    private fileReader: FileReader;

    private expectedFiles = 0;
    private completedFiles = 0;

    private runCompleted: Function = () => {};

    constructor(public testReporter: ITestReporter = new TestReporter(), public testHooks: ITestHooks = new TestHooks()) {
        this.steps = new StepCollection();
        this.fileReader = FileReader.getInstance(this.testReporter);
    }

    addStep(expression: RegExp, step: Function, kind: Kind = Kind.Sync) {
        this.steps.add(expression, step, (kind == Kind.Async));
    }

    addStepAsync(expression: RegExp, step: Function) {
        this.steps.add(expression, step, true);
    }

    given(expression: RegExp, step: Function, kind: Kind = Kind.Sync) {
        this.steps.add(expression, step, (kind == Kind.Async), StepType.Given);
    }

    givenAsync(expression: RegExp, step: Function) {
        this.steps.add(expression, step, true, StepType.Given);
    }

    when(expression: RegExp, step: Function, kind: Kind = Kind.Sync) {
        this.steps.add(expression, step, (kind == Kind.Async), StepType.When);
    }

    whenAsync(expression: RegExp, step: Function) {
        this.steps.add(expression, step, true, StepType.When);
    }

    then(expression: RegExp, step: Function, kind: Kind = Kind.Sync) {
        this.steps.add(expression, step, (kind == Kind.Async), StepType.Then);
    }

    thenAsync(expression: RegExp, step: Function) {
        this.steps.add(expression, step, true, StepType.Then);
    }

    run(...url: string[]) {
        this.expectedFiles = url.length;
        this.urls = url;
        this.readFile(0);

        return new Promise((resolve: () => void, reject: () => void) => {
            this.runCompleted = resolve;
        });
    }

    runInRandomOrder(...url: string[]) {
        const specList = new SpecificationList(url);
        this.expectedFiles = url.length;
        this.urls = specList.randomise();
        this.readFile(0);

        return new Promise((resolve: () => void, reject: () => void) => {
            this.runCompleted = resolve;
        });
    }

    excludeTags(...tags: string[]) {
        for (const tag of tags) {
            this.excludedTags.push(tag.replace(/@/g, ''));
        }
    }

    private fileCompleted(index: number) {
        this.completedFiles++;
        if (this.completedFiles === this.expectedFiles) {
            this.testReporter.complete();
            this.runCompleted();
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