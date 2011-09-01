/**
 * This dispatcher will share one context between a request.
 * @author Eldar Djafarov
 */

function Dispatcher(CFG) {
    this.filters = CFG.filters;
    this.interceptors = CFG.interceptors;
    this.viewResolver = CFG.ViewResolver;
    this.init();
}
Dispatcher.prototype.viewResolver = null;
Dispatcher.prototype.filters = [];
Dispatcher.prototype.interceptors = [];
Dispatcher.prototype.dispatch = function dispatch(request, response) {
    /**
     * resolving controller to save time. Resolved controller could be found in request.resolvedController
     * potentially context of request will be inside request.
     * This is done to improve performance
     */
    var that = this;
    this.requestNormalizer(request, response, function(req, res) {
        var controller = that.ControllerResolver(request, response);
        if (!controller) {
            //TODO: put some error handling here
            response.end("Could not find Controller for this url");
            return false;
        }
        else {
            request.resolvedController = controller;
            that.startRequest(request, response);
        }
    });
}
/**
 * Important:
 * context is one for all dispatcher instances
 * It is App context really. Put all Classes there.
 * So actulally all classes defined in one global scope.
 */
Dispatcher.prototype.dispatcherContext = vm.createContext({
    console: console,
    vm: vm,
    require: require,
    util: util,
    url: url,
    UrlResolver: UrlResolver,
    ClassLoader: ClassLoader,
    setTimeout: setTimeout
});
Dispatcher.prototype.getFromAppScope = function(path) {
    return this.dispatcherContext[ClassLoader.getClassName(path)];
};
Dispatcher.prototype.startRequest = function(request, response) {
    if (this.filters.length > 0) {
        this.startRequest = function(request, response) {
            var filterConstructor = this.getFromAppScope(this.filters[0]);
            (new filterConstructor()).filter(request, response);
        };
        
    }
    else {
        this.startRequest = this.getDoNextController();
    }
    this.startRequest(request, response);
};
Dispatcher.prototype.ControllerResolver = function ControllerResolver(request, response) {
    var resolvedUrl = UrlResolver.resolve(request, response);
    if (!resolvedUrl) return false;
    request.controllerConfig = resolvedUrl;
    //TODO:do here
    var controllerPath = resolvedUrl.filePath;
    var controllerClass = this.dispatcherContext[ClassLoader.getClassName(controllerPath)];
    if (!controllerClass) {
        /**
         * Initialize controllers on a fly
         * probably from perfomance view it is better to just initilize all of them at once
         * in .init()
         */
        controllerClass = ClassLoader.getClass(controllerPath, this.dispatcherContext);
        if (this.interceptors.length > 0) {
            controllerClass.prototype.doNext = this.getDoNextInterceptor(ClassLoader.getClassName(this.interceptors[0]));
        }
        else {
            controllerClass.prototype.doNext = this.getViewResolver();
        }
    }
    //TODO: this place desperately needs optimizatio
    controllerClass.prototype.setView = this.dispatcherContext[ClassLoader.getClassName(this.viewResolver)].setView(request, response);
    return controllerClass;
};
Dispatcher.prototype.getDoNextFilter = function(className) {
    var self = this;
    return function(request, response) {
        (new(self.dispatcherContext[className])()).filter(request, response);
    };
};
Dispatcher.prototype.getDoNextInterceptor = function(className) {
    var self = this;
    return function(request, response) {
        (new(self.dispatcherContext[className])()).intercept(request, response);
    };
}
Dispatcher.prototype.getDoNextController = function() {
    return function(request, response) {
        //TODO:do here
        var controller = request.resolvedController;
        var instance = new controller(request, response);
        instance[request.controllerConfig.controllerMethod].apply(instance, request.controllerConfig.resolvedArguments);
    };
};
Dispatcher.prototype.getViewResolver = function() {
    var that = this;
    return function(request, response) {
        (new(that.dispatcherContext[ClassLoader.getClassName(that.viewResolver)])()).resolve(request, response);
    };
};
/**
 * Initialize most of chain for dispatching.
 * 
 */
Dispatcher.prototype.init = function init() {
    /**
     * Run all Filters/Interceptors in common context
     * 
     */
    for (var i = 0; i < this.filters.length; i++) {
        var current = ClassLoader.getScript(this.filters[i]);
        console.debug("Putting " + this.filters[i] + " in Dispatcher context.");
        current.runInContext(this.dispatcherContext);
    }
    for (var i = 0; i < this.interceptors.length; i++) {
        var current = ClassLoader.getScript(this.interceptors[i]);
        console.debug("Putting " + this.interceptors[i] + " in Dispatcher context.");
        current.runInContext(this.dispatcherContext);
    }
    ClassLoader.getScript(this.viewResolver).runInContext(this.dispatcherContext);
    /**
     * Build a chain of Filters->Controller->Interceptors->ViewResolver
     * TODO: put the case if we have no filters
     */
    for (var i = 0; i < this.filters.length - 1; i++) {
        var current = ClassLoader.getClassName(this.filters[i]);
        var next = ClassLoader.getClassName(this.filters[i + 1]);
        this.dispatcherContext[current].prototype.doNext = this.getDoNextFilter(next);
    }
    if (this.filters.length > 0) {
        this.dispatcherContext[ClassLoader.getClassName(this.filters[this.filters.length - 1])].prototype.doNext = this.getDoNextController();
    }
    //TODO: put the case if we have no interceptors
    for (var i = 0; i < this.interceptors.length - 1; i++) {
        var current = ClassLoader.getClassName(this.interceptors[i]);
        var next = ClassLoader.getClassName(this.interceptors[i + 1]);
        this.dispatcherContext[current].prototype.doNext = this.getDoNextInterceptor(next);
    }
    if (this.interceptors.length > 0) {
        this.dispatcherContext[ClassLoader.getClassName(this.interceptors[this.interceptors.length - 1])].prototype.doNext = this.getViewResolver();
    }
};

Dispatcher.prototype.requestNormalizer = function(request, response, callback) {
    /* parse Get request */
    var parsedGet = url.parse(request.url, true).query;
    if (!request.params) {
        request.params = {};
    }
  
  for (param in parsedGet) {
        request.params[param] = parsedGet[param];
    }
    /* parse post request */
    var content = "";
    if (request.method === "POST") {
        request.on('data', function(POST) {
            content += POST;
        });
        request.on('end', function() {
            var parsedPost = querystring.parse(content);
            if (!request.params) {
                request.params = {};
            }
            for (param in parsedPost) {
                request.params[param] = parsedPost[param];
            }
            callback(request, response);
        });
    }else{
        callback(request, response);
    }
}