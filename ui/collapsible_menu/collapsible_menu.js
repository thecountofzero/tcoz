steal('can/control', function($) {

    window.TCOZ = window.TCOZ || {};
    window.TCOZ.UI = window.TCOZ.UI || {};

    window.TCOZ.UI.CollapsibleMenu = can.Control({

        defaults: {
            event: 'click',
            closeEvent: 'click'
        }
    }, {

        // Initialize the Status Panel
        init : function() {
            var self = this;

            this.menuItems = this.element.find('> li');

            this.menuItems.each(function(i, m) {
                var sub = $(m).find('ul.sub');
                if(sub.length) {
                    $(m).addClass('closed collapsible').find('ul').hide();
                }
            });
        },

        "{event}": function(el, ev) {
            this._toggle(el, ev);
        },

        "{closeEvent}": function(el, ev) {
            var opts = this.options;
            if(opts.event.toLowerCase() !== opts.closeEvent.toLowerCase()) {
                this._toggle(el, ev);
            }
        },

        _toggle: function(el, ev) {
            var target = $(ev.target);
            
            if(target.closest('li').hasClass('collapsible')) {
                var sub = el.find('ul.sub');
                if(sub.length) {
                    el.toggleClass('opened closed');
                    sub.slideToggle();
                }
            }
        },

        destroy: function() {

            this.menuItems.removeClass('opened closed collapsible');
            can.Control.prototype.destroy.call(this);
        }
    });
});