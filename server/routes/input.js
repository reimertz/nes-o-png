var keyMaps = {
  '38': false,
  '37': false,
  '40': false,
  '39': false,
  '17': false,
  '13': false,
  '89': false,
  '88': false
};

module.exports = function(JSNES) {
  return function(req, res, next) {
    var buttonCode = parseInt(req.params.code);

    res.end();

    if(!buttonCode in keyMaps) return;

    if(!keyMaps[buttonCode]) {
      JSNES.keyboard.setKey(buttonCode, 0x41);
    }

    clearTimeout(keyMaps[buttonCode]);

    keyMaps[buttonCode] = setTimeout(function() {
      keyMaps[buttonCode] = false;
      JSNES.keyboard.setKey(buttonCode, 0x40);
    }, 200);
  }
}