

function ContextBoundedDispatcher(){


    var viewResolver=null;
    
    var filters=[];
    var interceptors=[];
    
    
    function Dispatch(request, response){
        var controller=ControllerResolver(request, response);
            if(!controller) {
                response.end("error");
                return false;
            }else{
                //Create sepatare context for request. This context will be used for 
                //all steps 
                request.context=vm.createContext({
                    console:console,
                    require:require,
                    ClassLoader:ClassLoader
                })
                flowInitializer(request, response);
                request.resolvedController = controller;
                (new request.context[ClassLoader.getClassName(filters[0])]).filter(request, response);
         }
    }
    
    function flowInitializer(request, response){
            for(var i=0;i<filters.length;i++){
                    var current = ClassLoader.getScript(filters[i]);
                    current.runInContext(request.context);
                }
                
            for(var i=0;i<interceptors.length;i++){
                    var current = ClassLoader.getScript(interceptors[i]);
                    current.runInContext(request.context);
                }
            
            ClassLoader.getScript(viewResolver).runInContext(request.context);
            
             for(var i=0;i<filters.length-1;i++){
                    var current = ClassLoader.getClassName(filters[i]);
                    var next = ClassLoader.getClassName(filters[i+1]);
                    request.context[current].prototype.doNext = function(className){
                        return function(request, response){
                            (new (request.context[className])()).filter(request, response);
                            }
                        }(next)
                }
                request.context[ClassLoader.getClassName(filters[filters.length-1])].prototype.doNext 
                = function(request, response){
                        var controller=request.resolvedController;
                        controller.prototype.doNext = function(request, response){
                                (new (request.context[ClassLoader.getClassName(interceptors[0])])()).intercept(request, response);
                            }
                        controller.prototype.setView = function (view){
                                    request.view = view;
                                }
                        new controller(request, response);
                }
                
             for(var i=0;i<interceptors.length-1;i++){
                    var current = ClassLoader.getClassName(interceptors[i]);
                    var next = ClassLoader.getClassName(interceptors[i+1]);
                    request.context[current].prototype.doNext = function(className){
                        return function(request, response){
                            (new (request.context[className])()).intercept(request, response);
                            }
                        }(next)
                }                
                
                request.context[ClassLoader.getClassName(interceptors[interceptors.length-1])].prototype.doNext 
                = function(request, response){
                      request.context[ClassLoader.getClassName(viewResolver)](request, response);
                }
        }

    function ControllerResolver(request, response){
            var urlObj=url.parse(request.url, true);
            var resolvedUrl=UrlResolver.resolve(urlObj.pathname);
            if( !resolvedUrl ) return false;
            var controllerPath=resolvedUrl.inFile;
            var controllerClass=ClassLoader.getClass(controllerPath, request.context);
            return controllerClass;
    }
    
   
	return {
        dispatch:function(request, response){
            Dispatch(request, response);
            
		},
        setFilters:function(filterArr){
            filters=filterArr;
        },
        setInterceptors:function(interceptorsArr){
            interceptors=interceptorsArr;
        },
        setViewResolver:function(view){
            viewResolver=view;
        }
	};
};