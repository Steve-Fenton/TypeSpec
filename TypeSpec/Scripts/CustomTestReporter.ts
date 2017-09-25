import {TestReporter, TestHooks} from './TypeSpec/TypeSpec';

export class CustomTestReporter extends TestReporter {
    private testCount = 0;
    private passedCount = 0;

    summary(featureTitle: string, scenarioTitle: string, isSuccess: boolean) {
        this.testCount++;
        if (isSuccess) {
            this.passedCount++;
        }
        
        const div = document.createElement('li');
        div.className = (isSuccess ? 'good' : 'bad');
        div.innerHTML = this.escape((isSuccess ? '✔' : '✘') + ' ' + featureTitle + '. ' + scenarioTitle + '.');

        const resultsContainer = document.getElementById('results');
        if (resultsContainer) {
            resultsContainer.appendChild(div);
        }
    }

    error(featureTitle: string, condition: string, error: Error) {
        const div = document.createElement('div');
        div.innerHTML = '<h2>' + featureTitle + '</h2><blockquote>' + this.escape(condition) + '</blockquote><pre class="bad">' + this.escape(error.message) + '</pre>';

        const errorsContainer = document.getElementById('errors');
        if (errorsContainer) {
            errorsContainer.appendChild(div);
        }
    }

    information(message: string) {
        // Uncoment to see very detailed output
        // console.log(message);
    }

    complete() {
        let title = (this.passedCount === this.testCount) ? 'Passed' : 'Failed';
        document.title = title + ' (' + this.passedCount + '/' + this.testCount + ' Passed)';
    }
}

export class CustomTestHooks extends TestHooks {
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