var ARIES = require('../ariesjs.js');
ARIES.Plugins["AriesNode"] = require('../AriesNodePlugin.js');
var page = require('./page.js');

function simplePage(){
    this.title="simplePageTitle";
	this.content="Hallo ariesJs";
}

simplePage = ARIES.Extend(simplePage).by(page);

/**
*@Controller
*@requestmapping(url="/hotel/{cityId}")
*/
exports.constructor = function () {
	return new simplePage();
};
