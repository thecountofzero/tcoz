steal('can/control', 'can/view/ejs', 'can/route', 'can/control/route', function($) {

    can.Control("TCOZ.AppSwitcher", {
        defaults: {
            useAppSpace: true,
            apps: {}
        }
    }, {
        init: function() {
            this.currentAppName = '';

            this.element.append('<div id="appContainer"></div>');
            this.appContainer = this.element.find('#appContainer');

            if(this.options.useAppSpace) {
                console.log('useAppSpace');
                this.element.append('<div id="appSpace"></div>');
                this.appSpace = this.element.find('#appSpace');
                this.appSpace.css('display', 'none');
            }

            can.route(':app');
            can.route(':app/:appId');
            can.route('', {app: 'dashboard'});
        },

        "{can.route} app": function(data) {
            var existingApp,
                appName = data.app,
                appToLoad = this.options.apps[appName],
                appContainer = this.appContainer;

            if(appToLoad && this.currentAppName !== appName) {

                if(this.options.useAppSpace && this.currentAppName) {
                    // Move current app to app space before loading new app
                    var el = appContainer.find('.app').trigger('paused').appendTo(this.appSpace);
                }
                else {
                    appContainer.empty();
                }

                if(this.options.useAppSpace && (existingApp = this.appSpace.find('.'+appName)) && existingApp.length) {
                    
                    existingApp.appendTo(appContainer);
                }
                else {
                    appContainer.append('<div class="app ' + appName + '"></div>');
                    new appToLoad(appContainer.find('.app'));
                }

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