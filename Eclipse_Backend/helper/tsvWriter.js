var csvWriter = require('csv-write-stream');


module.exports.getWriter = function(){
	return csvWriter({
	  separator: '\t',
	  newline: '\n',
	  headers: undefined,
	  sendHeaders: true
	})
}