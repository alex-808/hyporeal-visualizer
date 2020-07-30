
var http = require('http'); //Node's "HTTP" library
var static = require('node-static');
var express = require('express');
var request = require('request'); // "Request" library
var path = require('path');
const port = 8080
//Set up webserver

var app = express();

app.use(express.json())

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/public', 'index.html'));
})

var stored_track_id;


app.post('/', function(req, res)  {
//the problem is that for some reason the callback function is resolving before the API_call has completed
//need to look into async await
  var current_track_id = req.body['track_window']['current_track']['id']
  //console.log("Current:", current_track_id);
  //console.log("Stored", stored_track_id)
  if(current_track_id !== stored_track_id || API_data === undefined) {
    stored_track_id = current_track_id;
    console.log("Stored track replaced")
    console.log("New Stored:", stored_track_id)
    API_data = API_call(stored_track_id);
    console.log("API data:", API_data);


  }

  res.send(API_data)
})

app.listen(port, () => console.log(`Listening at http://localhost:${port}`));


var client_id = '***REMOVED***'; // Your client id
var client_secret = '***REMOVED***'; // Your secret

var audio_analysis;
var x;


function API_call(track_id) {
  // your application requests authorization

  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
    },
    form: {
      grant_type: 'client_credentials'
    },
    json: true
  };

  //when you post authOptions, this callback function runs
  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      x = 2
      // use the access token to access the Spotify Web API
      var token = body.access_token;
      var options = {
        url: 'https://api.spotify.com/v1/audio-analysis/' + track_id,
        headers: {
          'Authorization': 'Bearer ' + token
        },
        json: true
      };
    
      request.get(options, function(error, response, body) {
        audio_analysis = body;
      });
    }

  });
  return audio_analysis;
}
