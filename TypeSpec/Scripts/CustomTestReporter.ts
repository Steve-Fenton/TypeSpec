import {TestReporter, TestHooks} from './TypeSpec/TypeSpec';

export class CustomTestReporter extends TestReporter {
    private testCount = 0;
    private passedCount = 0;

    summary(featureTitle: string, scenarioTitle: string, isSuccess: boolean) {
        this.testCount++;
        if (isSuccess) {
            this.passedCount++;
        }

        let div = document.createElement('li');
        div.className = (isSuccess ? 'good' : 'bad');
        div.innerHTML = this.escape((isSuccess ? '✔' : '✘') + ' ' + featureTitle + '. ' + scenarioTitle + '.');
        document.getElementById('results').appendChild(div);
    }

    error(featureTitle: string, condition: string, error: Error) {
        let div = document.createElement('div');
        div.innerHTML = '<h2>' + featureTitle + '</h2><blockquote>' + this.escape(condition) + '</blockquote><pre class="bad">' + this.escape(error.message) + '</pre>';
        document.getElementById('errors').appendChild(div);
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

}