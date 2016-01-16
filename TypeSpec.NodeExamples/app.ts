import {SpecRunner, TapReporter} from './node_modules/typespec-bdd/TypeSpec';
import {Calculator} from './Scripts/Calculator';
import {CalculatorSteps} from './Steps/CalculatorSteps';
import readline = require('readline');

var runner = new SpecRunner(new TapReporter());
CalculatorSteps.register(runner);

runner.run(
    '/Specifications/Basic.txt'
);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


setTimeout(() => {
    rl.question('Press any key to exit...', (answer) => {
        rl.close();
    });
}, 3000);