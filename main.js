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



var FlowDispatcher = function(){
	
    
    var flowQueue="";
    var flowQueueScript=null;
    
    var filters=[];
    var interceptors=[];
    
      
      
    var SourceBuilder=ClassLoader.getClass("./li/SourceBuilder.js");
       
       
    
    function ControllerResolver(request, response){
            var urlObj=url.parse(request.url, true);
            var resolvedUrl=UrlResolver.resolve(urlObj.pathname);
            if(!resolvedUrl) return false;
            var controllerPath=resolvedUrl.inFile;
            var controllerClass=ClassLoader.getClass(controllerPath, {
                    console:console,
					ARIES:ARIES
			});
            return controllerClass;
    }
    
 
    
    var DispatcherContext=vm.createContext({
        console:console,
        vm:vm,
        require:require,
        ARIES:getContext().ARIES,
        util:util,
        url:urlModule,
        UrlResolver:UrlResolver,
        ClassLoader:ClassLoader,
        setTimeout:setTimeout
        });
 
  var  ViewResolver=ClassLoader.getClass("./li/ViewResolvers/SimpleViewResolver.js",{ClassLoader:ClassLoader});
       
        function Dispatch(request, response){
                    var controller=ControllerResolver(request, response);
                    if(!controller) {
                        response.end("error");
                        return false;
                    }else{
                        request.resolvedController=controller;
                        }
                    
                    (new firstFilterClassName()).filter(request, response);
            }
    

	return {
		initialize:function(){
            
            flowQueue+=ControllerResolver.toString()+"\n";
            flowQueue+=ViewResolver.toString()+"\n";
            flowQueue+=SourceBuilder().replaceContext(Dispatch, {firstFilterClassName:ClassLoader.getClassName(filters[0])})+"\n";
            
            for(var i=0; i<filters.length-1; i++){
                var nextItemClassName=ClassLoader.getClassName(filters[i+1]);
                var currentItemClassName=ClassLoader.getClassName(filters[i]);
                var currentClassSource=ClassLoader.loadJsSource(filters[i]);
                var itemSource=SourceBuilder(currentItemClassName,currentClassSource);
                itemSource.addPublicMethod(
                    function doNext(req, res){
                        (new nextItemClassName()).filter(req,res);
                    }
                    ,{nextItemClassName:nextItemClassName});
                 
                flowQueue+=itemSource.toString();
            }
            var currentItemClassName=ClassLoader.getClassName(filters[filters.length-1]);
            var currentClassSource=ClassLoader.loadJsSource(filters[filters.length-1]);
                var itemSource=SourceBuilder(currentItemClassName,currentClassSource);
                itemSource.addPublicMethod(function doNext(req, res){
                        var controller=req.resolvedController;
                       
                        controller.prototype.doNext = function(req, res){
                                (new firstInterceptor()).intercept(req, res);
                            }
                            controller.prototype.setView = function (view){
                                    req.view = view;
                                }
                            new controller(req, res);
                    },{firstInterceptor: ClassLoader.getClassName(interceptors[0])});

            flowQueue+=itemSource.toString();
           
            for(var i=0; i<interceptors.length-1; i++){
                var nextItemClassName=ClassLoader.getClassName(interceptors[i+1]);
                var currentItemClassName=ClassLoader.getClassName(interceptors[i]);
                var currentClassSource=ClassLoader.loadJsSource(interceptors[i]);
                var itemSource=SourceBuilder(currentItemClassName,currentClassSource);
                itemSource.addPublicMethod(
                    function doNext(req, res){
                        (new nextItemClassName()).intercept(req,res);
                    }
                    ,{nextItemClassName:nextItemClassName});
                 
                flowQueue+=itemSource.toString();       
                }
                
                var currentItemClassName=ClassLoader.getClassName(interceptors[interceptors.length-1]);
                var currentClassSource=ClassLoader.loadJsSource(interceptors[interceptors.length-1]);
                var itemSource=SourceBuilder(currentItemClassName,currentClassSource);
                itemSource.addPublicMethod(
                    function doNext(req, res){
                        //TODO: here is a potential bug because i need to set name directly
                            SimpleViewResolver(req, res);
                        }
                    );
                
                flowQueue+=itemSource.toString();            
                
            this.flowQueueScript=ClassLoader.getScriptFromSource(flowQueue, "./flowQueue.js");
            this.flowQueueScript.runInContext(DispatcherContext);
            return this.flowQueueScript;
        },
        dispatch:function(request, response){
            DispatcherContext.Dispatch(request, response);
            
		},
        setFilters:function(filterArr){
            filters=filterArr;
        },
        setInterceptors:function(interceptorsArr){
            interceptors=interceptorsArr;
        }
	};
};

var flowDispatcher = FlowDispatcher(null);

flowDispatcher.setFilters(CFG.filters);
flowDispatcher.setInterceptors(CFG.interceptors);

var ss=flowDispatcher.initialize();



/**
 * request queue variable takes all tasks to handle inside. Represents Flow of request.
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
	for(a in global){
		AriesContext[a]=global[a];
	}
	
	vm.runInNewContext(loadJsSource("./ariesjs.js"),AriesContext);
	vm.runInNewContext(loadJsSource("./zparse.js"),AriesContext);
	vm.runInNewContext(loadJsSource("./implementation.js"),AriesContext);
	vm.runInNewContext(loadJsSource("./AriesNodePlugin.js"),AriesContext);
	
	return AriesContext;
}



 http.createServer(function (request, response) {
	flowDispatcher.dispatch(request, response);
 }).listen(process.env.C9_PORT);

 console.log('Server running at http://127.0.0.1:8124/');

