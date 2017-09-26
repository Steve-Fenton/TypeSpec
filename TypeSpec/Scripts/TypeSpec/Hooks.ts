export interface ITestReporter {
    summary(featureTitle: string, scenarioTitle: string, isSuccess: boolean): void;
    error(featureTitle: string, condition: string, error: Error): void;
    information(message: string): void;
    complete(): void;
}

export interface ITestHooks {
    beforeTestRun(): void;
    beforeFeature(): void;
    beforeScenario(): void;
    beforeCondition(): void;

    afterCondition(): void;
    afterScenario(): void;
    afterFeature(): void;
    afterTestRun(): void;
}

export class TestHooks implements ITestHooks {
    beforeTestRun(): void {
    }

    beforeFeature(): void {
    }

    beforeScenario(): void {
    }

    beforeCondition(): void {
    }

    afterCondition(): void {
    }

    afterScenario(): void {
    }

    afterFeature(): void {
    }

    afterTestRun(): void {
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