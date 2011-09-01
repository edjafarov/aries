IO.import("./src/Models/Head");

/**
 * ModelView(default = "ejs/Page.html")
 */
function Page(){
    this.head = new Head();
    this.topTab = new TopTab();
    this.content = new Content();
}






