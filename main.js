var CONTROLLERS_PATH = "./controllers/";
var APP_CFG_PATH = "./app-cfg/";

var http = require('http');
var fs = require('fs');
var urlModule = require('url');
var util = require('util');
var vm = require('vm');
var eventsModule = require('events');
var querystring = require('querystring');
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

/**
 * CONFIGURATION LOADING
 */
if(CFG.autoconfig){ /* Auto configuration parsing */
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
/**
 * Set Up Class Loader
 */
var ClassLoader=require(CFG.ClassLoader);
/**
 * Set Up Url resolver
 */
var UrlResolver = ClassLoader.getClass(CFG.UrlResolver,{urlMappings:urlMappings})();

var FlowController = function(){
	return {
		doNext: function(request, response){
	
		},
		error:function(){
		}
	}
}

var FlowDispatcher = function(flowController){
	var flowController=flowController;
	var flowQueue = [];
	var currentIndex=0;

	

	return {
	/**
	 * @param item FlowItem to push in flowQueue
	 * @param index optional
	 */
		pushToFlow:function(item, index){
			/*TODO: validate `item` for being instance of FlowItem  */
			flowQueue.splice(index, 0, item);
		}
		,currentFlowItem: function(){
			return flowQueue[currentIndex]
		}
		
	}
}

var flowDispatcher = FlowDispatcher(FlowController);


function appServer(request, response){
	

		var urlObj=urlModule.parse(request.url, true);
		
		if(UrlResolver.resolve(urlObj.pathname)){
			response.writeHead(200, {'Content-Type': 'text/html'});
			
			//TODO: implement basic environment in more gentle way

			var context={
					console:console,
					loadedModules:[],
					ARIES:getContext().ARIES
			};
			
			/** TODO: make it smoother, simplier and more obvious
				pay more attention to contexts and set up them more centalized.
			*/
			
			var controllerClass=new (ClassLoader.getClass(UrlResolver.resolve(urlObj.pathname).inFile,context))();
			
			//console.log(util.inspect(context));
			/**
			 * TODO: Zparser should be taken as a basis. Using similar engine we should precompile views 
			 * in pure Javascript this scripts will be used later to render view using the context
			 *  prepared by controller. On client side we can still use Zparser. 
			 */
			//var controllerClass=new context[UrlResolver.resolve(urlObj.pathname).mappingFunction.split("#")[0]]();
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
/**
 * request queue variable takes all tasks to handle inside. Represents Flow of request.
 */
var requestQueue=[];
/**
 * TODO: rewrite filters to be able to control flow from inside of filter
 * returns instance of filter object using path
 * @param path
 * @return
 */
function getFilter(path){
	/**
	 * set up context for filters
	 */
	var tmpContext=getContext();
	tmpContext.EventEmitter=eventsModule.EventEmitter;
	tmpContext.querystring=querystring;
	tmpContext.require=require;
	tmpContext.util=util;
	/**
	 * compile instance of filter object
	 */
	vm.runInNewContext(loadJsSource(path),tmpContext);
	return tmpContext[path.split("/")[path.split("/").length-1].replace(/\.js/,"")]();
}


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
	for(a in global){
		AriesContext[a]=global[a];
	}
	
	vm.runInNewContext(loadJsSource("./ariesjs.js"),AriesContext);
	vm.runInNewContext(loadJsSource("./zparse.js"),AriesContext);
	vm.runInNewContext(loadJsSource("./implementation.js"),AriesContext);
	vm.runInNewContext(loadJsSource("./AriesNodePlugin.js"),AriesContext);
	
	return AriesContext;
}



for(var i=0; i<CFG.filters.length; i++){
	requestQueue.push(getFilter(CFG.filters[i]));
	/**
	 * Filters are inherit event emitters to be able to emmit events. That makes possible to write them in
	 * asynchronus style. Filters should implement method "filter" and fire end event than all job will be done.
	 * */
}

/**
 * Set up handlers on requestQueue
 */
for(var i=0; i<requestQueue.length; i++){
	if(requestQueue[i+1]){
		var temporary=requestQueue[i+1];
		requestQueue[i].on("end", function(request, response){/**following anonymous function is necessary because scope is sharing otherwise*/
			temporary["filter"](request, response);
			});
	}else{
		requestQueue[i].on("end", appServer);
	}
}


/**
 * start server with tasks in 
 * requestQueue
 * Theoretically it would be great to put all flow inside this queue.
 * that means:
 * Filters->Controller->Interceptors->ViewRendering->more...
 * @param request
 * @param response
 * @return
 */
function startServerQueue(request, response){
	if(requestQueue.length==0){
		appServer(request, response);
	}else{
		requestQueue[0]["filter"](request, response);
	}
}

 http.createServer(function (request, response) {
	 
	 startServerQueue(request, response);

 }).listen(8124);

 console.log('Server running at http://127.0.0.1:8124/');

