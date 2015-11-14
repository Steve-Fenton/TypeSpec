import {Keyword} from './Keyword';
import {ScenarioComposer} from './ScenarioState';
import {StepDefinition, StepExecution, StepDefinitions} from './Steps';

//TODO: handle multiple scenarios within the same file

export class SpecRunner {
    private steps: StepDefinitions = new StepDefinitions();
    private errorHandler = (featureTitle: string, condition: string, error: Error) => {
        console.error('Default Error Handler (replace using... ):\n\n' + featureTitle + '\n\n' + condition + '\n\n' + error);
    };

    addStep(expression: RegExp, step: Function) {
        this.steps.add(expression, step);
    }

    setErrorHandler(handler: (featureTitle: string, condition: string, error: Error) => any) {
        this.errorHandler = handler;
    }

    run(...url: string[]) {
        this.readFile(0, url);
    }

    private readFile(index: number, url: string[]) {
        // TODO: detect local file path and use node js to read file
        // This is the default for browser-based tests...
        if (index < url.length) {
            var nextIndex = index + 1;
            this.getFile(url[index], () => { this.readFile(nextIndex, url); });
        }

    }

    private getFile(url: string, callback: Function) {
        var _this = this;
        var client = new XMLHttpRequest();
        client.open('GET', url);
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
        var composer = new ScenarioComposer(this.steps, this.errorHandler);
        var lines = spec.replace('\r\n', '\n').split('\n');

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];

            try {
                composer.process(line);
            } catch (ex) {
                hasParsed = false;
                var state = composer.state[0] || { featureTitle: 'Unknown' };
                this.errorHandler(state.featureTitle, line, ex);
            }
        }

        if (hasParsed) {
            composer.run();
        }
    }
}