import { SpecRunner, TapReporter } from './node_modules/typespec-bdd/src/TypeSpec';
import {Calculator} from './Scripts/Calculator';
import {CustomTestReporter} from './Steps/CustomTestReporter';
import {CalculatorSteps} from './Steps/CalculatorSteps';

var runner = new SpecRunner(new CustomTestReporter());
CalculatorSteps.register(runner);

runner.run(
    '/Specifications/Basic.txt'
);