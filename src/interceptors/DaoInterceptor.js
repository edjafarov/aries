function DaoInterceptor(){
    }
    
DaoInterceptor.prototype.intercept=function(request, response)    {
        console.log("Dao Interceptor");
        response.write("Dao Interceptor");
        this.doNext(request, response);
    }