var express = require('express');
    app = module.exports.app = exports.app = express(),
    favicon = require('serve-favicon'),

    fs = require('fs'),

    JSNES = require('node-nes')({}),
    lastSeenFrameStorage = {},

    streamHandler = require('./controllers/streamHandler')(JSNES);


if(process.env.NODE_ENV === 'dev') {
  app.use(require('connect-livereload')());
}

var router = express.Router(); // Create our Express router
var routes = require('./routes/index')(JSNES, lastSeenFrameStorage, streamHandler);  // Load route logic

router.get('/', routes.createUser, routes.dash);
router.use('/:id/', routes.addUserInfo, express.static('./public'));
router.get('/:id/stream.png', routes.addUserInfo, routes.stream);
router.get('/input/:code', routes.input);



function loadGameState() {
  if (fs.existsSync('state.json')) {
    JSNES.fromJSON(JSON.parse(fs.readFileSync('state.json')));
  }
  else {
    JSNES.loadRom(fs.readFileSync(__dirname + '/roms/zelda.nes', {encoding: 'binary'}));
  }
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

app.set('port', (process.env.PORT || 7331));
app.use(favicon('./public/favicon.ico'));
app.use(router);

var server = app.listen(app.get('port'), function () {
  var host = server.address().address,
      port = server.address().port;

  loadGameState();
  JSNES.start();
  streamHandler.startStream(150);

  process.on('exit', saveGameState.bind(null,{cleanup:true}));
  process.on('SIGINT', saveGameState.bind(null, {exit:true}));
  process.on('uncaughtException', saveGameState.bind(null, {exit:true}));

  console.log('Example app listening at http://%s:%s', host, port);
});


