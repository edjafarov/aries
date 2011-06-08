function ContextBoundedDispatcher(){

};


ContextBoundedDispatcher.prototype.init = function(){
    
    }

ContextBoundedDispatcher.prototype.viewResolver = null;
ContextBoundedDispatcher.prototype.filters = [];
ContextBoundedDispatcher.prototype.interceptors = [];

/**
 * 
 * 
 */

ContextBoundedDispatcher.prototype.dispatch = function dispatch(request, response){
        // resolving controller to save time. Resolved controller could be found in request.resolvedController
        var controller=this.ControllerResolver(request, response);
        if(!controller) {
            //TODO: put some error handling here
            response.end("Could not find Controller for this url");
            return false;
        }else{
            request.resolvedController = controller;
            this.startRequest(request, response);
        }
    }


ContextBoundedDispatcher.prototype.startRequest=function(request, response){
            //Create sepatare context for request. This context will be used for 
            //all steps
            request.context=vm.createContext({
                console:console,
                require:require,
                ClassLoader:ClassLoader
            })
            this.FlowInitializer(request, response);
            
            
            
            (new request.context[ClassLoader.getClassName(this.filters[0])]).filter(request, response);
    }

ContextBoundedDispatcher.prototype.ControllerResolver=function ControllerResolver(request, response){
            var urlObj=url.parse(request.url, true);
            var resolvedUrl=UrlResolver.resolve(urlObj.pathname);
            if( !resolvedUrl ) return false;
            var controllerPath=resolvedUrl.inFile;
            var controllerClass=ClassLoader.getClass(controllerPath, request.context);
            return controllerClass;
    }
    

    
ContextBoundedDispatcher.prototype.getDoNextFilter = function(className){
                            return function(request, response){
                                (new (request.context[className])()).filter(request, response);
                            }
                        } 

ContextBoundedDispatcher.prototype.getDoNextInterceptor = function(className){
                            return function(request, response){
                                (new (request.context[className])()).intercept(request, response);
                            }
                        } 

ContextBoundedDispatcher.prototype.getDoNextController = function(className){
            return function(request, response){
                        var controller=request.resolvedController;
                        controller.prototype.doNext = function(request, response){
                                (new (request.context[className])()).intercept(request, response);
                            }
                        controller.prototype.setView = function (view){
                                    request.view = view;
                                }
                        new controller(request, response);
                }                
            }


ContextBoundedDispatcher.prototype.FlowInitializer = function FlowInitializer(request, response){
            var that=this
            for(var i=0;i<this.filters.length;i++){
                    var current = ClassLoader.getScript(this.filters[i]);
                    current.runInContext(request.context);
                }
                
            for(var i=0;i<this.interceptors.length;i++){
                    var current = ClassLoader.getScript(this.interceptors[i]);
                    current.runInContext(request.context);
                }
            
            ClassLoader.getScript(this.viewResolver).runInContext(request.context);
            
             for(var i=0;i<this.filters.length-1;i++){
                    var current = ClassLoader.getClassName(this.filters[i]);
                    var next = ClassLoader.getClassName(this.filters[i+1]);
                    request.context[current].prototype.doNext = this.getDoNextFilter(next);
                }
                request.context[ClassLoader.getClassName(this.filters[this.filters.length-1])].prototype.doNext 
                = this.getDoNextController(ClassLoader.getClassName(this.interceptors[0]));
                
             for(var i=0;i<this.interceptors.length-1;i++){
                    var current = ClassLoader.getClassName(this.interceptors[i]);
                    var next = ClassLoader.getClassName(this.interceptors[i+1]);
                    request.context[current].prototype.doNext = this.getDoNextInterceptor(next);
                }                
                var viewResolver=this.viewResolver;
                request.context[ClassLoader.getClassName(this.interceptors[this.interceptors.length-1])].prototype.doNext 
                = function(request, response){
                      request.context[ClassLoader.getClassName(viewResolver)](request, response);
                }
        }
    
    
    