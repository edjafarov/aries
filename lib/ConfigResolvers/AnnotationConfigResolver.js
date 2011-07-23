var fs = require('fs');
var util = require('util');
var jsSCP = require('jsSourceCodeParser');



function AnnotationConfigResolver(cfg){
    
    var srcFiles = this.sourceFolderWalker(cfg.appSrc);
    var parser=new jsSCP();

    //TODO: put confugarable list of Handlers for custom annotations support
    var handlers = require("./AnnotationConfigHandler.js")(cfg);
    
    for(handler in handlers){
        parser.on(handler, handlers[handler]);
    }
    for(var i =0; i < srcFiles.length; i++){
        console.log("parsing " + srcFiles[i]);
        parser.parse(fs.readFileSync(srcFiles[i]).toString(), srcFiles[i]);
    }
    return {urlMappings:cfg.urlMappings};
}

AnnotationConfigResolver.prototype.scopeAnnotationsFilter = function(scope){
    if(scope.annotationSrc){
        return scope;
    }
    if(scope.arguments){
        for(arg in scope.arguments){
            if(scope.arguments[arg].annotationSrc){
                
            }
        }  
    }
}

AnnotationConfigResolver.prototype.sourceFolderWalker = function(rootpath){
    var filesList=[];
    function walker(path){
        path+="/";
        var locaDirFilesList = fs.readdirSync(path);
        for(var i=0; i<locaDirFilesList.length;i++){
            var stats = fs.statSync(path + locaDirFilesList[i]);
            if(stats.isFile() && locaDirFilesList[i].lastIndexOf("\.js")!=-1){
                filesList.push(path + locaDirFilesList[i]);
            }else if(stats.isDirectory()){
                walker(path + locaDirFilesList[i]);
            }
        }
    }
    walker(rootpath);
    return filesList;
}

module.exports = function (cfg){
        return new AnnotationConfigResolver(cfg);
    }