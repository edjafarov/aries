# AriesNode
Is a MVC web framework
features:

    * Annotation based configuration
    * asynchronous
    * flexible

##Controller example

        IO.import("./src/controllers/superController");

        /**
         *@Controller 
         */
        function customController(){
        }

        customController = ARIES.Extend(customController).by(superController);

        /**
        * @RequestMapping(value="/foo/{bar}")
        */
        customController.prototype.someAction = function (response, bar, request) {
            this.setView("customView.js");
            this.doNext(request, response);
        };

##How to install
It works out of the box in cloud9ide.com[http://cloud9ide.com]

just run main.js 




    