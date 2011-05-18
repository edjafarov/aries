IO.import("./controllers/test3/test1050");

/**
 *@class
 *@Controller 
 *@Model
 *@RequestMapping(value="/test")
 */
function Sample(title){
	this.title=title?title:"simplePageTitle";
	this.content="Hallo ariesJs";
}


/**
* @RequestMapping(value="/tryIt/{dyna}/{gona}/{topa}")
*/
Sample.prototype.init = function (/**@test*/ response, dyna, request, /**@test1*/ topa, gona) {
	var form = ["<form action='/tryIt/rrr/ttt/yyy?test=tropo&guest=mono' method='post'>",
	"<input type='hidden' name='field1' value='this ia hidden field'/> <input name='field2' type='text' value=''/><input type='submit'/></form>"].join('');
	this.content="Hallo Dude! this Is dynamic test: "+dyna +" be nice with " + topa +" because "+gona + form;
	
	doNext(request, response);
	
	return AsyncModel(SamplePageModel, {resultId:"100500"}).AsyncView("main");
};


function SamplePageModel(){

}
SamplePageModel.prototype.field1;
SamplePageModel.prototype.field2;
SamplePageModel.prototype.array3=[];


/*<head.....*/


function SamplePageDao(){

}

SampleDao.getHomePage=function(resultId){
	var result=CallDB.getQuery("SELECT....");
	var page=new SamplePageModel();
	//... fill the data
}