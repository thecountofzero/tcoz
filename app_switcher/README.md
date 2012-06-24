Motivation Behind Developing AppSwitcher:

I am building an app that I initially thought would be a multi-page application related to fantasy baseball. There is going to be a Dashboard app, an app to manage players, an app to handle statistics and probably a couple other apps doing other cool fantasy baseball stuff. Each of these apps, however, all have the same look and feel. They all share the same main layout: header, footer, and side navigation buttons. The side navigation buttons will be used to launched the individual apps. Clicking, for example, the Dashboard button, would do a full page load to something like: http://www.fantasyapp.com/dashboard.html

Then I got to thinking. When each app is loaded, that app will then be loaded into the main content region of the page. Regardless of the app, everything around the app (outside the main content area), will be the same. Why reload all of those sections of the app? Since clicking on a navigation button only needs to change the contents of main content and each app to be loaded is really just a can.Control, I decided I needed a way to swap controls in and out of a DOM element.


Enter AppSwitcher:

The basic premise behind AppSwitcher is that you attach it to the main content DOM element and pass it a list of apps/controls that it will load/unload. When a main navigation button is clicked, it updates the hash. AppSwitcher listens to changes on the app attribute of can.route and then loads the control in its list whose key matches the value of the app attribute.


The Details:

The way AppSwitcher works is simple. When the app attribute is changed it looks in its list for a key that matches the value of app. If a match is not found, it does nothing (logs an error). If one is found, it clears the contents of its DOM element (main content) using .empty() which will trigger the destroy function of the currently attached app/control, thus cleaning up. It will then create a new instance of the app to be loaded within the main content DOM element. It's that simple.


The Options:

But AppSwitcher has some options to make it a bit more powerful. 

"useAppSpace" (boolean, defaults to false): When AppSwitcher is attached to a DOM element, it add a div with an id of "appContainer". This is actually the element that apps are loaded into and out of. If you set "useAppSpace" to true, then AppSwitcher will add another div with and id of "appSpace" as a sibling to "appContainer" with its display value set to none. When an app is loaded, it is loaded into "appContainer". When a different app is loaded, and "useAppSpace" is true, the current app is not removed. Instead, it is moved out of "appContainer" and into "appSpace". And then the new app is loaded into "appContainer". This way if you click on that app's button to reload it, instead of creating a new instance, it will first check if one already exists in "appSpace", and if so, move it back into "appContainer". So setting "useAppSpace" just swaps apps between "appContainer" and "appSpace" as they loaded/unloaded.

When an app is unloaded (moved to appSpace), AppSwitcher triggers the "paused" event on the DOM element containing that app. This allows you to listen for "paused" within your apps and do whatever you like. For example, my Dashboard app has a live graph that polls and updates. When not visible, there is not reason for the polling to continue. When an app is reloaded from "appSpace", AppSwitch triggers the "resumed" event on that app allowing you to resume any activity that was paused, etc. 

"routeAttr" (string, defaults to "app"): This is the can.route attribute that AppSwitch should listen to for changes so it knows when to try and load a new app. Exactly how you define your routes is up to you as long as you define them in a way that a particular route attribute corresponds to an app/control that should be loaded. 

At the time of this writing, I believe that the routes need to be defined before the $(document).ready() event. That means defining your routes within your main app, before it attaches AppSwitcher to the main content element (which happens within document.ready). An example looks like:

can.route(':app');
can.route(':app/:appId');
can.route('', {app: 'dashboard'}); 

To be honest, I haven't played around with different route setups much. 

Clicking in the Dashboard button updates the hash to #dashboard in my example.

"apps" (object): This is a list of the apps/controls that AppSwitcher will manage. AppSwitcher allows two formats. The first is a list of hash keys associated with the full namespace of the control:

apps: {
    'dashboard': MyApp.Apps.Dashboard,
    'players': MyApp.Apps.Players,
    'other': MyApp.Apps.OtherApp
}

The important part here is that the key matches the value that clicked button will set the app attribute to in the hash. 

The second format allows you to specify more options for each app:

apps: {
    'dashboard': {
        app: MyApp.Apps.Dashboard, // The app to be loaded
        opts: { username: 'zero' }, // options to be passed to the app when created
        useAppSpace: false // Allows you to turn off using appSpace for this app
    }
}

Note: If the global "useAppSpace" is set to false, setting it to true for a particular app won't work. 

"appOpts" (object): This is a list of options that will be passed to every app when it is created. Apps are only created when their button is clicked. Options specified for an app in its app defition in the "apps" option will be merged with these options with the app's individual options taking precedence. 


Ok, well that ended up being much longer that I thought it would be. I realize that there is a good chance that this might not be very useful to many and might even be a shitty way of doing things, but it solved my needs and allowed me to learn more of CanJS as I developed it. 

What do others thing about this approach of swapping conrols in and out?

I will probably end up updating AppSwitcher with the pushState plugin when it's done. 

AppSwitcher's code can be found here: 

https://github.com/thecountofzero/tcoz/blob/master/app_switcher/app_switcher.js

An app using it can be found here:

https://github.com/thecountofzero/canbaseball


