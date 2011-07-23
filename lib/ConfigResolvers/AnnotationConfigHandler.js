var util = require('util');
//TODO: write a hash of handlers for configuration resolving
module.exports = function(cfg) {
    return {
        "annotationFunctionProcessor:RequestMapping": function(annot, scope, index, scopes, parser) {
            //console.log(annot + " annotation found with params: " + util.inspect(scope));
            try{
                var controller = null;
                var controllerMethod = null;
                if(scope.type!="method"){
                    controller=scope.functionName;
                }else{
                    controller=scopes[scope.classReferenceId].functionName;
                    controllerMethod = scope.functionName;
                }
                cfg.urlMappings[scope.annotations[annot].value]={
                        controllerClass:controller,
                        controllerMethod:controllerMethod,
                        filePath:scope.filePath,
                        arguments:scope.arguments
                    }
            }catch(e){
                throw new Error("seems we have not valid annotation: " + e);
            }
        },
        "annotationFunctionProcessor:Controller": function(annot, scope, index, scopes, parser) {
            //console.log(annot + " annotation found with params: " + util.inspect(scope));
        }
    }
}