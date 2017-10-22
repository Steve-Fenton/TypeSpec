import { AutoRunner, TapReporter } from 'typespec-bdd';
import './Steps/CalculatorSteps';
import readline = require('readline');
import * as fs from 'fs';

AutoRunner.testReporter = new TapReporter();

// Run all the specifications within the "./Specifications" folder
fs.readdir('./Specifications', function (err, items) {
    const specifications: string[] = [];
    for (const item of items) {
        specifications.push('/Specifications/' + item);
    }

    AutoRunner.run.apply(AutoRunner, specifications)
        .then(() => {
            // The rest of the code is just to let you "press any key to exit"
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            rl.question('Press any key to exit...', (answer: any) => {
                rl.close();
            });
        });
});