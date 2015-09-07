var JSNES = require('node-nes')(),
    lastSeenFrameStorage = {},
    activeUsers = require('./controllers/activeUsers')(),
    romHandler = require('./controllers/romHandler')(JSNES),
    streamHandler = require('./controllers/streamHandler')(JSNES, activeUsers),

    express = require('express'),
    app = module.exports.app = exports.app = express(),
    favicon = require('serve-favicon'),
    router = express.Router(), // Create our Express router
    routes = require('./routes/index')(JSNES, lastSeenFrameStorage, streamHandler);

if(process.env.NODE_ENV === 'dev') {
  app.use(require('connect-livereload')());
}

router.use('/assets', express.static('./public/assets'));

router.get('/',                     /* Not ratelimited  */                                                            routes.static('/'));
router.get('/play/',                routes.rateLimit(10, 'minute'),    routes.createUser,                              routes.play);
router.get('/play/:id/',            /* Not ratelimited  */            routes.addUserInfo,                             routes.static('/play/'));
router.get('/play/:id/stream.png',  routes.rateLimit(10, 'second'),   routes.addUserInfo,   activeUsers.sniffer,      routes.pngStream);
router.get('/input/:code',          routes.rateLimit(3, 'second'),    routes.addUserInfo,                             routes.input);

app.set('port', (process.env.PORT || 7331));
app.use(favicon('./public/favicon.ico'));
app.use(router);

var server = app.listen(app.get('port'), function () {
  var host = server.address().address,
      port = server.address().port;

  romHandler.loadGameState();
  JSNES.start();
  streamHandler.startStream(150);

  process.on('exit', romHandler.saveGameState.bind(null,{cleanup:true}));
  process.on('SIGINT', romHandler.saveGameState.bind(null, {exit:true}));
  process.on('uncaughtException', romHandler.saveGameState.bind(null, {exit:true}));

  console.log('Example app listening at http://%s:%s', host, port);
});


