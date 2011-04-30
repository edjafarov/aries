var http = require('http');
var fs = require('fs');
var urlModule = require('url');
var util = require('util');
var vm = require('vm');


var obj={
	console:console,
	global:{},
	IO:function(){
	obj.global=10;
	console.log(33);
}
};

vm.runInNewContext("IO();console.log(global);", obj);