var ejs = require('ejs');

function EjsViewResolver(request, response) {}
EjsViewResolver.setView = function(request, response) {
    if(request.controllerConfig.autoDynaMap["Model"]){
        if(!request._Model) request._Model = {};
        request.controllerConfig.resolvedArguments[request.controllerConfig.autoDynaMap["Model"]] = request._Model;
    }
    return function(view , model) {
        if(model) request._Model = model;
        return request._View = view;
    }
}

EjsViewResolver.VIEWS_SOURCE_FOLDER = "./src/views/";

EjsViewResolver.prototype.resolve = function resolve(request, response) {
    if (request._View) {
        if(!request._Model) request._Model = {request: request,response: response};
		
		if(!request._Model.include || request._Model.include != include){
			request._Model.include = include;
		}
        
		function include(path){
			return ejs.render(ClassLoader.loadJsSource(EjsViewResolver.VIEWS_SOURCE_FOLDER + path), {
					locals: request._Model
			});
		}
		
        response.end(ejs.render(ClassLoader.loadJsSource(EjsViewResolver.VIEWS_SOURCE_FOLDER + request._View), {
            locals: request._Model
        }));
    }
    else {
        response.end("ERROR - no view found: " + request.view);
        console.error("ERROR - no view found: " + request.view);
    }
}

