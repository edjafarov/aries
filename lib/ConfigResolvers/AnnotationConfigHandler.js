var util = require('util');
var OVERRIDE = "Override";
module.exports = function (cfg){
    return {
        "annotationFunctionProcessor:RequestMapping": function (annot, scope, index, scopes, parser){
            if(isOverriden(scope)) return false;
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
        "annotationFunctionProcessor:preInterceptor": function (annot, scope, index, scopes, parser) {
            if (isOverriden(scope)) return false;
            if(cfg.preInterceptors.indexOf(scope.filePath)==-1){
                cfg.preInterceptors.push(scope.filePath);
            }
        },
        "annotationFunctionProcessor:postInterceptor": function (annot, scope, index, scopes, parser) {
            if (isOverriden(scope)) return false;
            if(cfg.postInterceptors.indexOf(scope.filePath)==-1){
                cfg.postInterceptors.push(scope.filePath);
            }
        }
    }
}


function isOverriden(scope){
    return scope.annotations[OVERRIDE] != null;
}