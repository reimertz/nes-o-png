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
    res.end();

    var buttonCode = parseInt(req.params.code);

    if(keyMaps[buttonCode]) return;

    JSNES.keyboard.setKey(buttonCode, 0x41);
    keyMaps[buttonCode] = true;

    setTimeout(function(){
      JSNES.keyboard.setKey(buttonCode, 0x40);
      keyMaps[buttonCode] = false;
    }, 100);
  }
}