(function(root) {

var toArray = function(obj) {
  var i;
  var result = [];
  for (i = 0; i < obj.length; ++i) {
    result.push(obj[i]);
  }
  return result;
};

/**
 * Creates a new instance of the punt module, using the given function to
 * create promises.
 */
root.punt = function(makePromise) {
  return {
    /**
     * Creates a wrapped version of the given function that returns a promise
     * instead of calling one or two callback functions.
     * @param func {Function} the function to wrap. The function can either
     *     accept one callback (with any number of arguments), or can accept a
     *     pair of success and error callbacks. If it only accepts one, then
     *     the returned promise will always be resolved successfully.
     * @param self {Object} (options) overrides <code>this</code> when calling
     *     the wrapped function.
     */
    callback: function(func, self) {
      return function() {
        var deferred = makePromise();
        func.apply(self || this, toArray(arguments).concat(function() {
          deferred.resolve.apply(deferred, arguments);
        }, function() {
          deferred.reject.apply(deferred, arguments);
        }));
        return deferred;
      };
    },
  
    /**
     * Creates a wrapped version of the given function that returns a promise
     * instead of calling callback functions contained in an object.
     * @param func {Function} the function to wrap. The function must accept a
     *     final arguments that's an object with success and error callbacks,
     *     such as a Backbone options object.
     * @param self {Object} (options) overrides <code>this</code> when calling
     *     the wrapped function.
     */
    options: function(func, self) {
      return function() {
        var deferred = makePromise();
        func.apply(self || this, toArray(arguments).concat({
          success: function() {
            deferred.resolve.apply(deferred, arguments);
          },
          error: function() {
            deferred.reject.apply(deferred, arguments);
          }
        }));
        return deferred;
      };
    },

    /**
     *
     */
    repeat: function(func, self) {
      return function() {
        var deferreds = [makePromise()];
        func.apply(self || this, toArray(arguments).concat(function() {
          deferreds.shift().resolve.apply(deferred, arguments);
        }, function() {
          deferreds.shift().reject.apply(deferred, arguments);
        }));
        return {
        };
      };
    }
  };
};

if (typeof($) !== "undefined") {
  /**
   * A default version of the punt module that uses jQuery Deferred for its
   * promise implementation.
   */
  root.punt.$ = root.punt(function() { return $.Deferred(); });

  /**
   * Creates a wrapped version of the given function that returns a promise
   * instead of calling one or two callback functions.
   * @param func {Function} the function to wrap. The function can either
   *     accept one callback (with any number of arguments), or can accept a
   *     pair of success and error callbacks. If it only accepts one, then
   *     the returned promise will always be resolved successfully.
   * @param self {Object} (options) overrides <code>this</code> when calling
   *     the wrapped function.
   * @return {Function} the wrapped function.
   */
  root.punt.callback = root.punt.$.callback;

  /**
   * Creates a wrapped version of the given function that returns a promise
   * instead of calling callback functions contained in an object.
   * @param func {Function} the function to wrap. The function must accept a
   *     final arguments that's an object with success and error callbacks,
   *     such as a Backbone options object.
   * @param self {Object} (options) overrides <code>this</code> when calling
   *     the wrapped function.
   * @return {Function} the wrapped function.
   */
  root.punt.options = root.punt.$.options;
}

})(window);
