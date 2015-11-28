var ExpressionLibrary = (function () {
    function ExpressionLibrary() {
    }
    ExpressionLibrary.quotedArgumentsRegExp = /"(?:[^"\\]|\\.)*"/ig;
    ExpressionLibrary.defaultStepRegExp = /"(?:[^"\\]|\\.)*"/ig;
    ExpressionLibrary.regexFinderRegExp = /([\.\\]([*a-z])\+?)|\(\\\"true\\\"\|\\"false\\\"\)/g;
    ExpressionLibrary.defaultString = '"(.*)"';
    ExpressionLibrary.numberString = '(\\"\\d+\\")';
    ExpressionLibrary.trueFalseString = '(\\"true\\"|\\"false\\")';
    return ExpressionLibrary;
})();
exports.ExpressionLibrary = ExpressionLibrary;
