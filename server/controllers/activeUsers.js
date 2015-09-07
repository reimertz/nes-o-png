'use strict';

var exports = {};


module.exports = function() {
  var activeUsers = [];

  exports.sniffer = function (req, res, next) {
      console.log(req.user.id);
      res.on("finish", function() {
        if (!activeUsers[req.user.id]) {
          activeUsers.length += 1;

          activeUsers[req.user.id] = setTimeout(function(){
            activeUsers.length -= 1;
            delete activeUsers[req.user.id];
          }, 10000);
        }
      });

    next();
  }

  exports.sample = function(){
    return activeUsers.length;
  }

  return exports;
}