steal('canbaseball/tcoz/lib/tcoz', function($) {

    can.extend(tcoz, {

        isObject: function(arg){
            return typeof arg === 'object' && arg !== null && arg;
        },

        isString: function(arg) {
            return Object.prototype.toString.call(arg) == '[object String]';
        }
    });
});