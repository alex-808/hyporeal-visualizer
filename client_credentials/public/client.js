

window.onSpotifyWebPlaybackSDKReady = () => {

  

  var scene = new THREE.Scene();

  var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

  var renderer = new THREE.WebGLRenderer({antialias: true});

  var dimension = 12

  renderer.setSize( window.innerWidth / 2, window.innerHeight / 2 );
  document.body.appendChild( renderer.domElement );

  window.addEventListener('resize', function () {
    renderer.setSize(window.innerWidth / 2, window.innerHeight / 2)
    camera.aspect = window.innerWidth / window.innerHeight

    camera.updateProjectionMatrix()
  })
  
  var geometry = new THREE.PlaneGeometry( 2, 1, dimension - 1, dimension - 1 );
  var material = new THREE.MeshBasicMaterial();
  var plane = new THREE.Mesh( geometry, material );
  plane.material.wireframe = true
  plane.rotation.set(-45, 0, 0)
  scene.add( plane );

  camera.position.z = 2;

  var backRowAnimation = [0,0,0,0,0,0,0,0,0,0,0,0]
  var storedBackRow = [0,0,0,0,0,0,0,0,0,0,0,0]


  for(i = 0; i < dimension; i++) {
    plane.geometry.vertices[i].z = .5
  }

  var animate = function () {
    requestAnimationFrame( animate );

    if (storedBackRow !== backRowAnimation) {
      storedBackRow = backRowAnimation
      for(i = 0; i < dimension; i++) {
        //var random = (Math.random() * 2 - 1) * .01
        //plane.geometry.vertices[i].z += random
        plane.geometry.vertices[i].z = storedBackRow[i]
        //plane.geometry.vertices[rowVertices].z = .2
        //plane.geometry.vertices[rowVertices].z = plane.geometry.vertices[rowVertices-dimension].z
      }
    }
    
    else {
      for(i = 0; i < dimension; i++) {
        if(plane.geometry.vertices[i].z > 0) {
        plane.geometry.vertices[i].z -= 0.01
      }
    }
  }
    plane.geometry.verticesNeedUpdate = true

    


    //console.log(backRowAnimation)
  var rowVertices = 143
  var columnVertices = 131

  for(columnVertices; columnVertices >= 11; columnVertices -= dimension) {

    for(rowVertices; rowVertices > columnVertices; rowVertices--) {

      plane.geometry.vertices[rowVertices].z = plane.geometry.vertices[rowVertices - dimension].z
  
    }
  }

    renderer.render( scene, camera );

  };

  animate();

    var trackPosition
    var initialMilliseconds
    var initialDate
    var id
    var elapsedMilliseconds
    var elapsedDate
    var elapsedTime = 0
    var toggle = false
    var counter = 0
    var syncCompensation = 500


    function timerControl(paused) {

      if (paused === false && toggle === false) {
        //console.log("Start track position", trackPosition)
        startTimer()
      }
      else if (paused === true && toggle === true) {
        //console.log("Stop track position", trackPosition)

        stopTimer()
      }
        
    }
  

    function startTimer () {
      elapsedTime = trackPosition
      toggle = true
      initialDate = new Date();
      initialMilliseconds = initialDate.getTime()
      console.log("Start timer")
      //console.log(trackData)
      id = setInterval(() => {
          elapsedDate = new Date();
          elapsedMilliseconds = elapsedDate.getTime() - initialMilliseconds;
          //Need to resolve why only the segmentStart or beatStart are being evaluated
          //it's because we immediately increment i because segmentstart goes first
          //this pushes i back more and more
          /*
         if (elapsedTime + elapsedMilliseconds >= trackData.beatsStart[i] - syncCompensation && elapsedTime + elapsedMilliseconds <= trackData.beatsStart[i])
          {
            console.log("Beat")
            if(rectToggle === true) {
              x = 0
              rectToggle = false
              console.log(rectToggle)
            }
            else {
              x = 200
              rectToggle = true
              console.log(rectToggle)
            }
            i++
          }
                   */
         //console.log("elapsedTime + elapsedMilliseconds", elapsedTime + elapsedMilliseconds)
         //console.log("segmentStart", trackData.segmentsStart[i])
        
         if (elapsedTime + elapsedMilliseconds >= trackData.segmentsStart[counter] - syncCompensation) {
          backRowAnimation = trackData.segments[counter]['pitches']
          //console.log(trackData.segmentsStart[counter])
          //console.log(backRowAnimation)
          //console.log(i)

          counter++
         }

      }, 1);
    }

      function stopTimer () {
        console.log("Stop timer")
        //console.log(trackData)
        clearInterval(id)
        //console.log("Elapsed milis", elapsedMilliseconds)
        elapsedTime += elapsedMilliseconds
        toggle = false
        //console.log("Elapsed time:", elapsedTime)
        console.log("Difference", trackPosition - elapsedTime)
      }

    const token = 'BQDuwR9BQrQ-Ges8AFe90d-KrmChtdsWxlCBR_tll2kv7vSkGJ6_oELPZEpB8dtwP5k61qdyHuQ-YGbW-GCmGFbSZNy6wndEeQcrPqquNJrhr4YBzO-t1umD5mNn4itmDZAnd_kgZkMW3FgEJufcY5tn11CRqXmxIg';
    const player = new Spotify.Player({
      name: 'Web Playback SDK Quick Start Player',
      getOAuthToken: cb => { cb(token); }
    });

    // Error handling
    player.addListener('initialization_error', ({ message }) => { console.error(message); });
    player.addListener('authentication_error', ({ message }) => { console.error(message); });
    player.addListener('account_error', ({ message }) => { console.error(message); });
    player.addListener('playback_error', ({ message }) => { console.error(message); });

    var current_track_id
    var stored_track_id = 0
    var trackData

    // Playback status updates
      player.addListener('player_state_changed', state => { 
        //console.log("State change")
        current_track_id = state['track_window']['current_track']['id']
        trackPosition = state['position']
        console.log("New track position", trackPosition)
        console.log("Elapsed time", elapsedTime)
        if (current_track_id !== stored_track_id) {
          i = 0
          stored_track_id = current_track_id

          console.log('New track detected:', stored_track_id)

          fetch('./', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(state),
            })
            .then(res => res.json())
            .then(data => {
              trackData = new songData(data)
              return trackData
            })
            //.then(trackData => console.log(trackData))
            .then(timerControl(state['paused']))
            //.then(animate())
        }
        else {
          timerControl(state['paused'])
        }
    });

    //create a songData object
    class songData {
      constructor(rawData) {
        this.bars = rawData['bars']
        this.beats = rawData['beats']
        this.sections = rawData['sections']
        this.segments = rawData['segments']
        this.tatums = rawData['tatums']
        //we need a way to convert all these to millis
        this.tatumsStart = []
        for (let i = 0; i < this.tatums.length; i++) {
          this.tatumsStart[i] = parseFloat((this.tatums[i]['start'] * 1000).toFixed(2))
        }
        this.beatsStart = []
        for (let i = 0; i < this.beats.length; i++) {
          this.beatsStart[i] = parseFloat((this.beats[i]['start'] * 1000).toFixed(2))
        }
        this.segmentsStart = []
        for (let i = 0; i < this.segments.length; i++) {
          this.segmentsStart[i] = parseFloat((this.segments[i]['start'] * 1000).toFixed(2))
        }
      }

    }

    // Ready
    player.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id);
    });

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
    });

    // Connect to the player!
    player.connect();

    //Pause
    document.getElementById('toggle-button').addEventListener('click', function() {
      player.togglePlay().then(() => {
      console.log('Toggled!');

    });
    });

  };


