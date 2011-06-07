IO.import("./controllers/page");

/**
 *@Controller 
 */
function simplePage(){
	this.title="simplePageTitle";
	this.content="Hallo ariesJs";
  //  this.setView("simpleView.js");
//    this.doNext(req,res);
}

//simplePage = ARIES.Extend(simplePage).by(page);

/**
* @RequestMapping(value="/tryIt/{dyna}/{gona}/{topa}")
*/
simplePage.prototype.init = function (/**@test*/ response, dyna, request, /**@test1*/ topa, gona) {
	var form = ["<form action='/tryIt/rrr/ttt/yyy?test=tropo&guest=mono' method='post'>",
	"<input type='hidden' name='field1' value='this ia hidden field'/> <input name='field2' type='text' value=''/><input type='submit'/></form>"].join('');
	this.content="Hallo Dude! this Is dynamic test: "+dyna +" be nice with " + topa +" because "+gona + form;

};

/**
* @RequestMapping(value="/tryIto/{dyna}/{gona}/{topa}")
*/
simplePage.prototype.initStatic = function (test){
    }