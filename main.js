var CONTROLLERS_PATH = "./controllers/";
var APP_CFG_PATH = "./app-cfg/";

var http = require('http');
var fs = require('fs');
var urlModule = require('url');
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
var CFG=eval("("+ CFG_FILE + ")");
console.debug(CFG);
console.debug("*** starting " + CFG.name + " webapp version " + CFG.ver + " ***");

var urlMappings={};
console.log("parsing urlMappings....\n");

for(cfgMapping in CFG.urlMapping){
    console.log("reading filename " + APP_CFG_PATH + CFG.urlMapping[cfgMapping]);
	URL_MAPPING_FILE = fs.readFileSync(APP_CFG_PATH + CFG.urlMapping[cfgMapping]);
	console.debug("parsing " + APP_CFG_PATH + CFG.urlMapping[cfgMapping]);
	URL_MAPPING = eval("("+ URL_MAPPING_FILE + ")");
	for(url in URL_MAPPING){
		try{
			var stats=fs.lstatSync(CONTROLLERS_PATH + URL_MAPPING[url] + ".js");
			if(stats.isFile()){
				console.debug("url: " + url + " mapped to " + URL_MAPPING[url] + "class");
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

/**/
 http.createServer(function (request, response) {
 /**
 *URL PARSING
  */

	for(var i=0; i< Filters.length; i++){
		Filters[i](request, response)
	}
	var urlObj=urlModule.parse(request.url, true);
	
	if(urlMappings[urlObj.pathname]){
		response.writeHead(200, {'Content-Type': 'text/html'});
		var resolvedController = require(CONTROLLERS_PATH + urlMappings[urlObj.pathname] + ".js");
		var pageObject=resolvedController.constructor(urlObj.query);
		response.end(pageObject.renderView());
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
  
    
 }).listen(process.env.C9_PORT);

 console.log('Server running at http://127.0.0.1:8124/');

