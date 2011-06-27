var util = require('util');
//TODO: write a hash of handlers for configuration resolving
module.exports = function(cfg) {
    return {
        "annotationFunctionProcessor:RequestMapping": function(annot, scope, index, scopes, parser) {
            console.log(annot + " annotation found with params: " + util.inspect(scope));
            
        },
        "annotationFunctionProcessor:Controller": function(annot, scope, index, scopes, parser) {
            console.log(annot + " annotation found with params: " + util.inspect(scope));
        }
    }
}