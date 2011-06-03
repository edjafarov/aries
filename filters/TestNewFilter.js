function TestNewFilter(){}
TestNewFilter.prototype.filter=function(request,response){
    console.debug("TestNewFilter filter filtering");
	console.log(this.doNext(request,response));
}

