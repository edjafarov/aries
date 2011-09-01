function SimpleViewResolver(request, response) {}
SimpleViewResolver.setView = function(request, response) {
    return function(view) {
        return request.view = view;
    }
}
SimpleViewResolver.prototype.resolve = function resolve(request, response) {
    if (request.view) {
        ClassLoader.getScript("./src/views/" + request.view).runInNewContext({
            response: response,
            request: request
        });
    }
    else {
        response.end("ERROR - no view found: " + request.view);
    }
}