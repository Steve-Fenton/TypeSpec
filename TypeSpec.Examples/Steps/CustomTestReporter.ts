import { TestReporter } from '../node_modules/typespec-bdd/src/TypeSpec';

export class CustomTestReporter extends TestReporter {
    summary(featureTitle: string, scenarioTitle: string, isSuccess: boolean) {
        const div = document.createElement('li');
        div.className = (isSuccess ? 'good' : 'bad');
        div.innerHTML = this.escape((isSuccess ? '✔' : '✘') + ' ' + featureTitle + '. ' + scenarioTitle + '.');
        const element = document.getElementById('results');
        if (element) {
            element.appendChild(div);
        }
    }

    error(featureTitle: string, condition: string, error: Error) {
        const div = document.createElement('div');
        div.innerHTML = '<h2>' + featureTitle + '</h2><blockquote>' + this.escape(condition) + '</blockquote><pre class="bad">' + this.escape(error.message) + '</pre>';
        const element = document.getElementById('errors');
        if (element) {
            element.appendChild(div);
        }
        console.error(error);
    }

    information(message: string) {
        // Uncoment to see very detailed output
        //console.log(message);
    }
}