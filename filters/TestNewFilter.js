function TestNewFilter(){}
TestNewFilter.prototype.filter=function(request,response){
    console.debug("TestNewFilter filter filtering");
	this.doNext(request,response);
}

