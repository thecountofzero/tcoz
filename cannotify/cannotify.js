steal('can/control',
    'can/view/ejs',
    './cannotify.css', function($) {

    window.TCOZ = window.TCOZ || {};

    window.TCOZ.CanNotify = can.Control({

        defaults: {
            message: 'Replace with your message...',
            state: 'info',
            hideable: true,
            localize: true,
            locales: 'tcoz/cannotify/locales',
            localizizationLib: '//tcoz/lib/localization/localization.js'
        }
    }, {

        init : function() {
            var self = this,
                opts = this.options,
                states = {
                    'info': {
                        'class': 'nInformation',
                        'label': 'Information'
                    },
                    'success': {
                        'class': 'nSuccess',
                        'label': 'Success'
                    },
                    'warning': {
                        'class': 'nWarning',
                        'label': 'Warning'
                    },
                    'error': {
                        'class': 'nError',
                        'label': 'Error'
                    },
                    'lightbulb': {
                        'class': 'nLightbulb',
                        'label': 'Idea'
                    },
                    'email': {
                        'class': 'nMessages',
                        'label': 'Messages'
                    }
                },
                create = function(state) {
                    self.element.append(can.view(steal.root.join('tcoz/cannotify/views/cannotify').path, {
                        state: state,
                        message: opts.message,
                        hideable: opts.hideable
                    }));
                },
                currentState = states[opts.state];

            if(opts.localize) {
                this._localize(currentState, create);
            }
            else {
                create(currentState);
            }
        },

        _createLocalized: function(stateObj, cb) {
            stateObj.label = tcoz.localization.translate('cannotify.' + this.options.state, stateObj.label);
            cb(stateObj);
        },

        _localize: function(stateObj, cb) {
            var self = this,
                opts = this.options,
                localize = function() {
                    tcoz.localization.init().loadDictionary(steal.root.join(opts.locales).path, function() {
                        self._createLocalized(stateObj, cb);
                    });
                };

            // Check if the localization library has been loaded
            if(window.tcoz && window.tcoz.localization) {
                localize();
            }
            else {  // If not, load it now
                steal.apply(null, [opts.localizizationLib]).then(function(l) {
                    localize();
                });

            }
        },

        ".hideit click": function(el, ev) {
            var self = this;

            this.element.fadeTo(200, 0.00, function() { //fade
                $(this).slideUp(300, function() { //slide up
                    $(this).remove(); //then remove from the DOM
                });
            });
        }

    });
});