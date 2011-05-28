function TestInterceptor(){
    }
    
TestInterceptor.prototype.intercept=function(request, response)    {
        console.log("TestInterceptor Interceptor");
        this.doNext(request, response);
    }