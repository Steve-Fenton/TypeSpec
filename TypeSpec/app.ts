/* TypeSpec Dependencies */
import {SpecRunner, SpecificationList, TapReporter} from './Scripts/TypeSpec/TypeSpec';

/* (Optional) Your Dependencies */
import {Calculator} from './Scripts/Calculator';
import {CustomTestReporter, CustomTestHooks} from './Scripts/CustomTestReporter';

/* Your Test Code */
import {CalculatorSteps} from './Scripts/CalculatorSteps';
import {ArgumentSteps} from './Scripts/ArgumentSteps';

var runner = new SpecRunner(new CustomTestReporter(), new CustomTestHooks());
//var runner = new SpecRunner(); // Default
//var runner = new SpecRunner(new TapReporter()); // TAP Output (https://testanything.org/)

/* (Optional) You can exclude tags (the @ prefix is optional) */
runner.excludeTags('@exclude');
//runner.excludeTags('exclude', 'failing');

/* You can use this technique to register many sets of steps */
CalculatorSteps.register(runner);
ArgumentSteps.register(runner);

/* Run the specifications listed */
runner.run(
    '/Specifications/Basic.txt',
    '/Specifications/ArgumentTypes.txt',
    '/Specifications/MultipleArgumentsPerLine.txt',
    '/Specifications/MultipleScenarios.txt',
    '/Specifications/ScenarioOutlines.txt',
    '/Specifications/MixedSpecificationFiles.txt',
    '/Specifications/QuotedStrings.txt',
    '/Specifications/AsyncSteps.txt',
    '/Specifications/UnquotedExpressions.txt',

    //Deliberately failing features
    '/Specifications/Failing.txt',
    '/Specifications/FailingAsyncSteps.txt',
    '/Specifications/MissingStep.txt',

    //Excluded by tag
    '/Specifications/ExcludedByTag.txt'
);
