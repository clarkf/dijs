/* jshint curly:true, unused:true, maxdepth:2, maxcomplexity:10, node:true, indent:4 */
(function () {
    /**
     * Initialize the container.
     *
     * @api public
     */
    function Container() {
        this.shared = {};
        this.items = {};
        this.values = {};
    }

    /**
     * Export the Container function.
     */
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Container;
    } else {
        /* istanbul ignore next */
        window.Dijs = Container;
    }

    /**
     * Register a specific factory method to the container.
     *
     * @param {string} key
     * @param {Function} value
     * @param {boolean} [shared=true]
     * @api public
     */
    Container.prototype.bind = function (key, value, shared) {
        this.items[key] = value;
        this.shared[key] = shared !== false;
    };

    /**
     * Build and return a specific factory (as designated by `key`) from the
     * container.
     *
     * @param {string|string[]} keys
     * @param {Function} done
     * @api public
     */
    Container.prototype.get = function (keys, done) {
        // Ensure that keys is an array
        keys = Array.isArray(keys) ? keys : [keys];

        var remaining = keys.length,
            values = [],
            errored = false,
            self = this;

        // Iterate over each listed key
        keys.forEach(function (key, i) {

            // Build or retrieve the singular key
            self.getOne(key, function (err, value) {
                // If we've already errored, don't do anything.
                if (errored) {
                    return;
                }

                // If we are currently erroring, mark the call as errored
                // and return the error
                if (err) {
                    errored = true;
                    return done(err);
                }

                // Store the retrieved value and note that we have one less key
                // remaining
                values[i] = value;
                remaining -= 1;

                // If we have no further resolutions to handle, call the callback.
                if (remaining <= 0) {
                    done.apply(null, [null].concat(values));
                }
            });
        });
    };

    /**
     * Build and return a single item from the container.
     *
     * @param {string} key
     * @param {Function} callback
     */
    Container.prototype.getOne = function (key, callback) {
        var self = this;

        // Check to see if this result was intended to be reused, and if it's been
        // built before.  If it has, simply return the stored value.
        if (this.shared[key] && this.values[key]) {
            return callback(null, this.values[key]);
        }

        // Call the factory function, passing the container and a callback
        this.items[key](this, function (err, value) {
            // Errors should take precedence.
            if (err) {
                return callback(err);
            }

            // If this result was intended to be shared across calls, store it for
            // later.
            if (self.shared[key]) {
                self.values[key] = value;
            }

            // Return the result to the user.
            callback(err, value);
        });
    };
}).call(this);
