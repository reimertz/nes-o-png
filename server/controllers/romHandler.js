'use strict';

var exports = {},
    fs = require('fs');

module.exports = function(JSNES) {
  exports.loadGameState = function() {
    if (fs.existsSync('./state.json')) {
      JSNES.fromJSON(JSON.parse(fs.readFileSync('./state.json')));
    }
    else {
      JSNES.loadRom(fs.readFileSync('./roms/zelda.nes', {encoding: 'binary'}));
    }
  }

  exports.saveGameState = function(options, err) {
    if (options.cleanup) console.log('clean');
    if (err) console.log(err.stack);
    if (options.exit) {
      fs.writeFile('./state.json', JSON.stringify(JSNES.toJSON()) , function (err) {
        if (err) throw err;

        process.exit();
      });
    }
  }

  return exports;
}
