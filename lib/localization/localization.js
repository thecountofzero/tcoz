steal('tcoz/lib/tcoz', function() {

    tcoz.localization = tcoz.localization || {};
    
    tcoz.localization = (function() {
        
        var defaults = {
            fallbackLang: "en-US",
            keyseparator: ".",
            enable$t: true,
            dictionary: false,
            lang: false,
            disableFallback: true,
            showKey: false, // Will display key instead of translated value
            forceInit: false
        },
        dictionary = false,
        currentLang = false,
        intialized = false,
        settings = {};

        /**
         * Initialize the libarary
         * @param {Object} options
         */
        function init(options) {

            // This is a shared object. No need to init if it has already been done unless you want to
            // Forcing a re-initialization will overwrite any previous settings
            if (!intialized || (options && options.forceInit)) {
                
                // Update defaults with user-defined overrides
                settings = can.extend(defaults, options);
                
                // If a specific language was not specified by the user, determine it based on the browser
                if (!settings.lang) {
                    settings.lang = _detectLanguage();
                }
                
                if (settings.enable$t) {
                    $.t = $.t || translate; // Create a shortcut for translating
                }
                
                // Set initialized to true so we don't do it again
                intialized = true;
            }
            return this;
        }
        
        /**
         * Make sure the language is in the form xx-XX
         * @param {Object} lang
         */
        function _normalizeLang(lang) {
            lang = lang.replace(/_/, '-').toLowerCase();
            if (lang.length > 3) {
                lang = lang.substring(0, 3) + lang.substring(3).toUpperCase();
            }
            return lang;
        }
        
        /**
         * Use the browser settings to determine the user's default language
         */
        function _detectLanguage() {
            if(navigator) {
                return _normalizeLang(navigator.language || navigator.userLanguage);
            }
            else {
                return settings.fallbackLang;
            }
        }
        
        /**
         * Internal translate function
         * @param {Object} dottedkey
         * @param {Object} options
         */
        function _translate(dottedkey, subs, options) {
            
            var keys = dottedkey.split(settings.keyseparator),
                i = 0,
                value,
                notfound,
                match,
                result,
                doSub = false; // Whether or not to exexute can.sub
                regex = /^\$\$\$(.+)\$\$\$$/g;
                
            if(settings.showKey) {
                return dottedkey;
            }

            // If it's a string then substitutions were not supplied and it's the fallback string
            if(typeof subs === "string") {
                options = { defaultStr: subs };
            }
            else if(subs) { // Only do can.sub if subs was passed in and it's an object
                doSub = true;
            }
                
            // FIXME: Can probably wrap this in an else of above
            // Check if a string was passed in as the options argument. If so, covert options to an object and add the value passed in to it
            // This will allow for an easier transition in the future if we allow additional options and an object is passed in instead
            if(typeof options === "string") {
                options = { defaultStr: options };
            }
                
            options = options || {};

            // Set the default fallback string, checking if disable fallback has been set.
            options.defaultStr = settings.disableFallback ? dottedkey : options.defaultStr;

            // Set the not found value.
            notfound = options.defaultStr || dottedkey;
            
            if(!dictionary) { // No dictionary
                return notfound;
            }
            
            value = dictionary;
            
            // Dive into the dictionary to determine the value
            while(keys[i]) {
                value = value && value[keys[i]];
                i++;
            }

            match = regex.exec(value);

            // Check if we've found a reference to another key and make sure it's not a circular reference to itself
            if(match && match[1] !== dottedkey) {
                return _translate(match[1], options);
            }
            
            result = (value ? value : (options.defaultStr ? options.defaultStr : notfound));

            return doSub ? can.sub(result, subs) : result;
        }
        
        /**
         * Translate the key
         * @param {Object} dottedkey
         * @param {Object} options
         */
        function translate(dottedkey, subs, options) {
            return _translate(dottedkey, subs, options);
        }
        
        /**
         * Loads a file containing localized strings
         * @param {Object} dictionaryPath
         * @param {Object} callback
         */
        function loadDictionary(dictionaryPath, callback, options) {

            if(!intialized) {
                options = options || {};
                init(options);
            }
            
            return (function() {
                
                var retries = 0,
                    _loadDictionary;
                    
                // Function that does the work of retrieving the file containing the localized string
                _loadDictionary = function(lang, doneCallback) {

                    // If the dictionary was supplied by the user we don't need to use AJAX to retrieve it
                    if(settings.dictionary) {
                        dictionary = settings.dictionary;
                        doneCallback(lang);
                        return;
                    }
                    
                    can.ajax({
                        url: [dictionaryPath, "/", lang, '.json'].join(''),
                        success: function(data, status, xhr) {
                            
                            // Add the localized strings to the master dictionary
                            dictionary = can.extend(true, dictionary, data);
                            
                            // Execute the callback
                            doneCallback(lang);
                        },
                        error : function(xhr, status, error) {
                            retries++;
                            if (lang.length >= 5 && retries < 2) {
                                _loadDictionary(lang.substring(0, 2), doneCallback);
                            }
                            else if(lang != settings.fallbackLang && retries <= 2) {
                                steal.dev.log("Unable to locate the dictionary. Using default: [" + settings.fallbackLang + "]");
                                _loadDictionary(settings.fallbackLang, doneCallback);
                            }
                            else {
                                steal.dev.log("Unable to locate a dictionary.");
                                retries = 0;
                                doneCallback(false);
                            }
                        },
                        dataType: "json"
                    });
                };
            
                // Load the dictionary
                _loadDictionary(settings.lang, function(loadedLang) {
                    currentLang = loadedLang;
    
                    // Execute the code that was waiting for the dictionary to be loaded
                    callback.call(self, translate);
                });
                
            }());
        }
        
        /**
         * Return the current language being used
         */
        function getLanguage() {
            return currentLang;
        }
        
        function getDictionary() {
            return dictionary;
        }
        
        // API to be exposed to end users
        return {
            init: init,
            t: translate,
            translate: translate,
            detectLanguage: _detectLanguage,
            getLanguage: getLanguage,
            getDictionary: getDictionary,
            loadDictionary: loadDictionary
        };
        
    }());

});