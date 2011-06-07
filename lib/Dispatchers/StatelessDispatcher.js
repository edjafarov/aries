IO.import("./ariesjs");
IO.import("./lib/Dispatchers/ContextBoundedDispatcher");

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
    var viewResolver = this.viewResolver;
    this.dispatcherContext[ClassLoader.getClassName(this.interceptors[this.interceptors.length - 1])].prototype.doNext = function (request, response) {
        this.dispatcherContext[ClassLoader.getClassName(viewResolver)](request, response);
    };
};