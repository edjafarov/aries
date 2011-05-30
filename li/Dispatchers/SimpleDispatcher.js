

function SimpleDispatcher(){

    var flowQueue="";
    var flowQueueScript=null;
    
    var filters=[];
    var interceptors=[];
    
            

function getContext(){
	var AriesContext={};

	vm.runInNewContext(ClassLoader.loadJsSource("./ariesjs.js"),AriesContext);
	vm.runInNewContext(ClassLoader.loadJsSource("./zparse.js"),AriesContext);
	vm.runInNewContext(ClassLoader.loadJsSource("./implementation.js"),AriesContext);
	vm.runInNewContext(ClassLoader.loadJsSource("./AriesNodePlugin.js"),AriesContext);
	
	return AriesContext;
}
  

      
    var SourceBuilder=ClassLoader.getClass("./li/SourceBuilder.js");
       
       
    
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
    
 
    
    var DispatcherContext=vm.createContext({
        console:console,
        vm:vm,
        require:require,
        ARIES:getContext().ARIES,
        util:util,
        url:url,
        UrlResolver:UrlResolver,
        ClassLoader:ClassLoader,
        setTimeout:setTimeout
        });
 
  var  ViewResolver=ClassLoader.getClass("./li/ViewResolvers/SimpleViewResolver.js",{ClassLoader:ClassLoader});
       
        function Dispatch(request, response){
                    var controller=ControllerResolver(request, response);
                    if(!controller) {
                        response.end("error");
                        return false;
                    }else{
                        request.resolvedController=controller;
                        }
                    
                    (new firstFilterClassName()).filter(request, response);
            }
    

	return {
		initialize:function(){
            
            flowQueue+=ControllerResolver.toString()+"\n";
            flowQueue+=ViewResolver.toString()+"\n";
            flowQueue+=SourceBuilder().replaceContext(Dispatch, {firstFilterClassName:ClassLoader.getClassName(filters[0])})+"\n";
            
            for(var i=0; i<filters.length-1; i++){
                var nextItemClassName=ClassLoader.getClassName(filters[i+1]);
                var currentItemClassName=ClassLoader.getClassName(filters[i]);
                var currentClassSource=ClassLoader.loadJsSource(filters[i]);
                var itemSource=SourceBuilder(currentItemClassName,currentClassSource);
                itemSource.addPublicMethod(
                    function doNext(req, res){
                        (new nextItemClassName()).filter(req,res);
                    }
                    ,{nextItemClassName:nextItemClassName});
                 
                flowQueue+=itemSource.toString();
            }
            var currentItemClassName=ClassLoader.getClassName(filters[filters.length-1]);
            var currentClassSource=ClassLoader.loadJsSource(filters[filters.length-1]);
                var itemSource=SourceBuilder(currentItemClassName,currentClassSource);
                itemSource.addPublicMethod(function doNext(req, res){
                        var controller=req.resolvedController;
                       
                        controller.prototype.doNext = function(req, res){
                                (new firstInterceptor()).intercept(req, res);
                            }
                            controller.prototype.setView = function (view){
                                    req.view = view;
                                }
                            new controller(req, res);
                    },{firstInterceptor: ClassLoader.getClassName(interceptors[0])});

            flowQueue+=itemSource.toString();
           
            for(var i=0; i<interceptors.length-1; i++){
                var nextItemClassName=ClassLoader.getClassName(interceptors[i+1]);
                var currentItemClassName=ClassLoader.getClassName(interceptors[i]);
                var currentClassSource=ClassLoader.loadJsSource(interceptors[i]);
                var itemSource=SourceBuilder(currentItemClassName,currentClassSource);
                itemSource.addPublicMethod(
                    function doNext(req, res){
                        (new nextItemClassName()).intercept(req,res);
                    }
                    ,{nextItemClassName:nextItemClassName});
                 
                flowQueue+=itemSource.toString();       
                }
                
                var currentItemClassName=ClassLoader.getClassName(interceptors[interceptors.length-1]);
                var currentClassSource=ClassLoader.loadJsSource(interceptors[interceptors.length-1]);
                var itemSource=SourceBuilder(currentItemClassName,currentClassSource);
                itemSource.addPublicMethod(
                    function doNext(req, res){
                        //TODO: here is a potential bug because i need to set name directly
                            SimpleViewResolver(req, res);
                        }
                    );
                
                flowQueue+=itemSource.toString();            
                
            this.flowQueueScript=ClassLoader.getScriptFromSource(flowQueue, "./flowQueue.js");
            this.flowQueueScript.runInContext(DispatcherContext);
            return this.flowQueueScript;
        },
        dispatch:function(request, response){
            DispatcherContext.Dispatch(request, response);
            
		},
        setFilters:function(filterArr){
            filters=filterArr;
        },
        setInterceptors:function(interceptorsArr){
            interceptors=interceptorsArr;
        }
	};
};