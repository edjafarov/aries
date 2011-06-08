function TestInterceptor(){
    }
    
TestInterceptor.prototype.intercept=function(request, response)    {
        console.log("TestInterceptor Interceptor");
        response.write("TestInterceptor Interceptor");
        this.doNext(request, response);
    }