import { AutoRunner } from './node_modules/typespec-bdd/src/TypeSpec';
import { CustomTestReporter } from './Steps/CustomTestReporter';
import './Steps/CalculatorSteps';

AutoRunner.testReporter = new CustomTestReporter();

AutoRunner.run(
    '/Specifications/Basic.txt'
);