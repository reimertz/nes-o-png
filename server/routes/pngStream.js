var fs = require('fs'),
    DELAY_BETWEEN_RETRIES_MS = 250,
    CLOSE_RES_AFTER_S = 30,
    RETRIES = CLOSE_RES_AFTER_S * (1000 / DELAY_BETWEEN_RETRIES_MS);

module.exports = function(JSNES, lastSeenFrameStorage, streamHandler) {
  return function(req, res, next) {
    var retries = 0;

    req.on("close", function() {
      lastSeenFrameStorage[req.user.id] = '';
    });

    res.append('Refresh', '0');
    res.append('Content-Type' ,'image/png');

    var i = setInterval(function(){

      var lastRenderedFrame = streamHandler.getLastRenderedFrame();
      if (retries++ <= RETRIES && lastSeenFrameStorage[req.user.id] === lastRenderedFrame) return retries++;

      var readStream = streamHandler.getLatestPngAsStream();

      clearInterval(i);

      lastSeenFrameStorage[req.user.id] = lastRenderedFrame;

      readStream.on('data', function(data){
        res.send(data);
      });

    }, DELAY_BETWEEN_RETRIES_MS);
  }
}
