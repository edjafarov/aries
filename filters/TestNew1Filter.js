function TestNew1Filter(){}
TestNew1Filter.prototype.filter=function(request,response){
    console.debug("TestNew1Filter filter filtering");
    this.doNext(request,response);
}

