// Assertions lifted from tsUnit and made static here. Any improvements ought to be passed back to tsUnit too.

export interface IThrowsParameters {
    fn: () => void;
    message?: string;
    errorString?: string;
}

function printVariable(variable: any) {
    if (variable === null) {
        return '"null"';
    }

    if (typeof variable === 'object') {
        return `{object: ${getNameOfClass(variable)}}`;
    }

    return `{${typeof variable}} "${variable}"`;
}

function getNameOfClass(inputClass: any) {
    return inputClass.constructor.name;
}

export class Assert {
    public static areIdentical(expected: any, actual: any, message = ''): void {
        if (expected !== actual) {
            throw this.getError(
                `areIdentical failed when given ${printVariable(expected)} and ${printVariable(actual)}`,
                message);
        }
    }

    public static areNotIdentical(expected: any, actual: any, message = ''): void {
        if (expected === actual) {
            throw this.getError(
                `areNotIdentical failed when given ${printVariable(expected)} and ${printVariable(actual)}`,
                message);
        }
    }

    public static areCollectionsIdentical(expected: any[], actual: any[], message = ''): void {
        function resultToString(result: number[]): string {
            let msg = '';

            while (result.length > 0) {
                msg = '[' + result.pop() + ']' + msg;
            }

            return msg;
        }

        let compareArray = (expected: any[], actual: any[], result: number[]): void => {
            let indexString = '';

            if (expected === null) {
                if (actual !== null) {
                    indexString = resultToString(result);
                    throw this.getError(
                        `areCollectionsIdentical failed when array a${indexString} is null and b${indexString} is not null`,
                        message);
                }

                return; // correct: both are nulls
            } else if (actual === null) {
                indexString = resultToString(result);
                throw this.getError(
                    `areCollectionsIdentical failed when array a${indexString} is not null and b${indexString} is null`,
                    message);
            }

            if (expected.length !== actual.length) {
                indexString = resultToString(result);
                throw this.getError(
                    `areCollectionsIdentical failed when length of ` +
                    `array a${indexString} (length: ${expected.length})` +
                    `is different of length of ` +
                    `array b${indexString} (length: ${actual.length})`,
                    message);
            }

            for (let i = 0; i < expected.length; i++) {
                if ((expected[i] instanceof Array) && (actual[i] instanceof Array)) {
                    result.push(i);
                    compareArray(expected[i], actual[i], result);
                    result.pop();
                } else if (expected[i] !== actual[i]) {
                    result.push(i);
                    indexString = resultToString(result);
                    throw this.getError(
                        `areCollectionsIdentical failed when ` +
                        `element a${indexString} (${printVariable(expected[i])})` +
                        `is different than ` +
                        `element b${indexString} (${printVariable(actual[i])})`,
                        message);
                }
            }

            return;
        }

        compareArray(expected, actual, []);
    }

    public static areCollectionsNotIdentical(expected: any[], actual: any[], message = ''): void {
        try {
            this.areCollectionsIdentical(expected, actual);
        } catch (ex) {
            return;
        }

        throw this.getError(
            'areCollectionsNotIdentical failed when both collections are identical',
            message);
    }

    public static isTrue(actual: boolean, message = '') {
        if (!actual) {
            throw this.getError(
                `isTrue failed when given ${printVariable(actual)}`,
                message);
        }
    }

    public static isFalse(actual: boolean, message = '') {
        if (actual) {
            throw this.getError(
                `isFalse failed when given ${printVariable(actual)}`,
                message);
        }
    }

    public static isTruthy(actual: any, message = '') {
        if (!actual) {
            throw this.getError(
                `isTruthy failed when given ${printVariable(actual)}`,
                message);
        }
    }

    public static isFalsey(actual: any, message = '') {
        if (actual) {
            throw this.getError(
                `isFalsey failed when given ${printVariable(actual)}`,
                message);
        }
    }

    public static isString(actual: any, message = '') {
        if (typeof actual !== 'string') {
            throw this.getError(
                `isString failed when given ${printVariable(actual)}`,
                message);
        }
    }

    public static isNumber(actual: any, message = '') {
        if (typeof actual !== 'number') {
            throw this.getError(
                `isNumber failed when given ${printVariable(actual)}`,
                message);
        }
    }

    public static isBoolean(actual: any, message = '') {
        if (typeof actual !== 'boolean') {
            throw this.getError(
                `isBoolean failed when given ${printVariable(actual)}`,
                message);
        }
    }

    public static throws(params: IThrowsParameters): void;
    public static throws(actual: () => void, message?: string): void;
    public static throws(a: any, message = '', errorString = '') {
        let actual: () => void = () => { return; };

        if (typeof a === 'function') {
            actual = a;
        } else if (a.fn) {
            actual = a.fn;
            message = a.message;
            errorString = a.exceptionString;
        }

        let isThrown = false;

        try {
            actual();
        } catch (ex) {
            if (!errorString || ex.message === errorString) {
                isThrown = true;
            }

            if (errorString && ex.message !== errorString) {
                throw this.getError('different error string than supplied');
            }
        }

        if (!isThrown) {
            throw this.getError('did not throw an error', message || '');
        }
    }

    public static doesNotThrow(actual: () => void, message?: string): void {
        try {
            actual();
        } catch (ex) {
            throw this.getError('threw an error ' + ex, message || '');
        }
    }

    public static executesWithin(actual: () => void, timeLimit: number, message: string = ''): void {
        function getTime() {
            return window.performance.now();
        }

        function timeToString(value: number) {
            return Math.round(value * 100) / 100;
        }

        const startOfExecution = getTime();

        try {
            actual();
        } catch (ex) {
            throw this.getError(
                `isExecuteTimeLessThanLimit fails when given code throws an exception: "${ex}"`,
                message);
        }

        const executingTime = getTime() - startOfExecution;

        if (executingTime > timeLimit) {
            throw this.getError(
                `isExecuteTimeLessThanLimit fails when execution time of given code (${timeToString(executingTime)} ms) ` +
                `exceed the given limit(${timeToString(timeLimit)} ms)`,
                message);
        }
    }

    public static fail(message = '') {
        throw this.getError('fail', message);
    }

    private static getError(resultMessage: string, message: string = '') {
        if (message) {
            return new Error(resultMessage + '. ' + message);
        }

        return new Error(resultMessage);
    }
}