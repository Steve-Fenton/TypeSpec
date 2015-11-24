import {SpecRunner, TapReporter} from './Scripts/TypeSpec/TypeSpec';
import {Calculator} from './Scripts/Calculator';
import {CustomTestReporter} from './Steps/CustomTestReporter';
import {CalculatorSteps} from './Steps/CalculatorSteps';

var runner = new SpecRunner(new CustomTestReporter());
CalculatorSteps.register(runner);

runner.run(
    '/Specifications/Basic.txt'
);