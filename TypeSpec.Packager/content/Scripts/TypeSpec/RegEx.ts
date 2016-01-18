export class ExpressionLibrary {
    // RegExp members
    public static quotedArgumentsRegExp = /("(?:[^"\\]|\\.)*")/ig;
    public static defaultStepRegExp = /"(?:[^"\\]|\\.)*"/ig;
                                      
    // Part one finds things like "(.*)" and (\"\d+\") = /([\.\\]([*a-z])\+?)/g;
    // Part two finds things like (\"true\"|\"false\") = \(\\\"true\\\"\|\\"false\\\"\)
    public static regexFinderRegExp = /([\.\\]([*a-z])\+?)|\(\\\"true\\\"\|\\"false\\\"\)/g;

    // String members
    public static defaultString = '"(.*)"';
    public static numberString = '(\\"\\d+\\")';
    public static trueFalseString = '(\\"true\\"|\\"false\\")';
}