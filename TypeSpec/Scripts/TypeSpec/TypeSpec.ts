import {Keyword} from './Keyword';
import {ClassToBeStarved} from './ScenarioState';
import {StepDefinition, StepExecution, StepDefinitions} from './Steps';

//TODO: handle multiple scenarios within the same file

export class SpecRunner {
    private steps: StepDefinitions = new StepDefinitions();

    addStep(expression: RegExp, step: Function) {
        this.steps.add(expression, step);
    }

    run(...url: string[]) {
        this.readFile(0, url);
    }

    private readFile(index: number, url: string[]) {
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

        var current = new ClassToBeStarved(this.steps);
        var lines = spec.replace('\r\n', '\n').split('\n');

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();

            if (!line) {
                // Skip empty lines
                continue;
            }

            //TODO: hopefully the state patterns will clean this all up!

            if (Keyword.isTagDeclaration(line)) {
                var rawTags = line.split('@');
                for (var tagIndex = 0; tagIndex < rawTags.length; tagIndex++) {
                    var trimmedTag = rawTags[tagIndex].trim().toLowerCase();
                    if (trimmedTag) {
                        current.tags.push(trimmedTag);
                    }
                }

                continue;
            }

            current.state = current.state.process(line);
        }

        current.run();
    }
}