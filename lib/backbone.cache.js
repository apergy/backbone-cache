'use strict';

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([ 'underscore', 'jquery', 'backbone' ], factory);
  }
}(this, function (_, $, Backbone) {
  Backbone.cache = (function () {
    var cache = { lifetime = 30000 },
        ajax = Backbone.ajax,
        requests = new Backbone.Collection();

    cache.ajax = function (url, options) {
      if (typeof url === 'object') options = url;

      var cachable = options.type === 'GET';

      // If anything other than a GET request is
      // fired we reset our position to neutral
      if (!cachable) requests.reset();

      var cached = cache.findWhere({ url: options.url });

      // We need to fool Backbone into thinking that
      // the request has succeeded in a normal fashion
      var triggerSuccess = function (xhr) {
        options.success(xhr.responseJSON, 'success', xhr);
      };

      // We need the cached requests to remove themselves
      // after an alotted amount of time has passed
      var startCacheReaper = function () {
        _.delay(function () {
          requests.remove([ cache.findWhere({ url: options.url }) ]);
        }, cache.lifetime);
      };

      // We need to add the request to the cache if it was
      // cacheable and it was successful
      var cacheRequest = function (response, status, xhr) {
        if (cachable && status === 'success') {
          requests.add({ url: options.url, xhr: xhr });
        }
      };

      if (cachable && options.success && cached) {
        var xhr = cached.get('xhr');

        // We need to defer our success to the end of the
        // current event loop stack due to Backbone.sync
        // firing a request event after calling this method
        _.defer(triggerSuccess, xhr);
      } else {
        var xhr = ajax.apply(this, arguments)
          .done(cacheRequest)
          .done(startCacheReaper);
      }

      return xhr;
    };

    // We need to replace the existing
    // ajax method with the caching one
    Backbone.ajax = cache.ajax;

    return cache;
  })(Backbone, $, _);
}));
