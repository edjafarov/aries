var http = require('http');
var fs = require('fs');
var urlModule = require('url');
var util = require('util');
var vm = require('vm');
var eventsModule = require('events');
var querystring = require('querystring');
require('./3rdPaty/log4js/log4js.js')();



function ClassLoader(){
	var DEPLOY_PATH="./deploy/";
	var scripts={};
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
		}
		,loadJsSource: function(path){
			var source = fs.readFileSync(path).toString();
			// TODO: generalize following regexp
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
		},
		getClass: function(path, context){
			if(!scripts[path]){
				var generatedSource=this.loadJsSource(path);
				writeFile(path.replace(/\.\//,DEPLOY_PATH), generatedSource);
				scripts[path]=vm.createScript(generatedSource, path.replace(/\.\//,DEPLOY_PATH));
			}
			if(!context){
				context={console:console,require:require};
			}
			scripts[path].runInNewContext(context);
			var className = path.split("/")[path.split("/").length-1].replace(/\.js/,"");
			
			return context[className];
		}
	};
}



var t=ClassLoader().getClass("./controllers/Sample.js");
inst1=new t("fdf");
inst2=new t("fda");
console.log(util.inspect(inst1));console.log(util.inspect(inst2));

	