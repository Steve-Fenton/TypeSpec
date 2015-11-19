import {TestReporter} from './TypeSpec/TypeSpec';

export class CustomTestReporter extends TestReporter {
    summary(featureTitle: string, scenarioTitle: string, isSuccess: boolean) {
        var div = document.createElement('li');
        div.className = (isSuccess ? 'good' : 'bad');
        div.innerHTML = this.escape((isSuccess ? '✔' : '✘') + ' ' + featureTitle + '. ' + scenarioTitle + '.');
        document.getElementById('results').appendChild(div);
    }

    error(featureTitle: string, condition: string, error: Error) {
        var div = document.createElement('div');
        div.innerHTML = '<h2>' + featureTitle + '</h2><blockquote>' + this.escape(condition) + '</blockquote><pre class="bad">' + this.escape(error.message) + '</pre>';
        document.getElementById('errors').appendChild(div);
    }

    information(message: string) {
        //console.log(message);
    }
}