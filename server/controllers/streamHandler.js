'use strict';

var exports = {},
    streams = require('memory-streams'),
    fs = require('fs'),
    crypto = require('crypto');

module.exports = function(JSNES, activeUsers) {
  var interval = null,
      isStreaming = false,
      stream,
      lastRenderedFrameHash = '';

  function saveFrame(ms) {
    var canvas = JSNES.ui.screen[0],
        hash = crypto.createHash('md5');

    var ctx = canvas.getContext('2d');

    ctx.font = '10px Impact';
    ctx.fillStyle = 'white';
    ctx.fillText(activeUsers.sample() + " player(s)", 5, 15);

    var pngStream = canvas.pngStream();
    stream = new streams.WritableStream();

    pngStream.pipe(stream);

    pngStream.on('data', function(data){
      hash.update(data, 'utf8');
    });

    pngStream.on('end', function(){
      var newFrameHash = hash.digest('hex');

      if (newFrameHash !== lastRenderedFrameHash) {
        lastRenderedFrameHash = newFrameHash;
      }

    });
  }

  exports.startStream = function(ms) {
    if(isStreaming) return;

    isStreaming = true;
    interval = setInterval(function(){
        saveFrame(0);
      }, ms);
  }

  exports.stopStream = function() {
    clearInterval(interval);
    isStreaming = false;
  }

  exports.getLastRenderedFrame = function(){
    return lastRenderedFrameHash;
  }

  exports.getLatestPngAsStream = function(){
    return new streams.ReadableStream(stream.toBuffer());
  }

  return exports;
}