var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var util = require('util');

app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({ extended: false }))


//var GifEncoder = require('gif-encoder');
var GifEncoder = require('gifencoder');

var JSNES = require('node-nes')({
      emulateSound: true,
      fpsInterval: 5000000, // Time between updating FPS in ms
      showDisplay: false
    });



var Canvas = require('canvas');
var fs = require('fs');

var canvas;
fs.readFile('zelda.nes', {encoding: 'binary'}, function(err, data) {
  JSNES.loadRom(data);
  JSNES.start();

  canvas = JSNES.ui.screen[0];

  JSNES.ui.writeAudio(function(){
    console.log('lkasdjlkadjkladjlkd')
  })
});

app.post('/input', function (req, res) {
  var buttonCode = req.body.button;
  console.log(req.body);

  JSNES.keyboard.setKey(parseInt(buttonCode), 0x41);

  setTimeout(function(){
    JSNES.keyboard.setKey(parseInt(buttonCode), 0x40);
  },100);

  res.end(buttonCode);
});

app.get('/input', function (req, res) {
  res.end();
});

app.get('/', function (req, res) {
  if(req.url === 'favicon.ico') res.end();

  res.render('nes-index');
});


app.get('/gifs/nes.gif', function (req, res) {
  res.header('Content-Type', 'image/gif');

  var gif = new GifEncoder(256, 240);
  // Collect output

  gif.createReadStream().pipe(res, {autoClose: false});

  gif.setQuality(20); // image quality. 10 is default.
  gif.setRepeat(-1);   // 0 for repeat, -1 for no-repeat

  gif.start(canvas);

  setInterval(function(){
    gif.addFrame(canvas.getContext('2d'));
  },500);

});


var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});