
function head(){
}

head = ARIES.Extend(head).core();

head.makeAriesNode();

head.prototype.title=null;

head.prototype.setTitle= function(title){
	this.title=title;
};


head.prototype.view= "<head><title>${title}</title></head>";



