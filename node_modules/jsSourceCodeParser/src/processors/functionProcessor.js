

var simpleFunction = new RegExp(REGEXP.FUNCTION);
var assignedFunction = new RegExp(REGEXP.ASSIGNED_TO + REGEXP.FUNCTION);

module.exports = function(scope, index, scopes, parser) {
    var stringToTest = parser.sr.getString(0, scope.start);
    if (simpleFunction.test(stringToTest)) {
        scope.type = CONST.FUNCTION;
        var parsed = simpleFunction.exec(stringToTest);
        // check if anonimous
        scope.latestParsed = parsed[0];
        scope.latestParsedRegExp = simpleFunction;
        scope.isAnonimous = !parsed[1];
        if (scope.isAnonimous && assignedFunction.test(stringToTest)) {
            //if anonimous try to get name of variable we assign the function to
            scope.functionName = assignedFunction.exec(stringToTest)[1];
        }
        else {
            scope.functionName = parsed[1];
        }
        scope.argumentsSrc = parsed[2];
    }
}