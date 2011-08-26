IO.import("./src/controllers/HalloWorldController");
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
 *@RequestMapping(value="/details/{test}") 
 */
SimpleController.prototype.details = function(request, test , response, foo){
    this.setView("ejsView.html");
    request.someVar = "Hi there. You are on a <b>details page</b> <br/>";
    request.someVar += "in <b>" +  test + "</b> section <br/>";
    request.someVar += "with foo param set to <b>" +  foo +"</b>";
    this.doNext(request,response);    
};

