Backbone.Cache
==============

A non-intrusive way of caching requests in Backbone applications

### Start caching ajax requests for 6 seconds
```javascript
Backbone.ajax = new Backbone.Cache(Backbone.ajax, { lifetime: 6000 });
```
