/**** imported ****/
/**
 * ARIES project
 *
 * Copyright (c) 2009 Eldar Djafarov
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
/**
 * Basic concepts:
 * this is a core ARIES lbrary.
 * My intention is to make simple and highly extendible library
 * which will implement basic clasical inheritance.
 * The core feature of library is the constructor overriding.
 *
 * TODO: namespaces/libraries
 *	1. ARIES.events. - standart browser events handling<br/>
 *	implementation should be as simple as possible. Only basic<br/>
 *	features should be implemented. This will not be super featured<br/>
 *	library but it must be usable without 3dparty js.<br/>
 *	2. ARIES.customEvents. - custom events handling<br/>
 *	this library is necessary to work with components and to make<br/>
 *	DOM to JS binding tight.<br/>
 *	3. ARIES.xpath - get dom elements by xpath<br/>
 *	this library will provide interface to 3dparty xpath library.<br/>
 *	Since xpath is a very poverfull tecnology to work with xml. I<br/>
 *	think we should use it.<br/>
 *	4. ARIES.query - get dom elements by jQuery query<br/>
 * 	this library will empover basic library with jQuery<br/>
 *
 *	TODO: aliase/
 *	A = ARIES
 *
 *	TODO: features/
 *	1. implement smart initialization for every library.
 *	this initialization will consist of a piece of code in the
 *	beginning of every module which allows to load them in any order.
 *	library will implement itself properly when core class will be loaded
 *	2. implement possibility to get elements in jQuery style with
 *	following syntaxis:
 *	DomElement||<DomElement> A(id||xpath||jquery css selectors) - return elements
 */
var ARIES = new (function (){
    /**
     * Private namespace.
     */
    var CORE={
			/**
			 * CORE is an instance of basic object. Every new object will
			 * inherit this one
			 * rototype.destroy() is destructor
			 */

					destroy: function(){
						delete this;
					}

			};

	this.Plugins = {};
	this.Ext = {};

	/**
	 * TODO: this will be interesting syntaxis. It will implement
	 * something like this:
	 * function Aclass(){
	 * 		//constructor blablabla
	 * }
	 * Aclass.prototype.method1=function(){
	 *      //method implementation
	 * }
	 * Aclass.prototype.method2=function(){
	 *      //method implementation
	 * }
	 * ARIES.Extend(Aclass);
	 */
	this.Extend=function Extend(sub){

		// we need to put additional element in prototype chain
		var T=function T(){
		};
        var Plugins = this.Plugins;
		// Extending of a constructor
		var newConst=function(){// MAGIC
			var ret=new T();
			var rcon=sub.apply(ret, arguments);
			ret = rcon?rcon:ret;
			// since here a mess with instanceof stuff we need
			// to make some substitute
			ret.isInstanceOf= function (testConstr){
					if(testConstr._originalConstructor){
						return sub == testConstr._originalConstructor;
					}
					else{
						return sub == testConstr;
					}
				};
            return ret;
		};

        for(plugin in Plugins){
		
            newConst ["make" + plugin] = function(){
                for(method in Plugins[plugin]){
                    T.prototype[method] = Plugins[plugin][method]; 
                }
            }
        }

		// link to original non messed constructor
		newConst._originalConstructor = sub;


		return{
            /**
             * extends by core functionality
             */
			core:function(){
				function F(){}
				F.prototype=CORE;
				T.prototype=new F();

				// alternative way to create instances
				newConst.create=newConst;
				newConst.prototype=T.prototype;
				// standard behavior setup
				newConst.prototype.constructor=newConst;
				newConst.superclass=T.prototype.constructor;
				return newConst;
			},
            /**
             * allows to extend by any constuctor
             * @param sup
             */
			by:function(sup){
				T.prototype=new sup();
				// alternative way to create instances
				newConst.create=newConst;

				// standard behavior setup
				newConst.prototype=T.prototype;
				newConst.prototype.constructor=newConst;
				newConst.superclass=sup;
				return newConst;

				//Extend by something
			},
            /**
             * this function allows to make singleton out of any constructor
             */
			singletonize:function(){
				var instance = null;
				return function singletonConstructor(){
					if(!instance){
						instance=new sub(arguments);
					}
					return instance;
				};
			}
		};
	};
})();



/**** imported ****/
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
    
    
    

function StatelessDispatcher() {

}

StatelessDispatcher = ARIES.Extend(StatelessDispatcher).by(ContextBoundedDispatcher);


