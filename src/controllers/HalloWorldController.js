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

