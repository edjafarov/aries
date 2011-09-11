var sourceReader = require("./sourceReader.js")
module.exports = function scopeModifier(scopes, src) {
    var sr = sourceReader(src);
    return {
        getSourceOfScope: function(scope) {
            return sr.getString(scope.start, scope.end);
        },
        checkPositionInScope: function(position, scope) {
            if (scope.start <= position && position <= scope.end) {
                return true;
            }
            return false;
        },
        checkPositionSameScope: function(position, scope) {
            for (s in scopes) {
                if (scopes[s].parent === scope.parent) {
                    if (this.checkPositionInScope(position, scopes[s])) {
                        return false;
                    };
                }
                return true;
            }
        },
        getFunctionIdByName: function(name) {
            for (var i = 0; i < scopes.length; i++) {
                if (scopes[i].functionName == name) {
                    return i;
                }
            }
            return null;
        },
        addPropertyToFunction: function(id, prop) {
            if (!scopes[id].properties) scopes[id].properties = [];
            scopes[id].properties.push(prop);
        }
    }
}