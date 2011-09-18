var connect = require("connect");
var static = connect.static(__dirname + "/src/static");
/**
 * @Filter
 */
function StaticFilter(){}

StaticFilter.prototype.filter=function(request, response){
	var that=this;
	static(request, response, 
	function(){
		that.doNext(request, response);
	}
	);
}