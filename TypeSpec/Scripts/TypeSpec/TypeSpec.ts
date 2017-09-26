import { Runner, SpecRunner, Kind } from './Runner';

// DECORATOR EXPERIMENT
const runner = new SpecRunner();

export const AutoRunner: Runner = runner;

export function step(regex: RegExp, kind: Kind = Kind.Sync) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        runner.addStep(regex, descriptor.value, kind);
    }
}

export function given(regex: RegExp, kind: Kind = Kind.Sync) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        runner.given(regex, descriptor.value, kind);
    }
}

export function when(regex: RegExp, kind: Kind = Kind.Sync) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        runner.when(regex, descriptor.value, kind);
    }
}

export function then(regex: RegExp, kind: Kind = Kind.Sync) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        runner.then(regex, descriptor.value, kind);
    }
}

export { Runner, Kind } from './Runner';
export { Assert } from './Assertions';
export { TestReporter, TapReporter, TestHooks } from './Hooks';