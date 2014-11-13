// This file calls foursquare to get location & photo data

// This method calls foursquare to get venue data
exports.GetAttractions = function(req, response)
{
	var http = require("http");
	var https = require("https");
	var async = require("async");

    console.log(req.params);
    var location = req.params.location;
    getTime(location);
    var query = req.params.query;

	var options = {
		host: 'api.foursquare.com',
		port: 443,
		path: '/v2/venues/search?client_id=HAPDLDYSETGGRLYEBKYEXZFWXQPI2W14HBHSACILRS22DXPO&client_secret=MZGC3OGLFINJSAVVFGPAUQUNUPWFQIWIQUSU1AFLWLYBX5EV&v=20130815&near=' + location + '&query=' + query,
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	};

	var req  = https.request(options, function(res) {
	  //console.log('STATUS: ' + res.statusCode);
	  //console.log('HEADERS: ' + JSON.stringify(res.headers));
	  var data = '';
	  
	  res.setEncoding('utf8');
	  // concatnate the chunks into data
	  res.on('data', function (chunk) {
	  	//console.log("INFO: "+chunk);
        data += chunk;
	  });
	  
	  // when all chunks has been received, parse the data to get venueObject
	  // and then getPhoto for each venueObject
	  res.on('end', function(){
	  	//console.log("End received venue data!");
	  	var venueData = parseVenueData(data)
	  	var asyncTasks = [];

	  	venueData.forEach(function(venueObj){
	  					asyncTasks.push(function(callback){
	  						venueObj.photo = getPhoto(venueObj, callback);
	  					});
	  	});
	  				
	  	async.parallel(asyncTasks, function(err){
	  		getTime(location);
	  		response.end(JSON.stringify(venueData));
	  	});
	  
		});
	}).end();
};

// This method parses the response from foursquare and returns an array of venueObject
// Attraction name, Attraction id, Attraction phone, Attraction address
function parseVenueData(data, response){
	var venueData = [];
	var parsedData = JSON.parse(data);
	for(var i = 0; i < parsedData.response.venues.length; i++){
		var venueObj = new Object();
		venueObj.name = parsedData["response"]["venues"][i].name;
		venueObj.id = parsedData["response"]["venues"][i].id;
		venueObj.address = parsedData["response"]["venues"][i].location.address;
		venueObj.phone = parsedData["response"]["venues"][i].contact.phone;
		venueData[i] = venueObj;
	}
	return venueData;
};

// This method takes the venue id and calls foursquare to get the photos
// The callback here will tell the async that this method has finished executing
function getPhoto(venueObj, callback)
{
	var https = require("https");
	
	var venueID = venueObj.id;
	var options = {
		host: 'api.foursquare.com',
		port: 443,
		path: '/v2/venues/' + venueID + '/photos?client_id=HAPDLDYSETGGRLYEBKYEXZFWXQPI2W14HBHSACILRS22DXPO&client_secret=MZGC3OGLFINJSAVVFGPAUQUNUPWFQIWIQUSU1AFLWLYBX5EV&v=20130815' ,
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	};
	
	var retData = '';
	var req  = https.request(options, function(res) {
		var data = '';
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			data += chunk;
		});
		
		res.on('end', function(){
			venueObj.photo = parsePhotoData(data);
			callback();
		});
	}).end();
};

// This method parses the foursquare photo API response and returns the url of the first photo
function parsePhotoData(data){
	var desiredWidth = 300;
	var desiredHeight = 240;
	var dimensions = desiredWidth + 'x' + desiredHeight;
	var parsedData = JSON.parse(data);
	var photoUrl = '';
	
	// for now, just take the first picture
	if(parsedData.response.photos.count > 0){
	
		var photoObj = new Object();
		
		photoObj.prefix = parsedData["response"]["photos"]["items"][0].prefix;
		photoObj.suffix = parsedData["response"]["photos"]["items"][0].suffix;
		photoObj.width = parsedData["response"]["photos"]["items"][0].width;
		photoObj.height = parsedData["response"]["photos"]["items"][0].height;
		
		// ToDo: add logic to verify height is at least at desiredWidth/desiredHeight
		
		photoUrl = photoObj.prefix + dimensions + photoObj.suffix;
	}
	return photoUrl;
};

function getTime(loc){
	var currentdate = new Date(); 
	var datetime = "Time: " + currentdate.getDate() + "/"
	                + (currentdate.getMonth()+1)  + "/" 
	                + currentdate.getFullYear() + " @ "  
	                + currentdate.getHours() + ":"  
	                + currentdate.getMinutes() + ":" 
	                + currentdate.getSeconds() +":"
	                + currentdate.getMilliseconds();
	console.log(datetime + ' for ' + loc);
}