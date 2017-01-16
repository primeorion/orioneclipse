/**
 * New node file
 */

var app = require("express")();
app.use('/admin', require('./admin'));
app.use('/security', require('./security'));
app.use('/tradeorder', require('./tradeorder'));
app.use('/preference', require('./preference'));
app.use('/portfolio', require('./portfolio'));
app.use('/modeling', require('./model'));
app.use('/tempmodeling', require('./model_temp'));
app.use('/dashboard', require('./dashboard'));
app.use('/dataimport', require('./import'));
app.use('/community', require('./community'));
app.use('/account', require('./account'));
app.use('/rebalancer', require('./rebalancer'));
app.use('/settings', require('./settings'));
app.use('/holding', require('./holding'));
app.use('/notification', require('./notification'));
app.use('/tradetool', require('./tradetool'));
app.use('/postimport', require('./post_import_analysis'));
app.use('/search', require('./search'));
module.exports = app;
