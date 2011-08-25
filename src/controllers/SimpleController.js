/**
 * Hello world Constructor, also could be used to initialize 
 * object before running controller.
 */
function SimpleController(request ,response){
  
}


/**
 *@RequestMapping(value="/") 
 */
SimpleController.prototype.homepage = function(request, response){
    this.setView("ejsView.html");
    request.someVar = "Hallo user";
    this.doNext(request,response);    
};


/**
 *@RequestMapping(value="/details") 
 */
SimpleController.prototype.details = function(request, response){
    this.setView("ejsView.html");
    request.someVar = "here are details";
    this.doNext(request,response);    
};

