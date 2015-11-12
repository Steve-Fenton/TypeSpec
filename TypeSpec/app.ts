import * as TsUnit from './Scripts/tsUnit/tsUnit';
import * as TypeSpec from './Scripts/TypeSpec/TypeSpec';

class Calculator {
    private total = 0;

    add(n: number) {
        this.total += n;
    }

    getTotal() {
        return this.total;
    }
}

// TODO: per-test state - if calculator wasn't initialized in the first step, there would be indeterminate tests
var calculator: Calculator;

var steps = new TypeSpec.StepDefinitions();

// TODO: 50 should be a (d+) matcher
steps.add("I have entered 50 into the calculator", () => {
    console.log('\t(Run step for 50)');
    calculator = new Calculator();
    calculator.add(50);
});

steps.add("I have also entered 70 into the calculator", () => {
    console.log('\t(Run step for 70)');
    calculator.add(70);
});

// Deliberate missing step for test purposes
steps.add("I press add", () => {
    console.log('\t(Run step for add)');
    // No action needed
});

steps.add("the result should be 120 on the screen", () => {
    // TODO: use tsUnit assertions
    console.log('\t(Run step for total)');
    var total = calculator.getTotal();
    if (total !== 120) {
        throw Error('Total should have been 120, was ' + total);
    }
});

steps.add("the result should be 121 on the screen", () => {
    // TODO: use tsUnit assertions
    console.log('\t(Run step for total)');
    var total = calculator.getTotal();
    if (total !== 121) {
        throw Error('Total should have been 121, was ' + total);
    }
});

//TODO: due to async... need to chain... ???

var reader = new TypeSpec.SpecReader(steps);
reader.read('/Specifications/Basic.html', '/Specifications/Failing.html');