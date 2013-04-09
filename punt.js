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
     * @param self {Object} (optional) overrides <code>this</code> when calling
     *     the wrapped function.
     * @return {Function} a wrapped version of the function that returns a
     *     promise.
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
     * @param self {Object} (optional) overrides <code>this</code> when calling
     *     the wrapped function.
     * @return {Function} a wrapped version of the function that returns a
     *     promise.
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
     * Creates a function that returns a series of promises, each one
     * corresponding to the given function calling its callback once.
     * @param func {Function} the function to create a generator from. The
     *     function must take a callback.
     * @param self {Object} (optional) overrides <code>this</code> when calling
     *     the wrapped function.
     * @return {Function} a wrapped version of the function that returns a
     *     new promise every time it is called.
     */
    generator: function(func, self) {
      return function() {
        var consumers = [];
        var producers = [];

        var getPromiseToFinish = function() {
          if (consumers.length) {
            var result = consumers.shift();
            return result;
          }
          var promise = makePromise();
          producers.push(promise);
          return promise;
        };

        func.apply(self || this, toArray(arguments).concat(function() {
          var promise = getPromiseToFinish();
          promise.resolve.apply(promise, arguments);
        }, function() {
          var promise = getPromiseToFinish();
          promise.reject.apply(promise, arguments);
        }));

        return function() {
          if (producers.length) {
            var result = producers.shift();
            return result;
          }
          var promise = makePromise();
          consumers.push(promise);
          return promise;
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

  ['callback', 'options', 'generator'].forEach(function(key) {
    root.punt[key] = root.punt.$[key];
  });
}

})(window);
