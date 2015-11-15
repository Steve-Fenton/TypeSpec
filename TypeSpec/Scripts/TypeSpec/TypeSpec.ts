import {Keyword} from './Keyword';
import {ScenarioComposer} from './ScenarioState';
import {StepDefinition, StepExecution, StepDefinitions} from './Steps';

//TODO: handle multiple scenarios within the same file

export class SpecRunner {
    private steps: StepDefinitions = new StepDefinitions();

    constructor(private testReporter = new TestReporter()) {

    }

    addStep(expression: RegExp, step: Function) {
        this.steps.add(expression, step);
    }

    run(...url: string[]) {
        this.readFile(0, url);
    }

    private readFile(index: number, url: string[]) {
        // TODO: detect local file path and use node js to read file
        // This is the default for browser-based tests...
        var cacheBust = '?cb=' + new Date().getTime();
        if (index < url.length) {
            var nextIndex = index + 1;
            this.getFile(url[index], cacheBust, () => { this.readFile(nextIndex, url); });
        }

    }

    private getFile(url: string, cacheBust: string, callback: Function) {
        var _this = this;
        var client = new XMLHttpRequest();
        client.open('GET', url + cacheBust);
        client.onreadystatechange = function () {
            if (client.readyState === 4 && client.status === 200) {
                _this.processSpecification(client.responseText);
                callback();
            }
        }
        client.send();
    }

    private processSpecification(spec: string) {

        var hasParsed = true;
        var composer = new ScenarioComposer(this.steps, this.testReporter);
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
            composer.run();
        }
    }
}

export class TestReporter {
    summary(featureTitle: string, scenarioTitle: string, isSuccess: boolean) {
        console.info((isSuccess ? '✔' : '✘') + ' ' + featureTitle + ' : ' + scenarioTitle + '\n');
    }

    error(featureTitle: string, condition: string, error: Error) {
        console.error(featureTitle + '\n\n' + condition + '\n\n' + error);
    }

    information(message: string) {
        console.log(message);
    }

    protected escape(input: string) {
        return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
}