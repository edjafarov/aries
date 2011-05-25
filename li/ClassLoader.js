var fs=require("fs");
var vm=require("vm");
require('../3rdPaty/log4js/log4js.js')();
var util = require('util');
/**
 * This is basic Classloader with caching compiled copies of scripts
 * Allows to run scripts with dependencies in more comfortable way for FrontEnd developers
 * Keeps javascript classes simple and usable on front end
 * Features:
 * # add dependencies with IO.import([path to dependancy from root directory]);
 * # deploy precompiled scripts including dependancy in ./deploy folder
 * # cache scripts
 * # set any context for scripts
 * #TODO: default modules support
 * to keep track of errors and 
 */

function ClassLoader(){
	var DEPLOY_PATH="./deploy/";
	var scripts={};
	/**
	 * TODO: create utils for writing/deleting directories and files
	 */
	function writeFile(path, source){
		var dirArray = path.split("/");
		var partialPath="";
		for(var i=0;i<dirArray.length-1;i++){
			partialPath+=dirArray[i] + "/";
			try{
				fs.statSync(partialPath);
				if(!fs.statSync(partialPath).isDirectory()){
					throw new Error(partialPath+"is not directory");
				}
			}catch(e){
				fs.mkdirSync(partialPath, 0755);
			}
		}
		partialPath+=dirArray[dirArray.length-1];
		fs.openSync(partialPath, 'w+');
		fs.writeFileSync(partialPath, source);
	}
	
	
	return {
		clearDeploy:function(){
		//TODO: write recursive directory clearing
		},
        buildJsSource:function(source){
            var importRegexp = /IO.import\("(.*?)"\)/g;
    		var importArray = source.match(importRegexp);
			if (importArray) {
				for (var i = 0; i < importArray.length; i++) {
					var pathToImport = importArray[i].split('"')[1];
					source = source.replace('IO.import("' + pathToImport + '");', 
					'/**** imported ****/\n' + this.loadJsSource(pathToImport + ".js"));
				}
			}
            return source;
            }
		,loadJsSource: function(path){
			var source = fs.readFileSync(path).toString();
			// TODO: generalize following regexp
			source=this.buildJsSource(source);
			return source;
		}
        ,
        getScriptFromSource:function(source, path /*optional*/){
            if(path){
                if(!scripts[path]){
    		    	source=this.buildJsSource(source);
			    	writeFile(path.replace(/\.\//,DEPLOY_PATH), source);
			    	scripts[path]=vm.createScript(source, path.replace(/\.\//,DEPLOY_PATH));
		    	}
                return scripts[path];
                }
                
                return vm.createScript(this.buildJsSource(source), "dynamic [getScriptFromSource]");
            }
        ,
        getScript: function(path){
            if(!scripts[path]){
				var generatedSource=this.loadJsSource(path);
				writeFile(path.replace(/\.\//,DEPLOY_PATH), generatedSource);
				scripts[path]=vm.createScript(generatedSource, path.replace(/\.\//,DEPLOY_PATH));
			}
            return scripts[path];
        }
        ,
		getClass: function(path, context){
			this.getScript(path);
			if(!context){
				context={console:console,require:require};
			}
			scripts[path].runInNewContext(context);
			var className = path.split("/")[path.split("/").length-1].replace(/\.js/,"");
			
			return context[className];
		}
	};
}

module.exports=new ClassLoader();