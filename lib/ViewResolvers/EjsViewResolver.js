var ejs = require('ejs');

function EjsViewResolver(request, response) {}

EjsViewResolver.prototype.resolve = function resolve(request, response) {
    if (request.view) {
        response.end(ejs.render(ClassLoader.loadJsSource("./src/views/" + request.view),
        {locals:{request:request, response:response}}));
        
    }
    else {
        response.end("ERROR - no view found: " + request.view);
    }
}