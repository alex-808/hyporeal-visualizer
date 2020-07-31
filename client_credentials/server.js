
var http = require('http'); //Node's "HTTP" library
var static = require('node-static');
var express = require('express');
var request = require('request'); // "Request" library
var path = require('path');
const port = 8080
//Set up webserver

var app = express();

app.use(express.json())

app.use(express.static('public'))

app.get('/', function(req, res) {
  
  res.sendFile(path.join(__dirname, '/public', 'index.html'));
})

var testJSON = {
  "this":"that"
}

app.post('/', function(req, res)  {
  var current_track_id = req.body['track_window']['current_track']['id']
    API_call(current_track_id)
    .then(data => res.send(data))
    //.then( => res.send(API_data));
    //console.log(testJSON)
    //res.send(testJSON)
})

app.listen(port, () => console.log(`Listening at http://localhost:${port}`));


var client_id = 'f027df0d4399439bb2e13a2aebee6a4b'; // Your client id
var client_secret = 'b4ebbc598a4f466fac41e6a4d3ecadba'; // Your secret

var audio_analysis;


function API_call(track_id) {
  // your application requests authorization
  return new Promise ((resolve, reject) => {

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
      // use the access token to access the Spotify Web API
      var token = body.access_token;
      var options = {
        url: 'https://api.spotify.com/v1/audio-analysis/' + track_id,
        headers: {
          'Authorization': 'Bearer ' + token
        },
        json: true
      };
        console.log("Post request complete")
      request.get(options, function(error, response, body) {
        audio_analysis = body;
        resolve(audio_analysis)
        console.log("Get request complete")
      });
    }

  });
  //we need to wait to return audio_analysis until request.get has fully executed
  //return a promise?

})
}
