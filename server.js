// we are using expressjs as building block for this server
// http://expressjs.com/

var express = require('express'),
    foursq = require('./foursquare_locations');

function start() {
	var app = express();
	
	//have client make a large call, then have server return first 10.. then client will call
	// getMore when it is close to running out of 'attractions'
	// we will want to rank the data coming back66666666
	app.get('/foursquare_locations/:location/:query', foursq.GetAttractions);

	var port = Number(process.env.PORT || 3000);
	app.listen(port, function() {
		console.log("Listening on port " + port + "...");
	});
	
	console.log("Server has started.");
}

exports.start = start;
