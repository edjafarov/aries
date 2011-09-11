var prototypeFunction = new RegExp(REGEXP.SOME + REGEXP.PROTOTYPE + REGEXP.FUNCTION);

module.exports = function(scope, index, scopes, parser) {
    if (scope.type == CONST.FUNCTION) {
        var stringToTest = parser.sr.getString(0, scope.start);
        if (prototypeFunction.test(stringToTest)) {
            var parsed = prototypeFunction.exec(stringToTest);
            scope.latestParsed = parsed[0];
            scope.latestParsedRegExp = prototypeFunction;
            var classReferenceId = parser.sm.getFunctionIdByName(parsed[1]);
            if (classReferenceId !== null) {
                scope.classReferenceId = classReferenceId;
                parser.sm.addPropertyToFunction(classReferenceId, {
                    name: scope.functionName,
                    type: CONST.METHOD,
                    typeOf: CONST.FUNCTION,
                    refId: index
                });
                scope.type = CONST.METHOD;
            }
        }
    }
};