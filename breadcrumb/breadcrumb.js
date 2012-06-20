steal('can/control', 'can/view/ejs', 'can/route', 'can/control/route', function($) {

    can.Control("TCOZ.Breadcrumb", {
    }, {
        init : function() {
            var self = this;
            this.setContent(can.route.attr());
            //this.element.append('<header class="title breadcrumb"><h5></h5></header>');
            //this.content = this.element.find('h5');
        },

        _setContent: function(content) {
            console.log('content: ' + content);
            this.element.html(content);
        },

        "{can.route} app": "setContent",

        setContent: function(data) {
            this._setContent(data.app);
        }
    });
});