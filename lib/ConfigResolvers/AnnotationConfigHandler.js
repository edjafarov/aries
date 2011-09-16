var util = require('util');
var OVERRIDE = "Override";
//TODO: write a hash of handlers for configuration resolving
module.exports = function (cfg) {
    return {
        "annotationFunctionProcessor:RequestMapping": function (annot, scope, index, scopes, parser) {
            if (isOverriden(scope)) return false;
            try {
                var controller = null;
                var controllerMethod = null;
                if (scope.type != "method") {
                    controller = scope.functionName;
                }
                else {
                    controller = scopes[scope.classReferenceId].functionName;
                    controllerMethod = scope.functionName;
                }
                cfg.urlMappings[scope.annotations[annot].value] = {
                    controllerClass: controller,
                    controllerMethod: controllerMethod,
                    filePath: scope.filePath,
                    arguments: scope.arguments
                };
            }
            catch (e) {
                throw new Error("seems we have not valid annotation: " + e);
            }
        },
        "annotationFunctionProcessor:Filter": function (annot, scope, index, scopes, parser) {
            if (isOverriden(scope)) return false;
            if(cfg.filters.indexOf(scope.filePath)==-1){
                cfg.filters.push(scope.filePath);
            }
        },
        "annotationFunctionProcessor:Interceptor": function (annot, scope, index, scopes, parser) {
            if (isOverriden(scope)) return false;
            if(cfg.interceptors.indexOf(scope.filePath)==-1){
                cfg.interceptors.push(scope.filePath);
            }
        },
        "annotationFunctionProcessor:ViewModel": function (annot, scope, index, scopes, parser) {
            //console.log(annot + " annotation found with params: " + util.inspect(scope));
        }
    }
}


function isOverriden(scope){
    return scope.annotations[OVERRIDE] != null;
}