function ControllerResolver(request, response){
            var urlObj=url.parse(request.url, true);
            var resolvedUrl=UrlResolver.resolve(urlObj.pathname);
            if(!resolvedUrl) return false;
            var controllerPath=resolvedUrl.inFile;
            var controllerClass=ClassLoader.getClass(controllerPath, {
                    console:console,
					ARIES:ARIES
			});
            return controllerClass;
    }
function SimpleViewResolver(request, response){
            if(request.view){
                    ClassLoader.getScript("./views/"+request.view).runInNewContext({response:response,request:request});
                }
                else{
                    response.end("ERROR - no view found");
            }
    }
function Dispatch(request, response){
                    var controller=ControllerResolver(request, response);
                    if(!controller) {
                        response.end("error");
                        return false;
                    }else{
                        request.resolvedController=controller;
                        }
                    
                    (new PostFilterNew()).filter(request, response);
            }
function PostFilterNew(){}
PostFilterNew.prototype.filter=function(request,response){

    console.debug("Post filter filtering");
    response.write("POST filter filtering");
	var content="";
	if (request.method === "POST") {
		      request.on('data', function (POST) {
		    	  content+=POST;      
		      });
		      request.on('end', function(){
		    	  var parsedPost=querystring.parse(content);
		    	  if(!request.params){
		    		  request.params={};
		    	  }
		    	  for(param in parsedPost){
		    		  request.params[param]=parsedPost[param];
		    	  }
		    	  this.doNext(request,response);
		      });
	}else{
   
		this.doNext(request,response);
	}
};


PostFilterNew.prototype.doNext=function doNext(req, res){
                        (new GetFilterNew()).filter(req,res);
                    }
function GetFilterNew(){}
GetFilterNew.prototype.filter=function(request,response){

    console.debug("Get filter filtering");
    response.write("Get filter filtering");
	  var parsedGet=require('url').parse(request.url, true).query;
	  if(!request.params){
		  request.params={};
	  }	
	  for(param in parsedGet){
		  request.params[param]=parsedGet[param];
	  }
 
	this.doNext(request,response);
}


GetFilterNew.prototype.doNext=function doNext(req, res){
                        var controller=req.resolvedController;
                       
                        controller.prototype.doNext = function(req, res){
                                (new TestInterceptor()).intercept(req, res);
                            }
                            controller.prototype.setView = function (view){
                                    req.view = view;
                                }
                            new controller(req, res);
                    }
function TestInterceptor(){
    }
    
TestInterceptor.prototype.intercept=function(request, response)    {
        console.log("TestInterceptor Interceptor");
        response.write("TestInterceptor Interceptor");
        this.doNext(request, response);
    }
TestInterceptor.prototype.doNext=function doNext(req, res){
                        (new DaoInterceptor()).intercept(req,res);
                    }
function DaoInterceptor(){
    }
    
DaoInterceptor.prototype.intercept=function(request, response)    {
        console.log("Dao Interceptor");
        response.write("Dao Interceptor");
        this.doNext(request, response);
    }
DaoInterceptor.prototype.doNext=function doNext(req, res){
                        (new MVCInterceptor()).intercept(req,res);
                    }
function MVCInterceptor(){
    }
    
MVCInterceptor.prototype.intercept=function(request, response)    {
        console.log("MVCInterceptor Interceptor");
        response.write("MVCInterceptor Interceptor");
        this.doNext(request, response);
    }
MVCInterceptor.prototype.doNext=function doNext(req, res){
                        //TODO: here is a potential bug because i need to set name directly
                            SimpleViewResolver(req, res);
                        }
