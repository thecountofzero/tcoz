steal('can/control', 'can/view/ejs', 'can/route', 'can/control/route', function($) {

    window.TCOZ = window.TCOZ || {};

    window.TCOZ.AppSwitcher = can.Control({
        defaults: {
            routeAttr: 'app',
            useAppSpace: true,
            apps: {},
            appOpts: {}
        }
    }, {
        init: function() {
            this.currentAppName = '';

            this.element.append('<div id="appContainer"></div>');
            this.appContainer = this.element.find('#appContainer');

            if(this.options.useAppSpace) {
                this.element.append('<div id="appSpace"></div>');
                this.appSpace = this.element.find('#appSpace');
                this.appSpace.css('display', 'none');
            }

            this.appCache = {};

            this.loadApp(can.route.attr());
        },

        _getAppToLoad: function(app) {
            return ($.isFunction(app)) ? {
                app: app,
                opts: {},
                useAppSpace: this.options.useAppSpace
            } : app;
        },

        "{can.route} {routeAttr}": "loadApp",

        loadApp: function(data) {
            var existingApp,
                $app,
                appName = data.app,
                appToLoad = this._getAppToLoad(this.options.apps[appName]),
                appContainer = this.appContainer;

            if(appToLoad && this.currentAppName !== appName) {

                if(this.options.useAppSpace && this.currentAppName && this.currentApp.useAppSpace !== false) {
                    // Move current app to app space before loading new app
                    //var el = appContainer.find('.app').trigger('paused').appendTo(this.appSpace);
                    var el = this.appCache[this.currentAppName].trigger('paused').appendTo(this.appSpace);
                }
                else {
                    appContainer.empty();
                }

                if(this.options.useAppSpace && (existingApp = this.appSpace.find('.'+appName)) && existingApp.length) {
                    
                    existingApp.trigger('resumed').appendTo(appContainer);
                }
                else {
                    appContainer.append('<div class="app ' + appName + '"></div>');
                    $app = appContainer.find('.app');
                    new appToLoad.app($app, $.extend(true, this.options.appOpts, appToLoad.opts));
                    this.appCache[appName] = $app;
                }

                this.currentApp = appToLoad;
                this.currentAppName = appName;
            }
            else {
                 if(!appToLoad) {
                    console.log('No such app');
                 }
                 else console.log('App already loaded');
            }
        }
    });
});