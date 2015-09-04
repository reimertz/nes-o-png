'use strict';

var exports = {},
    streams = require('memory-streams'),
    fs = require('fs'),
    crypto = require('crypto');

module.exports = function(JSNES) {
  var timeout = null,
      isStreaming = false,
      stream,
      lastRenderedFrame = '';

  function saveFrame(ms) {
    var pngStream = JSNES.ui.screen[0].pngStream(),
        hash = crypto.createHash('md5');

    stream = new streams.WritableStream();

    pngStream.pipe(stream);

    pngStream.on('data', function(data){
      hash.update(data, 'utf8');
    });

    pngStream.on('end', function(){
      var newFrame = hash.digest('hex');

      if (newFrame !== lastRenderedFrame) {
        lastRenderedFrame = newFrame;
      }

      timeout = setTimeout(function(){
        saveFrame(ms);
      }, ms);
    });
  }

  exports.startStream = function(ms) {
    if(isStreaming) return;

    isStreaming = true;
    timeout = setTimeout(function(){
        saveFrame(ms);
      }, ms);
  }

  exports.stopStream = function() {
    clearTimeout(timeout);
    isStreaming = false;
  }

  exports.getLastRenderedFrame = function(){
    return lastRenderedFrame;
  }

  exports.getLatestPngAsStream = function(){
    return new streams.ReadableStream(stream.toBuffer());
  }

  return exports;
}