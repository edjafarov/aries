function DaoInterceptor(){
    }
    
DaoInterceptor.prototype.intercept=function(request, response)    {
        console.log("Dao Interceptor");
        this.doNext(request, response);
    }