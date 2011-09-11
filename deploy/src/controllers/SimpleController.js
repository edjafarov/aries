/* look_at_the_bottom_imported ./src/controllers/HalloWorldController  */
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
 * 
 */
SimpleController.prototype.details = function(request, test , response, foo){
    this.setView("ejsView.html");
    request.pageName="details page";
    request.sectionName = test;
    request.paramFoo = foo;
    this.doNext(request,response);    
};

/**** imported ./src/controllers/HalloWorldController ****/
/**
 * Hello world Constructor, also could be used to initialize 
 * object before running controller.
 */
function HalloWorldController(req,res){
  
}


/**
 *@RequestMapping(value="/hello-world/{test}") 
 */
HalloWorldController.prototype.sayHallo = function(request, response, test){
    this.setView("simpleView.js");
    request.content = test;
    this.doNext(request,response);    
};

/**** imported END ./src/controllers/HalloWorldController ****/
