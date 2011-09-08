var CONTROLLERS_PATH = "./controllers/";
var APP_CFG_PATH = "./src/app-cfg/";


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

console.log(util.inspect(CFG), false, 7);


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
var UrlResolver = ClassLoader.getClass(CFG.UrlResolver,{CFG:CFG, console:console, util:util, urlModule:urlModule})();


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




var flowDispatcher = new FlowDispatcher(CFG);



 http.createServer(function (request, response) {
	flowDispatcher.dispatch(request, response);
 }).listen(process.env.C9_PORT?process.env.C9_PORT:process.env.PORT);

 console.log('Aries server running at http://localhost:'+process.env.PORT);
 

