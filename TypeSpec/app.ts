/* TypeSpec Dependencies */
import { AutoRunner } from './Scripts/TypeSpec/TypeSpec';

/* (Optional) Your Dependencies */
import { CustomTestReporter, CustomTestHooks } from './Scripts/CustomTestReporter';

/* Your Test Code - make sure you use this syntax (import 'file') not (import * as file from 'file') */
import './Scripts/CalculatorSteps';
import './Scripts/ArgumentSteps';

AutoRunner.testReporter = new CustomTestReporter();
 // AutoRunner.testReporter = new TapReporter(); // TAP Output (https://testanything.org/)
AutoRunner.testHooks = new CustomTestHooks();

/* (Optional) You can exclude tags (the @ prefix is optional) */
AutoRunner.excludeTags('@exclude', 'moreTagsToExclude');

/* Run the specifications listed */
AutoRunner.run(
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
    '/Specifications/ExcludedByTag.txt')
    .then(() => {
        alert('Done');
    })
    .catch((error) => {
        alert('Error! ' + error);
    });
