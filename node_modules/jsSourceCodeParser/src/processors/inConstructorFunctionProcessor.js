var inConstructorFunction = new RegExp(REGEXP.LOCAL + REGEXP.FUNCTION);

module.exports = function(scope, index, scopes, parser) {
    if (scope.type == CONST.FUNCTION) {
        var stringToTest = parser.sr.getString(0, scope.start);
        if (inConstructorFunction.test(stringToTest)) {
            var parsed = inConstructorFunction.exec(stringToTest);
            scope.latestParsed = parsed[0];
            scope.latestParsedRegExp = inConstructorFunction;
            var j = scope.parentId;

            while (typeof j != "undefined") {
                if (scope.type == CONST.FUNCTION) {
                    scope.classReferenceId = j;
                    scope.type = CONST.INNER_METHOD;
                    break;
                }
                j = scopes[j].parentId;
            }

        }
    }
};