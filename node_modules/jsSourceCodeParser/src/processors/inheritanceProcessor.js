var inheritancePatterns = function(className){
   return [
        new RegExp("YAHOO\\.lang\\.extend\\(" +className+ ",\\s*(\\w*)\\s*\\)"),
        new RegExp("Y\\.extend\\(" +className+ ",\\s*(\\w*)\\s*\\)"),
        new RegExp("ARIES\\.Extend\\(\\s*" +className+ "\\s*\\)\\.by\\(\\s*(\\w*)\\s*\\)")
    ];
}

module.exports = function(scope, index, scopes, parser) {
    var stringToTest = parser.sr.getString(scope.end);
    if (scope.type == CONST.FUNCTION) {
        var stringToTest = parser.sr.getString(scope.end);
        var patterns=inheritancePatterns(scope.functionName);
        for(pattern in patterns){
            if(patterns[pattern].test(stringToTest)){
                scope.superClassName=patterns[pattern].exec(stringToTest)[1];
            };
        }
    }
}