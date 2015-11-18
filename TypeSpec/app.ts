// TypeSpec code
import {SpecRunner} from './Scripts/TypeSpec/TypeSpec';

// Your application code
import {Calculator} from './Scripts/Calculator';

// (Optional) You can supply your own custom test reporter if you want to.
import {CustomTestReporter} from './Scripts/CustomTestReporter';

// Your test code
import {CalculatorSteps} from './Scripts/CalculatorSteps';
import {ArgumentSteps} from './Scripts/ArgumentSteps';

// Set up the tests
var runner = new SpecRunner(new CustomTestReporter());

// You can use this technique to register many sets of steps
CalculatorSteps.register(runner);
ArgumentSteps.register(runner);

// Run the specifications listed
runner.run(
    '/Specifications/Basic.txt',
    '/Specifications/ArgumentTypes.txt',
    '/Specifications/MultipleArgumentsPerLine.txt',
    '/Specifications/MultipleScenarios.txt',
    '/Specifications/ScenarioOutlines.txt',

    //Deliberately failing features
    '/Specifications/Failing.txt',
    '/Specifications/MissingStep.txt'
);