var express = require('express');
    app = express(),

    crypto = require('crypto'),
    fs = require('fs'),
    shortid = require('shortid'),
    util = require('util'),

    JSNES = require('node-nes')({}),

    latestHash = '',
    requestHistory = [];

app.set('view engine', 'jade');
app.set('port', (process.env.PORT || 7331));

app.get('/', function (req, res) {
  if(req.url === 'favicon.ico') res.end();
  var id = shortid.generate();

  requestHistory[id] = null;

  res.render('index', {id: id});
});

app.get('/input/:code', function (req, res) {
  res.end();

  var buttonCode = req.params.code;

  JSNES.keyboard.setKey(parseInt(buttonCode), 0x41);

  setTimeout(function(){
    JSNES.keyboard.setKey(parseInt(buttonCode), 0x40);
  }, 100);
});

app.get('/input', function (req, res) {
  res.end();
});

app.get('/stream.png/:id', function (req, res) {
  var id = req.params.id,
      retries = 0;

  res.header('Refresh', '0');

  var i = setInterval(function(){
    retries += 1;
    if (retries++ <= 500 && requestHistory[id] === latestHash) return;

    var readStream = fs.createReadStream('stream.png');

    clearInterval(i);

    requestHistory[id] = latestHash;

    readStream.on('data', function(chunk){
      res.write(chunk);
    })

    readStream.on('end', function(){
      setTimeout(function(){
        res.end();
        readStream.destroy();
      }, 100);

    });
  },100);

  // }
  // else {
  //   setTimeout(function(){
  //     res.header('Refresh', '0');
  //     res.status(304);
  //     res.end();
  //   }, 100);
  // }
});


function saveFrame(){
  var pngStream = JSNES.ui.screen[0].pngStream(),
      writeStream = fs.createWriteStream('stream.png'),
      hash = crypto.createHash('md5')

  pngStream.on('data', function(data){
    hash.update(data, 'utf8');
    writeStream.write(data);
  });

  pngStream.on('end', function(){
    var newHash = hash.digest('hex');

    if(newHash !== latestHash){
      latestHash = newHash;
    }

    writeStream.end();
    writeStream.destroy();
  });
}

function saveGameState(options, err) {
  if (options.cleanup) console.log('clean');
  if (err) console.log(err.stack);
  if (options.exit) {
    fs.writeFile('state.json', JSON.stringify(JSNES.toJSON()) , function (err) {
      if (err) throw err;

      process.exit();
    });
  }
}

process.on('exit', saveGameState.bind(null,{cleanup:true}));
process.on('SIGINT', saveGameState.bind(null, {exit:true}));
process.on('uncaughtException', saveGameState.bind(null, {exit:true}));

var server = app.listen(app.get('port'), function () {
  var host = server.address().address;
  var port = server.address().port;

  if (fs.existsSync('state.json')) {
    JSNES.fromJSON(JSON.parse(fs.readFileSync('state.json')));
  }
  else {
    JSNES.loadRom(fs.readFileSync('roms/zelda.nes', {encoding: 'binary'}));
  }

  JSNES.start();
  setInterval(saveFrame, 100);

  console.log('Example app listening at http://%s:%s', host, port);
});


