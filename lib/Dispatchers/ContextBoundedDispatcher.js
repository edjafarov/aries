

function ContextBoundedDispatcher(){

    var flowQueue="";
    var flowQueueScript=null;
    
    var filters=[];
    var interceptors=[];
    
    var DispatcherContext=vm.createContext({
            console:console,
            require:require
        });
        
    
    
    function Dispatch(request, response){
        request.context=vm.createContext({
                console:console,
                require:require
            })
        flowInitializer(request, response);
        
        (new request.context[ClassLoader.getClassName(filters[0])]).filter(request, response);
        
        //console.log(ClassLoader.getClassName(filters[0]));
        //console.log(util.inspect(request.context[ClassLoader.getClassName(filters[0])].prototype));

        
        /*var controller=ControllerResolver(request, response);
        if(!controller) {
            response.end("error");
            return false;
        }else{
            //Create sepatare context for request. This context will be used for 
            //all step 
            request.context=vm.createContext({
                console:console,
                require:require
            });
            request.resolvedController = controller;
      
        }*/
    }
    
    function flowInitializer(request, response){
            
            var previousScript=null;
            for(var i=filters.length-2;i>=0;i--){
                console.debug(ClassLoader.getClassName(filters[i])+"!");
                var current = ClassLoader.getScript(filters[i]);
                current.runInContext(request.context);
                var previousClassName=ClassLoader.getClassName(filters[i+1]);
                
                request.context[ClassLoader.getClassName(filters[i])].prototype.doNext=function(className){
                    return function(request, response){
                            return request.context[className];
                        }
                }(previousClassName)
                previousScript=current;
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
    
 
    
 
    var  ViewResolver=ClassLoader.getClass("./lib/ViewResolvers/SimpleViewResolver.js",{ClassLoader:ClassLoader});
   

	return {
		initialize:function(){
        },

        dispatch:function(request, response){
            Dispatch(request, response);
            
		},
        setFilters:function(filterArr){
            filters=filterArr;
        },
        setInterceptors:function(interceptorsArr){
            interceptors=interceptorsArr;
        }
	};
};