steal('can/control', 'can/view/ejs', 'can/route', 'can/control/route', function() {

    window.TCOZ = window.TCOZ || {};

    window.TCOZ.AppSwitcher = can.Control({
        defaults: {
            routeAttr: 'app',
            altRouteAttr: 'resource',
            useAppSpace: true,
            apps: {},
            appOpts: {},
            noApp: false, // Allow hash changes to not load an app
            noAppId: 'noApp',
            preLoadFunc: true,
            applicationStr: 'Application',
            forceLoad: false
        }
    }, {
        init: function() {
            var self = this;

            this.currentAppName = '';

            this.loadedApp = null;

            this.reloader = function(e) {

                var href = can.$(this).attr("href");

                if(location.hash === href/* || href.indexOf(can.route.attr('app')) !== -1*/) {
                    self.loadApp(can.route.attr());
                }
            };

            this.element.append('<div id="appContainer"></div>');
            this.appContainer = this.element.find('#appContainer');

            if(this.options.useAppSpace) {
                this.element.append('<div id="appSpace"></div>');
                this.appSpace = this.element.find('#appSpace');
                this.appSpace.css('display', 'none');
            }

            this.appCache = {};

            // Allow an app to be reloaded when it's launching button is clicked
            can.$(document).on('click', 'a', this.reloader);

            this.loadApp(can.route.attr());
        },

        _getAppToLoad: function(app) {
            return (can.$.isFunction(app)) ? {
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

        "{can.route} {altRouteAttr}": "loadApp",

        loadApp: function(data) {
            var self = this,
                opts = this.options,
                existingApp,
                $app,
                appName = data.app,
                appToLoad = this._getAppToLoad(opts.apps[appName]),
                appContainer = this.appContainer,
                isNoApp = this._isNoApp(appName),
                altData = can.route.attr(opts.altRouteAttr);


            steal.dev.log('Loading Application: ' + appName);
            steal.dev.log('Application Alternate Data: ' + altData);

            if(appToLoad && /*this.currentAppName !== appName &&*/ (!isNoApp)) {

                this._unloadAppByName();

                if(opts.useAppSpace && (existingApp = this.appSpace.find('.' + appName)) && existingApp.length) {
                    
                    existingApp.trigger('resumed').appendTo(appContainer);
                }
                else {
                    appContainer.append('<div class="app ' + appName + '"></div>');
                    $app = appToLoad.opts && appToLoad.opts.el || appContainer.find('.app');

                    forceLoad = appToLoad.opts ? appToLoad.opts.forceLoad : false;

                    if(can.$.isFunction(opts.preLoadFunc) && !forceLoad) {
                        opts.preLoadFunc.call(self, function() {
                            self.loadedApp = new appToLoad.app($app, can.extend(true, opts.appOpts, appToLoad.opts));
                        }, appName, appToLoad.title ? appToLoad.title : self.options.applicationStr, altData);
                    }
                    else {
                        this.loadedApp = new appToLoad.app($app, can.extend(true, opts.appOpts, appToLoad.opts));
                    }

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
        },

        getLoadedApp: function() {
            return this.loadedApp;
        },

        destroy: function() {
            can.$(document).off('click', 'a', this.reloader);
            can.Control.prototype.destroy.call(this);
        }
    });
});