steal('tcoz/lib/tcoz', function($) {

    window.tcoz = window.tcoz || {};
    window.tcoz.Utils = window.tcoz.Utils || {};

    can.extend(tcoz.Utils, {

        isObject: function(arg){
            return typeof arg === 'object' && arg !== null && arg;
        },

        isString: function(arg) {
            return Object.prototype.toString.call(arg) == '[object String]';
        },

        removeA: function(arr) {
			var what, a= arguments, L= a.length, ax;
			while(L> 1 && arr.length){
				what= a[--L];
				while((ax= arr.indexOf(what))!= -1){
					arr.splice(ax, 1);
				}
			}
			return arr;
		},

		getDocHeight: function() {
			var D = document;
			return Math.max(
				Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
				Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
				Math.max(D.body.clientHeight, D.documentElement.clientHeight)
			);
		}
    });
});