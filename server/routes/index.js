'use strict';

var exports = {},
    RateLimiter = require('limiter').RateLimiter,
    shortid = require('shortid');

module.exports = function(JSNES, lastSeenFrameStorage, streamHandler){

  exports.play = require('./play')();
  exports.input = require('./input')(JSNES);

  exports.pngStream = require('./pngStream')(JSNES, lastSeenFrameStorage, streamHandler);

  exports.createUser = function (req, res, next) {
    var id = shortid.generate();

    lastSeenFrameStorage[id] = true;

    req.user = {
      id: id,
      lastSeenFrame: null
    };

    next();
  }

  exports.addUserInfo = function (req, res, next) {
    req.user = {
      id: req.params.id,
      lastSeenFrame: lastSeenFrameStorage[req.userId]
    };
    next();
  }

  exports.rateLimit = function(allowedRequestPer, timeUnit) {
    var limiter = new RateLimiter(allowedRequestPer, timeUnit, true),  // fire CB immediately
        secondsPerUnit = {
          'second': 1,
          'minute': 60,
          'hour'  : 60*60
        };

    return function(req, res, next) {
      limiter.removeTokens(1, function(err, remainingRequests) {
        if (remainingRequests < 0) {
          var refreshDelay = Math.abs(remainingRequests * secondsPerUnit[timeUnit]);
          res.append('Refresh', refreshDelay);
          res.status(429).end('Too many requests. Will refresh in ' + refreshDelay + ' seconds.');
        }
        else {
          next();
        }
      });
    }
  }

  exports.static = function(path) {
    return function(req, res, next) {
      var params = req.params[0] ? req.params[0] : 'index.html';
      res.sendfile(path, {root: './public'});
    }
  }

  return exports;
}

