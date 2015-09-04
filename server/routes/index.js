'use strict';

var exports = {},
    shortid = require('shortid');

module.exports = function(JSNES, lastSeenFrameStorage, streamHandler){

  exports.dash = require('./dash')();
  exports.input = require('./input')(JSNES);
  exports.stream = require('./stream')(JSNES, lastSeenFrameStorage, streamHandler);

  exports.createUser = function (req, res, next) {
    var id = shortid.generate();

    lastSeenFrameStorage[id] = null;

    req.user = {
      id: id,
      lastSeenFrame: null
    };

    next();
  }

  exports.addUserInfo = function (req, res, next) {
    if(!lastSeenFrameStorage[req.userId]) return exports.createUser(req, res, next);

    req.user = {
      id: req.params.id,
      lastSeenFrame: lastSeenFrameStorage[req.userId]
    };
    next();
  }

  return exports;
}

