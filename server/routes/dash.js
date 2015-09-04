module.exports = function() {
  return function(req, res, next) {
    res.redirect(req.user.id + '/');
    res.end()
  }
}