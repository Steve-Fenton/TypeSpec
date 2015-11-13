import {Keyword} from './Keyword';
import {ScenarioState} from './ScenarioState';
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

        var state = new ScenarioState(this.steps);
        var lines = spec.replace('\r\n', '\n').split('\n');

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();

            if (!line) {
                // Skip empty lines
                continue;
            }

            //TODO: hopefully the state patterns will clean this all up!

            if (Keyword.isFeatureDeclaration(line)) {
                state.startFeature(line);
                continue;
            }

            if (state.hasFeatureSection) {

                if (Keyword.isScenarioDeclaration(line)) {
                    state.startScenario(line);
                    continue;
                }

                if (Keyword.isOutlineDeclaration(line)) {
                    state.startOutline(line);
                    continue;
                }

                if (state.hasOutlineSection) {
                    if (Keyword.isExamplesDeclaration(line)) {
                        state.startExamples();
                    }
                }

                if (Keyword.isTagDeclaration(line)) {
                    var rawTags = line.split('@');
                    for (var tagIndex = 0; tagIndex < rawTags.length; tagIndex++) {
                        var trimmedTag = rawTags[tagIndex].trim().toLowerCase();
                        if (trimmedTag) {
                            state.tags.push(trimmedTag);
                        }
                    }

                    continue;
                }

                if (state.isFeatureSection) {
                    state.featureDescription.push(line);
                    continue;
                }

                if (Keyword.isGivenDeclaration(line)) {
                    state.startGiven(line);
                    continue;
                }

                if (Keyword.isWhenDeclaration(line)) {
                    state.startWhen(line);
                    continue;
                }

                if (Keyword.isThenDeclaration(line)) {
                    state.startThen(line);
                    continue;
                }

                if (Keyword.isAndDeclaration(line)) {
                    state.and(line);
                    continue;
                }

            }

            throw new Error('I don\'t know what to do with: ' + line);
        }

        state.run();
    }
}