var connect = require("connect");
var logger = connect.logger();
/**
 * @Filter
 */
function LoggingFilter(){
}

LoggingFilter.prototype.filter=function(request, response){
	var that=this;
	logger(request, response, 
	function(){
		that.doNext(request, response);
	}
	);
}