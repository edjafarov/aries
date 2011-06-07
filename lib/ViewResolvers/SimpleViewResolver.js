function SimpleViewResolver(request, response){
    }
    
SimpleViewResolver.prototype.resolve = function resolve(request, response){
            if(request.view){
                    ClassLoader.getScript("./views/"+request.view).runInNewContext({response:response,request:request});
                }
                else{
                    response.end("ERROR - no view found: " + request.view);
            }
    }    