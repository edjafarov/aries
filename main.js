var CONTROLLERS_PATH = "./controllers/";
var APP_CFG_PATH = "./app-cfg/";

var http = require('http');
var fs = require('fs');
var urlModule = require('url');
var util = require('util');
var vm = require('vm');
var eventsModule = require('events');
require('./3rdPaty/log4js/log4js.js')();


/**
 *Read configuration:
 * @params
 * name [String] application name
 * ver [String] application version
 * urlMapping [Array<String>] array of url mapping filenames 
 */

var CFG_FILE = fs.readFileSync(APP_CFG_PATH + "main.json");
console.log("main.json config loading....");
console.debug(CFG_FILE.toString());
console.log("parsing main.json config....");
var CFG=JSON.parse(CFG_FILE);
console.debug(CFG);
console.debug("*** starting " + CFG.name + " webapp version " + CFG.ver + " ***");

var urlMappings={};
console.log("parsing urlMappings....\n");


if(CFG.autoconfig){
	fs.writeFileSync("./app-cfg/auto-urlmapping.json", "{}");
	var jsdoc=require(CFG.jsDocToolkit+"noderun.js");
	jsdoc.jsdoctoolkit.init(["-c=./app-cfg/autoconfig.conf"]);
}


for(cfgMapping in CFG.urlMapping){
	console.log("reading filename " + CFG.urlMapping[cfgMapping]);
	URL_MAPPING_FILE = fs.readFileSync( CFG.urlMapping[cfgMapping]);
	console.debug("parsing " + CFG.urlMapping[cfgMapping]);
	URL_MAPPING = JSON.parse(URL_MAPPING_FILE);
	for(url in URL_MAPPING){
		try{
			var stats=fs.lstatSync(URL_MAPPING[url].inFile);
			if(stats.isFile()){
				console.debug("url: " + url + " mapped to " + URL_MAPPING[url].inFile + "class");
				urlMappings[url] = URL_MAPPING[url];
			}else{
				throw new Error("trying to map url: " + url + " to " + URL_MAPPING[url] + 
				" failed - file '" + URL_MAPPING[url] + "' not found");
			}
		}catch(e){
			console.error(e);
		}
	}
}
/* TODO: make filters
var Filters=[];
for(filter in CFG.filters){
	console.log("reading filters " + CFG.filters[filter]);
		try{
			var stats=fs.lstatSync(CFG.filters[filter]);
			if(stats.isFile()){
				console.debug("filter class " + CFG.filters[filter] + " found");
				Filters.push(require(CFG.filters[filter]).filter);
			}else{
				throw new Error("trying to load: " + CFG.filters[filter] +" failed - file not found");
			}
		}catch(e){
			console.error(e);
		}
}
*/

function loadJsSource(path){
	var source=fs.readFileSync(path).toString();
	// TODO: generalize following regexp
	var importRegexp=/IO.import\("(.*?)"\)/g;
	var importArray=source.match(importRegexp);
	if(importArray){
	for(var i=0; i< importArray.length ; i++){
		var pathToImport=importArray[i].split('"')[1];
		source=source.replace('IO.import("'+pathToImport+'");','/**** imported ****/\n' + loadJsSource(pathToImport + ".js"));
	}
	}
	return source;
}

function getContext(){
	var AriesContext={};
	vm.runInNewContext(loadJsSource("./ariesjs.js"),AriesContext);
	vm.runInNewContext(loadJsSource("./zparse.js"),AriesContext);
	vm.runInNewContext(loadJsSource("./implementation.js"),AriesContext);
	vm.runInNewContext(loadJsSource("./AriesNodePlugin.js"),AriesContext);
	
	return AriesContext;
}

function getInstance(path){
	var tmpContext={urlMappings:urlMappings};
	vm.runInNewContext(loadJsSource(path),tmpContext);
	return tmpContext[path.split("/")[path.split("/").length-1].replace(/\.js/,"")]();
}

var UrlResolver = getInstance(CFG.UrlResolver);

function appServer(request, response){
	
	 /**
	 *URL PARSING
	  */

		/*for(var i=0; i< Filters.length; i++){
			Filters[i](request, response)
		}*/
		var urlObj=urlModule.parse(request.url, true);
		
		if(UrlResolver.resolve(urlObj.pathname)){
			response.writeHead(200, {'Content-Type': 'text/html'});
			
			//TODO: implement basic environment in more gentle way

			var context={
					console:console,
					loadedModules:[],
					ARIES:getContext().ARIES
			};
			

			// TODO: cache script files for controllers
			vm.runInNewContext(loadJsSource(UrlResolver.resolve(urlObj.pathname).inFile), context);
			
			//console.log(util.inspect(context));
			/**
			 * TODO: Zparser should be taken as a basis. Using similar engine we should precompile views 
			 * in pure Javascript this scripts will be used later to render view using the context
			 *  prepared by controller. On client side we can still use Zparser. 
			 */
			var controllerClass=new context[UrlResolver.resolve(urlObj.pathname).mappingFunction.split("#")[0]]();
			if(UrlResolver.resolve(urlObj.pathname).mappingFunction.indexOf("#")!=-1){
				var controllerMethod=UrlResolver.resolve(urlObj.pathname).mappingFunction.split("#")[1];
				controllerClass[controllerMethod].apply(controllerClass,UrlResolver.resolve(urlObj.pathname).argumentsToPass);
			}
			response.end(controllerClass.renderView());
		}else{
		    response.writeHead(404, {'Content-Type': 'text/html'});
			if(urlMappings["404"]){
				var resolvedController = require(CONTROLLERS_PATH + urlMappings["404"] + ".js");
				var pageObject=resolvedController.constructor(urlObj.query);
				response.end(pageObject.renderView());
			}else{
				response.end("404");
			}
			console.log("404" + request.url);
		}
	  
	    	
}

 http.createServer(function (request, response) {
	 appServer(request, response);
 }).listen(8124);

 console.log('Server running at http://127.0.0.1:8124/');

