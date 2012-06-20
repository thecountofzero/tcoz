steal('tcoz/lib/tcoz', function($) {

    tcoz.localization = tcoz.localization || {
        defaults: {
            fallbackLang: "en-US",
            keyseparator: ".",
            enable$t: true,
            dictionary: false,
            lang: false,
            disableFallback: true,
            showKey: false, // Will display key instead of translated value
            forceInit: false
        },
        dictionary: false,
        currentLang: false,
        intialized: false,
        settings: {},
        retries: 0
    };
    
    can.extend(tcoz.localization, {

        /**
         * Initialize the libarary
         * @param {Object} options
         */
        init: function(options) {

            if (!this.intialized || (options && options.forceInit)) {
                
                // Update defaults with user-defined overrides
                this.settings = $.extend(this.defaults, options);
                
                // If a specific language was not specified by the user, determine it based on the browser
                if (!this.settings.lang) {
                    this.settings.lang = this.detectLanguage();
                }
                
                if (this.settings.enable$t) {
                    $.t = $.t || $.proxy(tcoz.localization.translate, tcoz.localization); // Create a shortcut for translating
                }
                
                // Set initialized to true so we don't do it again
                this.intialized = true;
            }
            return this;
        },

        /**
         * Make sure the language is in the form xx-XX
         * @param {Object} lang
         */
        _normalizeLang: function(lang) {
            lang = lang.replace(/_/, '-').toLowerCase();
            if (lang.length > 3) {
                lang = lang.substring(0, 3) + lang.substring(3).toUpperCase();
            }
            return lang;
        },
        
        /**
         * Use the browser settings to determine the user's default language
         */
        _detectLanguage: function () {
            if(navigator) {
                return this._normalizeLang(navigator.language || navigator.userLanguage);
            }
            else {
                return this.settings.fallbackLang;
            }
        },
        
        /**
         * Internal translate function
         * @param {Object} dottedkey
         * @param {Object} options
         */
        _translate: function (dottedkey, options){
            
            var keys = dottedkey.split(this.settings.keyseparator),
                i = 0,
                value,
                notfound;
                
            if(this.settings.showKey) {
                return dottedkey;
            }
                
            // Check if a string was passed in as the options argument. If so, covert options to an object and add the value passed in to it
            // This will allow for an easier transition in the future if we allow additional options and an object is passed in instead
            if(typeof options === "string") {
                options = { defaultStr: options };
            }
                
            options = options || {};
            options.defaultStr = this.settings.disableFallback ? dottedkey : options.defaultStr;
            notfound = options.defaultStr || dottedkey;

            //console.dir(this);
            
            if(!this.dictionary) { // No dictionary
                return notfound;
            }
            
            value = this.dictionary;
            
            // Dive into the dictionary to determine the value
            while(keys[i]) {
                value = value && value[keys[i]];
                i++;
            }
            
            return (value ? value : (options.defaultStr ? options.defaultStr : notfound));
        },

        /**
         * Translate the key
         * @param {Object} dottedkey
         * @param {Object} options
         */
        translate: function(dottedkey, options) {
            return this._translate(dottedkey, options);
        },
        
        /**
         * Loads a file containing localized strings
         * @param {Object} dictionaryPath
         * @param {Object} callback
         */
        loadDictionary2: function(dictionaryPath, callback) {
                
            // If the dictionary was supplied by the user we don't need to use AJAX to retrieve it
            if(this.settings.dictionary) {
                this.dictionary = this.settings.dictionary;
                callback(lang);
                return;
            }

            this._loadDictionary(this.settings.lang, dictionaryPath, callback);
        },

       /**
         * Loads a file containing localized strings
         * @param {Object} dictionaryPath
         * @param {Object} callback
         */
        loadDictionary: function (dictionaryPath, callback) {

            var self = this,
                settings = self.settings;
            
            return (function() {
                
                var retries = 0,
                    _loadDictionary;
                    
                // Function that does the work of retrieving the file containing the localized string
                _loadDictionary = function(lang, doneCallback) {

                    // If the dictionary was supplied by the user we don't need to use AJAX to retrieve it
                    steal.dev.log("Retries: " + retries + "| dictionaryPath: " + dictionaryPath + "| lang: " + lang);

                    if(settings.dictionary) {
                        self.dictionary = settings.dictionary;
                        doneCallback(lang);
                        return;
                    }
                    
                    $.ajax({
                        url: [dictionaryPath, "/", lang, '.json'].join(''),
                        success: function(data, status, xhr) {
                            
                            // Add the localized strings to the master dictionary
                            self.dictionary = $.extend(self.dictionary, data);
                            
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
                },
            
                // Load the dictionary
                _loadDictionary(settings.lang, function(loadedLang) {
                    currentLang = loadedLang;
    
                    // Execute the code that was waiting for the dictionary to be loaded
                    callback.call(self, self.translate);
                });
                
            }());
        },
        
        /**
         * Return the current language being used
         */
        getLanguage: function() {
            return this.currentLang;
        },
        
        getDictionary: function() {
            return this.dictionary;
        },

        detectLanguage: function() {
            return this._detectLanguage();
        }
    });
});