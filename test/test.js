
test("single callback", function() {
  stop();

  var singleCallbackLater = function(a, b, callback) {
    setTimeout(function() {
      callback(a, b);
    }, 10);
  };

  var wrapped = punt.callback(singleCallbackLater);
  var deferred = wrapped("a", "b");

  deferred.then(function(a, b) {
    equal(a, "a");
    equal(b, "b");
    start();
  }, function() {
    ok(false, "Should have succeeded.");
    start();
  });
});
  

test("double callback success", function() {
  stop();

  var doubleCallbackSuccessLater = function(a, b, success, error) {
    setTimeout(function() {
      success(a);
    }, 10);
  };

  var wrapped = punt.callback(doubleCallbackSuccessLater);
  var deferred = wrapped("a", "b");

  deferred.then(function(a) {
    equal(a, "a");
    start();
  }, function(b) {
    ok(false, "Should have succeeded.");
    start();
  });
});


test("double callback error", function() {
  stop();

  var doubleCallbackErrorLater = function(a, b, success, error) {
    setTimeout(function() {
      error(b);
    }, 10);
  };

  var wrapped = punt.callback(doubleCallbackErrorLater);
  var deferred = wrapped("a", "b");

  deferred.then(function(a) {
    ok(false, "Should have failed.");
    start();
  }, function(b) {
    equal(b, "b");
    start();
  });
});


test("object success", function() {
  stop();

  var objectSuccessLater = function(a, b, options) {
    setTimeout(function() {
      options.success(a);
    }, 10);
  };

  var wrapped = punt.options(objectSuccessLater);
  var deferred = wrapped("a", "b");

  deferred.then(function(a) {
    equal(a, "a");
    start();
  }, function(b) {
    ok(false, "Should have succeeded.");
    start();
  });
});


test("object error", function() {
  stop();

  var objectErrorLater = function(a, b, options) {
    setTimeout(function() {
      options.error(b);
    }, 10);
  };

  var wrapped = punt.options(objectErrorLater);
  var deferred = wrapped("a", "b");

  deferred.then(function(a) {
    ok(false, "Should have failed.");
    start();
  }, function(b) {
    equal(b, "b");
    start();
  });
});


test("repeat", function() {
  stop();

  var button = {
    on: function(callback) {
      this.handlers = this.handlers || [];
      this.handlers.push(callback);
    },

    click: function() {
      var self = this;
      var args = arguments;
      setTimeout(function() {
        var i;
        for (i = 0; self.handlers && i < self.handlers.length; ++i) {
          self.handlers[i].apply(self, args);
        }
      }, 10);
    }
  };

  var wrapped = punt.callback(button.on, button);
  var deferred = wrapped();

  button.click("hello");
  button.click("goodbye");

  deferred.then(function(result) {
    equal(result, "hello");
    start();
  }, function(error) {
    ok(false, "Should have succeeded.");
    start();
  });
});

