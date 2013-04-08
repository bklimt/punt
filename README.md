# punt

Punt is a utility module to make it easier to use promises in browsers and node.

## Examples

Wrapping a function that takes a callback so that it returns a promise.

```javascript
// Without punt.
FB.init();
FB.getLoginStatus(function() {
  FB.api("/me", function(info) {
    console.log(info);
    FB.api('/platform/posts', { limit: 3 }, function(posts) {
      console.log(posts);
    });
  });
});

// With punt.
FB.init();
punt.callback(FB.getLoginStatus, FB)().then(function() {
  return punt.callback(FB.api, FB)("/me");

}).then(function(info) {
  console.log(info);
  return punt.callback(FB.api, FB)("/platform/posts", { limit: 3 });

}).then(function(posts) {
  console.log(posts);
});
```

Wrapping a function that takes a Backbone-style options object.

```javascript
// Without punt.
obj1.save({ key: "value" }, {
  success: function(obj1) {
    obj2.save({ key: "value" }, {
      success: function(obj2) {
        obj3.save({ key: "value" }, {
          success: function(obj2) {
            // All objects were saved.
          },
          error: function(obj2, error) {
            // obj3 was not saved.
          }
        });
      },
      error: function(obj2, error) {
        // obj2 was not saved.
      }
    });
  },
  error: function(obj, error) {
    // obj1 was not saved.
  }
});

// With punt.
punt.options(obj1.save, obj1)({ key: "value" }).then(function(obj1) {
  return punt.options(obj2.save, obj2)({ key: "value" });
}, function(obj1, error) {
  // obj1 was not saved.
}).then(function(obj2) {
  return punt.options(obj3.save, obj3)({key: "value" });  
}, function(obj2, error) {
  // obj2 was not saved.
}).then(function(obj3) {
  // All objects were saved.
}, function(obj3, error) {
  // obj2 was not saved.
});
```

