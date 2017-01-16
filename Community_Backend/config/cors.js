var prop = require('config/env.js').prop;
exports.corsOptions = {
	origin: prop.orion["allowed-origins"],
	credentials: true
};