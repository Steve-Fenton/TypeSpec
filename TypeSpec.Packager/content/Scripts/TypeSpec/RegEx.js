(function (deps, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(deps, factory);
    }
})(["require", "exports"], function (require, exports) {
    var ExpressionLibrary = (function () {
        function ExpressionLibrary() {
        }
        ExpressionLibrary.quotedArgumentsRegExp = /("(?:[^"\\]|\\.)*")/ig;
        ExpressionLibrary.defaultStepRegExp = /"(?:[^"\\]|\\.)*"/ig;
        ExpressionLibrary.regexFinderRegExp = /([\.\\]([*a-z])\+?)|\(\\\"true\\\"\|\\"false\\\"\)/g;
        ExpressionLibrary.defaultString = '"(.*)"';
        ExpressionLibrary.numberString = '(\\"\\d+\\")';
        ExpressionLibrary.trueFalseString = '(\\"true\\"|\\"false\\")';
        return ExpressionLibrary;
    })();
    exports.ExpressionLibrary = ExpressionLibrary;
});
