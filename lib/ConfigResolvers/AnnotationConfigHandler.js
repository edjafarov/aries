var util = require('util');
var OVERRIDE = "Override";
var controllerWatcher = [];

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
                //following is done to prevent dev from putting same name method names accidently
                if(controllerWatcher.indexOf([controller,scope.filePath,controllerMethod].join())!=-1){
                        throw new Error("You have same controller method name ["+ [controller,controllerMethod].join() +"] twice in "+ scope.filePath);
                    }else{
                        controllerWatcher.push([controller,scope.filePath,controllerMethod].join());
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