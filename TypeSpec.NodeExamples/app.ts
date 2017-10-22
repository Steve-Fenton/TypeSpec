import { AutoRunner, TapReporter } from 'typespec-bdd';
import './Steps/CalculatorSteps';
import readline = require('readline');
import * as fs from 'fs';

AutoRunner.testReporter = new TapReporter();

// Example of dynamically getting all specifications from a folder
function getSpecifications() {
    return new Promise((resolve: (specifications: string[]) => void, reject: (error: any) => void) => {
        fs.readdir('./Specifications', function (err, items) {
            const specifications: string[] = [];
            for (const item of items) {
                specifications.push('/Specifications/' + item);
            }

            resolve(specifications);
        });
    });
}

// Run all the specifications
getSpecifications()
    .then((specs) => {

        AutoRunner.run.apply(AutoRunner, specs)
            .then(() => {
                // This is just console code, not related to testing
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });

                rl.question('Press any key to exit...', (answer: any) => {
                    rl.close();
                });
            });
    });