var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var util = require('util');

app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({ extended: false }))


//var GifEncoder = require('gif-encoder');
var GifEncoder = require('gifencoder');
var Canvas = require('canvas');
var fs = require('fs');

// use node-canvas
var canvas = new Canvas(320, 240);
var ctx = canvas.getContext('2d');

var userArray = [];

app.post('/input', function (req, res) {
  var id = req.body.id;

  if(!userArray[id]) {
    res.send('id doesn\'t exist');
    return;
  }

  userArray[id].x = req.body.x;
  userArray[id].y = req.body.y;

  doPaint(userArray[id]);

  res.send('id:' + req.body.id + ' (x:' + req.body.x + ', y:' + req.body.y);
});


app.get('/input', function (req, res) {
  res.end();
});

app.get('/:id', function (req, res) {
  if(req.url === 'favicon.ico') res.end();

  var id = req.params.id;

  if(!userArray[id]) {

    userArray[id] = {
      id: id,
      x: 0,
      y: 0
    };
  }

  res.render('index', {id:id});
});


app.get('/gifs/:id.gif', function (req, res) {
  var id = req.params.id;
  res.header('Content-Type', 'image/gif');

  // /fs.createReadStream('gifs/' + id + '.gif', {autoClose: false}).pipe(res, {end:false});

  userArray[id].gif = new GifEncoder(500, 500);
  // Collect output

  var file = fs.createWriteStream('gifs/' + userArray[id].id + '.gif', {end: false});

  userArray[id].gif.createWriteStream().pipe(file);
  userArray[id].gif.createReadStream().pipe(res, {autoClose: false});

  //fs.createReadStream('gifs/' + id + '.gif', {autoClose: false}).pipe(res, {end:false})


  userArray[id].gif.setQuality(20); // image quality. 10 is default.
  userArray[id].gif.setRepeat(-1);   // 0 for repeat, -1 for no-repeat

 // userArray[id].gif.writeHeader();
  userArray[id].gif.start();

  doPaint(userArray[id]);

});


function swapBackground(userObject){
  var canvas = new Canvas(500, 500);
  var ctx = canvas.getContext('2d');

    // red rectangle
  if(Date.now()%2 === 0){
    ctx.fillStyle = '#ff0000';
  } else {
    ctx.fillStyle = '#00ff00';
  }

  ctx.fillRect(0, 0, 500, 500);
  ctx.fillText("x:" + userObject.x, 50, 100);
  ctx.fillText("y:" + userObject.y, 50, 300);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = "bold 24px verdana, sans-serif ";

  userObject.gif.addFrame(ctx);
  //userObject.gif.addFrame(ctx.getImageData(0, 0, 500, 500).data);

}

function doPaint(userObject){
  var canvas = new Canvas(500, 500);
  var ctx = canvas.getContext('2d');

    // red rectangle
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(0, 0, 500, 500);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = "bold 24px verdana, sans-serif ";
  ctx.fillText("x:" + userObject.x, 50, 100);
  ctx.fillText("y:" + userObject.y, 50, 300);
  userObject.gif.addFrame(ctx);
  //userObject.gif.addFrame(ctx.getImageData(0, 0, 500, 500).data);

}


var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});