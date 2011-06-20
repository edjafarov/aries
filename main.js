var CONTROLLERS_PATH = "./controllers/";
var APP_CFG_PATH = "./src/app-cfg/";

var jsSCP = require('jsSourceCodeParser');
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
 
CFG = require("./lib/ConfigReader.js")(APP_CFG_PATH);



/**
 * Set Up Class Loader
 */
var ClassLoader=require(CFG.ClassLoader);
/**
 * Set Up Url resolver
 */
var UrlResolver = ClassLoader.getClass(CFG.UrlResolver,{CFG:CFG, console:console, util:util})();


console.log("Set up flow dispatcher...");
var FlowDispatcher=ClassLoader.getClass(CFG.Dispatcher,{
        console:console,
        vm:vm,
        require:require,
        util:util,
        url:urlModule,
        UrlResolver:UrlResolver,
        ClassLoader:ClassLoader,
        setTimeout:setTimeout
        }
);




var flowDispatcher = new FlowDispatcher();

flowDispatcher.filters = CFG.filters;
flowDispatcher.interceptors = CFG.interceptors;
flowDispatcher.viewResolver = CFG.ViewResolver;
console.log("Init flow dispatcher...");
flowDispatcher.init();

 http.createServer(function (request, response) {
	flowDispatcher.dispatch(request, response);
 }).listen(process.env.C9_PORT);

 console.log('Aries server running at http://127.0.0.1:'+process.env.C9_PORT);
 

