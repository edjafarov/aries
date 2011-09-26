#!/usr/bin/env node

var SRC_PATH = "./src";
var PORT = process.env.PORT || process.env.npm_package_config_port;
var HOST = process.env.npm_package_config_host || "";
process.argv.forEach(function (val, index, array) {
  if(val.indexOf("src=") != -1){
	SRC_PATH = val.slice(val.indexOf("src=")+"src=".length);
  }
  if(val.indexOf("port=") != -1){
	PORT = val.slice(val.indexOf("port=")+"port=".length);
  }
  if(val.indexOf("host=") != -1){
	HOST = val.slice(val.indexOf("host=")+"host=".length);
  }

});


var http = require('http');
var fs = require('fs');
var urlModule = require('url');
var util = require('util');
var vm = require('vm');
var eventsModule = require('events');
var querystring = require('querystring');
var logger = require('log4js').getLogger();
var path = require('path');

SRC_PATH = fs.realpathSync(SRC_PATH);
/**
 *Read configuration:
 * @params
 * name [String] application name
 * ver [String] application version
 * urlMapping [Array<String>] array of url mapping filenames 
 */
 
CFG = require("./lib/ConfigReader.js")(SRC_PATH);

logger.log(util.inspect(CFG), false, 7);


/* TODO: need to rewrite inside ClassLoader exception handling in order to resolve
 * imports
process.on('uncaughtException', function (err) {
  //console.log('Caught exception: ' + err);
    console.error("There was an internal error in Node's debugger. " +
        'Please report this bug.');
    console.error(e.message);
    console.error(e.stack);
});
*/
/**
 * Set Up Class Loader
 */
var ClassLoader=require(CFG.ClassLoader);
/**
 * Set Up Url resolver
 */
var UrlResolver = ClassLoader.getClass(path.join(__dirname ,CFG.UrlResolver),{CFG:CFG, console:console, util:util, require:require})();


console.log("Set up flow dispatcher...");
var FlowDispatcher=ClassLoader.getClass(path.join(__dirname ,CFG.Dispatcher),{
        console:logger,
        vm:vm,
        require:require,
        util:util,
        url:urlModule,
        UrlResolver:UrlResolver,
        ClassLoader:ClassLoader,
        setTimeout:setTimeout,
		__dirname:__dirname
        }
);




var flowDispatcher = new FlowDispatcher(CFG);



 http.createServer(function (request, response) {
	flowDispatcher.dispatch(request, response);
 }).listen(PORT);

 console.log('Aries server running at http://'+ HOST+':'+PORT);
