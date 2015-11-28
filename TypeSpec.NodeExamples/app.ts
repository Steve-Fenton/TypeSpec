import {SpecRunner, TapReporter} from './node_modules/typespec-bdd/TypeSpec';
import {Calculator} from './Scripts/Calculator';
import {CalculatorSteps} from './Steps/CalculatorSteps';

var runner = new SpecRunner(new TapReporter());
CalculatorSteps.register(runner);

runner.run(
    '/Specifications/Basic.txt'
);