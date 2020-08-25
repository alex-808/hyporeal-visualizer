
var http = require('http'); //Node's "HTTP" library
var static = require('node-static');
var express = require('express');
var favicon = require('serve-favicon');
var request = require('request'); // "Request" library

var path = require('path');




var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
const port = 8080
//Set up webserver

var client_id = '***REMOVED***'; // Your client id
var client_secret = '***REMOVED***'; // Your secret
var redirect_uri = 'http://localhost:8080/callback'; // Your redirect uri

var stateKey = 'spotify_auth_state';

var app = express();


app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.json())

app.use(express.static('public'))
  .use(cors())
  .use(cookieParser());


/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var loggedIn = false

app.get('/', function(req, res) {

  if (loggedIn === false) {
    res.sendFile(path.join(__dirname, '/public', 'login.html'));
    
  }
  else {
    res.sendFile(path.join(__dirname, '/public', 'visual.html'));
  }

})

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'streaming user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };
    // gets the access and refresh tokens
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;
            expiration_time = body.expires_in

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {

        });
        loggedIn = true
        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token

  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      console.log(access_token)
      res.send({
        'access_token': access_token
      });
    }
  });
});


app.post('/', function(req, res)  {
  var current_track_id = req.body['track_window']['current_track']['id']
    API_call(current_track_id)
    .then(data => res.send(data))
})

app.listen(port, () => console.log(`Listening at http://localhost:${port}`));

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
        //console.log(audio_analysis)
        console.log("Get request complete")
      });
    }

  });
  //we need to wait to return audio_analysis until request.get has fully executed
  //return a promise?

})
}
