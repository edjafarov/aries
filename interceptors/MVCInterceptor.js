function MVCInterceptor(){
    }
    
MVCInterceptor.prototype.intercept=function(request, response)    {
        console.log("MVCInterceptor Interceptor");
        this.doNext(request, response);
    }