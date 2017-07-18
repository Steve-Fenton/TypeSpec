(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ExpressionLibrary = (function () {
        function ExpressionLibrary() {
        }
        // RegExp members
        ExpressionLibrary.quotedArgumentsRegExp = /("(?:[^"\\]|\\.)*")/ig;
        ExpressionLibrary.defaultStepRegExp = /"(?:[^"\\]|\\.)*"/ig;
        // Part one finds things like "(.*)" and (\"\d+\") = /([\.\\]([*a-z])\+?)/g;
        // Part two finds things like (\"true\"|\"false\") = \(\\\"true\\\"\|\\"false\\\"\)
        ExpressionLibrary.regexFinderRegExp = /([\.\\]([*a-z])\+?)|\(\\\"true\\\"\|\\"false\\\"\)/g;
        // String members
        ExpressionLibrary.defaultString = '"(.*)"';
        ExpressionLibrary.numberString = '(\\"\\d+\\")';
        ExpressionLibrary.trueFalseString = '(\\"true\\"|\\"false\\")';
        return ExpressionLibrary;
    }());
    exports.ExpressionLibrary = ExpressionLibrary;
});
//# sourceMappingURL=RegEx.js.map