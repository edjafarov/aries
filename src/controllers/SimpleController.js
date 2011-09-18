IO.import("./src/controllers/HalloWorldController");
/**
 * Hello world Constructor, also could be used to initialize 
 * object before running controller.
 */
function SimpleController(request ,response){
  
}


/**
 *@RequestMapping(value="/") 
 *@Override
 */
SimpleController.prototype.homepage = function(request, response){
    this.setView("ejsView.html");
    request.someVar = "Hallo user";
    this.doNext(request,response);    
};


/**
 *@RequestMapping(value="/details/{test}") 
 * 
 */
SimpleController.prototype.details = function(request, test , response, foo){
    this.setView("ejsView.html");
    request.pageName="details page";
    request.sectionName = test;
    request.paramFoo = foo;
    this.doNext(request,response);    
};

