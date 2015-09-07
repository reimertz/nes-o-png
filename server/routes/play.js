module.exports = function() {
  return function(req, res, next) {
    res.redirect('play/' + req.user.id + '/');
    res.end();
  }
}