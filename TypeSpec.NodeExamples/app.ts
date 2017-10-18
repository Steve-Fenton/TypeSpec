import {AutoRunner, TapReporter} from './node_modules/typespec-bdd/src/TypeSpec';
import './Steps/CalculatorSteps';
import readline = require('readline');

AutoRunner.testReporter = new TapReporter();

AutoRunner.run(
    '/Specifications/Basic.txt'
);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


setTimeout(() => {
    rl.question('Press any key to exit...', (answer: any) => {
        rl.close();
    });
}, 3000);