/**
 * Cahce instanceo of classes
 * all instances are stored in key-value store
 * and can be reused
 */
StatelessDispatcher.prototype.cache = function cache() {
    var instances = {};
    return {
        put: function (className, constructor) {
            className = ClassLoader.getClassName(className);
            instances[className] = new constructor();
            return instances[className];
        },
        get: function (className) {
            if (!instances[className]) return false;
            return instances[className];
        }
    };
}();



StatelessDispatcher.prototype.dispatcherContext = vm.createContext({
    console: console,
    vm: vm,
    require: require,
    ARIES: ARIES,
    util: util,
    url: url,
    UrlResolver: UrlResolver,
    ClassLoader: ClassLoader,
    setTimeout: setTimeout
});



StatelessDispatcher.prototype.startRequest = function (request, response) {
    this.cache.get(ClassLoader.getClassName(this.filters[0])).filter(request, response);
};

StatelessDispatcher.prototype.ControllerResolver = function ControllerResolver(request, response) {

    var urlObj = url.parse(request.url, true);
    var resolvedUrl = UrlResolver.resolve(urlObj.pathname, request, response);
    if (!resolvedUrl) return false;
    var controllerPath = resolvedUrl.inFile;
    
    // save controller configuration for future since we got argumentsToPass array there
    request.controllerConfig = resolvedUrl;
    var controllerInstance = this.cache.get(controllerPath);
    if (!controllerInstance) {
        var controllerClass = ClassLoader.getClass(controllerPath, this.dispatcherContext);
        controllerClass.prototype.setView = function (view) {
            request.view = view;
        };
        controllerClass.prototype.doNext = this.getDoNextInterceptor(ClassLoader.getClassName(this.interceptors[0]));
        controllerInstance = this.cache.put(controllerPath, controllerClass);
    }
    
    return controllerInstance;
};


StatelessDispatcher.prototype.getDoNextFilter = function (className) {
    var self = this;
    return function (request, response) {
        self.cache.get(className).filter(request, response);
    };
};

StatelessDispatcher.prototype.getDoNextInterceptor = function (className) {
    var self = this;
    return function (request, response) {
        self.cache.get(className).intercept(request, response);
    };
};


StatelessDispatcher.prototype.getDoNextController = function (className) {
    return function (request, response) {
        var controller = request.resolvedController;
        controller[request.controllerConfig.mappingMethodName].apply(controller, request.controllerConfig.argumentsToPass);
    };
};


StatelessDispatcher.prototype.init = function init() {

    for (var i = 0; i < this.filters.length; i++) {
        var current = ClassLoader.getScript(this.filters[i]);
        current.runInContext(this.dispatcherContext);
        this.cache.put(this.filters[i], this.dispatcherContext[ClassLoader.getClassName(this.filters[i])]);
    }

    for (var i = 0; i < this.interceptors.length; i++) {
        var current = ClassLoader.getScript(this.interceptors[i]);
        current.runInContext(this.dispatcherContext);
        this.cache.put(this.interceptors[i], this.dispatcherContext[ClassLoader.getClassName(this.interceptors[i])]);
    }

    ClassLoader.getScript(this.viewResolver).runInContext(this.dispatcherContext);
    
    this.cache.put(this.viewResolver, this.dispatcherContext[ClassLoader.getClassName(this.viewResolver)]);



    for (var i = 0; i < this.filters.length - 1; i++) {
        var current = ClassLoader.getClassName(this.filters[i]);
        var next = ClassLoader.getClassName(this.filters[i + 1]);
        this.dispatcherContext[current].prototype.doNext = this.getDoNextFilter(next);
    }


    this.dispatcherContext[ClassLoader.getClassName(this.filters[this.filters.length - 1])].prototype.doNext = this.getDoNextController(ClassLoader.getClassName(this.interceptors[0]));

    for (var i = 0; i < this.interceptors.length - 1; i++) {
        var current = ClassLoader.getClassName(this.interceptors[i]);
        var next = ClassLoader.getClassName(this.interceptors[i + 1]);
        this.dispatcherContext[current].prototype.doNext = this.getDoNextInterceptor(next);
    }
    
    var that=this;
    this.dispatcherContext[ClassLoader.getClassName(this.interceptors[this.interceptors.length - 1])].prototype.doNext = function (request, response) {
        that.cache.get(ClassLoader.getClassName(that.viewResolver)).resolve(request, response);
    };
};