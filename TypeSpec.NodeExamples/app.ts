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

    AutoRunner.run.apply(AutoRunner, specifications);

    // The rest of the code is just 
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    setTimeout(() => {
        rl.question('Press any key to exit...', (answer: any) => {
            rl.close();
        });
    }, 3000);
});

