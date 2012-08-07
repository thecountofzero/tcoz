steal('can/control', 'can/view/ejs', 'can/route', 'can/control/route', function() {

    window.TCOZ = window.TCOZ || {};

    window.TCOZ.AppSwitcher = can.Control({
        defaults: {
            routeAttr: 'app',
            useAppSpace: true,
            apps: {},
            appOpts: {},
            noApp: false,
            noAppId: 'noApp'
        }
    }, {
        init: function() {
            var self = this;

            this.currentAppName = '';

            this.element.append('<div id="appContainer"></div>');
            this.appContainer = this.element.find('#appContainer');

            if(this.options.useAppSpace) {
                this.element.append('<div id="appSpace"></div>');
                this.appSpace = this.element.find('#appSpace');
                this.appSpace.css('display', 'none');
            }

            this.appCache = {};

            can.$(document).on('click', 'a', function(e) {

                var href = $(this).attr("href");

                if(location.hash === href) {
                    self.loadApp(can.route.attr());
                }
            });

            this.loadApp(can.route.attr());
        },

        _getAppToLoad: function(app) {
            return ($.isFunction(app)) ? {
                app: app,
                opts: {},
                useAppSpace: this.options.useAppSpace
            } : app;
        },

        _unloadAppByName: function(appNameToUnload) {

            appNameToUnload = appNameToUnload || this.currentAppName;

            if(this.options.useAppSpace && this.currentAppName && this.currentApp.useAppSpace !== false) {

                // Move current app to app space before loading new app
                //var el = appContainer.find('.app').trigger('paused').appendTo(this.appSpace);
                this.appCache[appNameToUnload].trigger('paused').appendTo(this.appSpace);
            }
            else {
                this.appContainer.empty();
            }
        },

        _isNoApp: function(appName) {
            var opts = this.options;

            return opts.noApp && appName === opts.noAppId;
        },

        "{can.route} {routeAttr}": "loadApp",

        loadApp: function(data) {
            var opts = this.options,
                existingApp,
                $app,
                appName = data.app,
                appToLoad = this._getAppToLoad(opts.apps[appName]),
                appContainer = this.appContainer,
                isNoApp = this._isNoApp(appName);


            steal.dev.log('LOAD APP: ' + appName);

            if(appToLoad && /*this.currentAppName !== appName &&*/ (!isNoApp)) {

                this._unloadAppByName();

                if(opts.useAppSpace && (existingApp = this.appSpace.find('.' + appName)) && existingApp.length) {
                    
                    existingApp.trigger('resumed').appendTo(appContainer);
                }
                else {
                    appContainer.append('<div class="app ' + appName + '"></div>');
                    $app = appToLoad.opts && appToLoad.opts.el || appContainer.find('.app');
                    new appToLoad.app($app, $.extend(true, opts.appOpts, appToLoad.opts));
                    this.appCache[appName] = $app;
                }

                this.currentApp = appToLoad;
                this.currentAppName = appName;
            }
            else {
                 if(!appToLoad) {
                    if(!isNoApp) {
                        steal.dev.log('No such app');
                        this.element.trigger('noSuchAppEvent');

                        this._unloadAppByName(this.currentAppName);

                        this.currentApp = null;
                        this.currentAppName = '';
                    }
                 }
                 else steal.dev.log('App already loaded');
            }
        }
    });
});