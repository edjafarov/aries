
function AriesSiteController(){
}

/**
 *@RequestMapping(value="/") 
 */
AriesSiteController.prototype.homepage = function(request, response){
    this.setView("/ejs/Layout.html",
	{
	head:
		{title:"aries-node: {hallo there!}"},
		bodyPath:"/ejs/homePageBody.html",	
		topNavBar:{activeItem:"/"}
	});
    
    this.doNext(request,response);    
};

/**
 *@RequestMapping(value="/docs") 
 */
AriesSiteController.prototype.docpage = function(request, response){
    this.setView("/ejs/Layout.html",
	{
	head:
		{title:"aries-node: {hallo there!}"},
	bodyPath:"/ejs/documentBody.html",
	topNavBar:{activeItem:"/docs"}
	});
    
    this.doNext(request,response);    
};

/**
 *@RequestMapping(value="/about") 
 */
AriesSiteController.prototype.aboutpage = function(request, response){
    this.setView("/ejs/Layout.html",
	{
	head:
		{title:"aries-node: {hallo there!}"},
	bodyPath:"/ejs/documentBody.html",
	topNavBar:{activeItem:"/about"}
	});
    
    this.doNext(request,response);    
};
