

var ARIES = require('../ariesjs.js');
ARIES.Plugins["AriesNode"] = require('../AriesNodePlugin.js');
var head = require('./head.js');


function page(){
    this.head = new head();
	this.head.setTitle("This title is setted up by page");
}

page = ARIES.Extend(page).core();

module.exports = page;

page.makeAriesNode();

page.prototype.title = null;
page.prototype.meta = null;
page.prototype.description = null;
page.prototype.cssList = null;
page.prototype.javascriptList = null;
page.prototype.content = null;
page.prototype.head = null;


page.prototype.view = ["<html><head>${head}</head>"
,"<body>${content}</body>"
,"</html>"].join("");

