var fs = require('fs');

module.exports = function(JSNES, lastSeenFrameStorage, streamHandler) {
  return function(req, res, next) {
    var retries = 0;

    res.append('Refresh', '0');
    res.append('Content-Type' ,'image/png');

    var i = setInterval(function(){

      var lastRenderedFrame = streamHandler.getLastRenderedFrame();

      if (retries++ <= 250 && lastSeenFrameStorage[req.user.id] === lastRenderedFrame) return retries++;

      var readStream = streamHandler.getLatestPngAsStream();

      clearInterval(i);

      lastSeenFrameStorage[req.user.id] = lastRenderedFrame;

      readStream.on('data', function(data){
        res.send(data);
      });

    }, 250);
  }
}
