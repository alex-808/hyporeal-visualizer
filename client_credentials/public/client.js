

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
  var beatAnimation = 0


  for(i = 0; i < dimension; i++) {
    plane.geometry.vertices[i].z = .5
  }
  console.log(camera.position.x)
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
      //plane.geometry.vertices[rowVertices].y += beatAnimation * 0.01
  
    }
  }

    renderer.render( scene, camera );

  };

  animate();
//////Scene2////////
/*
  var scene2 = new THREE.Scene();

  var camera2 = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

  var renderer2 = new THREE.WebGLRenderer({antialias: true});

  renderer2.setSize( window.innerWidth / 2, window.innerHeight / 2 );
  document.body.appendChild( renderer2.domElement );
  */

    var trackPosition
    var initialMilliseconds
    var initialDate
    var id
    var elapsedMilliseconds
    var elapsedDate
    var elapsedTime = 0
    var toggle = false
    var syncCompensation = 0

    var sectionCounter = 0
    var barCounter = 0
    var beatCounter = 0
    var tatumCounter = 0
    var segmentCounter = 0

    function findNextDivision (divisionNameStart, divisionCounter, divisionName) {
      var i = 0
      var truthCond = true
      //console.log("New call")
      
      while(truthCond === true && i < divisionNameStart.length) {
        if (divisionNameStart[i] > trackPosition) {
          divisionCounter = i
          //console.log(divisionName + "Counter", divisionCounter)
          truthCond = false;
          return divisionCounter
        }
        i++
      }
    }

        function checkForHits () {
      if (elapsedTime + elapsedMilliseconds >= trackData.beatsStart[beatCounter] - syncCompensation)
      {
        console.log("New beat")
        if (beatAnimation === -1) {
          //console.log("Beat")
          beatAnimation = 1
          //console.log(beatAnimation)
        }
        else {
          beatAnimation = -1
          //console.log("Boop")
        }
        beatCounter++
      }
               
     //console.log("elapsedTime + elapsedMilliseconds", elapsedTime + elapsedMilliseconds)
     //console.log("segmentStart", trackData.segmentsStart[i])
     if (elapsedTime + elapsedMilliseconds >= trackData.sectionsStart[sectionCounter] - syncCompensation) {
       sectionCounter++
       console.log("New section")
     }
     if (elapsedTime + elapsedMilliseconds >= trackData.barsStart[barCounter] - syncCompensation) {
       barCounter++
       console.log("New bar")
     }
     if (elapsedTime + elapsedMilliseconds >= trackData.tatumsStart[tatumCounter] - syncCompensation) {
       tatumCounter++
       console.log("New tatum")
     }

     if (elapsedTime + elapsedMilliseconds >= trackData.segmentsStart[segmentCounter] - syncCompensation) {
      backRowAnimation = trackData.segments[segmentCounter]['pitches']
      //console.log(trackData.segmentsStart[segmentCounter])
      //console.log(backRowAnimation)

      segmentCounter++
      //console.log("Segment hit", segmentCounter)
     }
    }
    function timerControl(paused) {

 
      //segmentCounter = findNextDivision(trackData.segmentsStart, segmentCounter, "segment")
      
      //findNextDivision(trackData.tatumsStart, tatumCounter, "tatum")
      //findNextDivision(trackData.beatsStart, beatCounter, "beat")
      //findNextDivision(trackData.barsStart, barCounter, "bar")
      //findNextDivision(trackData.sectionsStart, sectionCounter, "section")

      if (paused === false) {
        //console.log("Start track position", trackPosition)

        startTimer()
      }
      else if (paused === true) {
        //console.log("Stop track position", trackPosition)

        stopTimer()
      }
        
    }
  



    function startTimer () {

      stopTimer()
      segmentCounter = findNextDivision(trackData.segmentsStart, segmentCounter, "segment")
      tatumCounter = findNextDivision(trackData.tatumsStart, tatumCounter, "tatum")
      beatCounter = findNextDivision(trackData.beatsStart, beatCounter, "beat")
      barCounter = findNextDivision(trackData.barsStart, barCounter, "bar")
      sectionCounter = findNextDivision(trackData.sectionsStart, sectionCounter, "section")

      //console.log("Start timer elapsed time", elapsedTime)
      elapsedMilliseconds = 0
      toggle = true
      initialDate = new Date();
      initialMilliseconds = initialDate.getTime()
      //console.log("Start timer")

      id = setInterval(() => {
        //console.log("Running")
        elapsedDate = new Date();
        elapsedMilliseconds = elapsedDate.getTime() - initialMilliseconds;
        //console.log("Start timer Elapsed millis", elapsedMilliseconds)
        //console.log("Tracked time", elapsedTime + elapsedMilliseconds)
        checkForHits()

      }, 1);
    }

      function stopTimer () {
        //console.log("Stop timer")

        clearInterval(id)

        //console.log("Stop Timer Elapsed time:", elapsedTime)

        toggle = false
        //console.log("Stop timer Elapsed millis", elapsedMilliseconds)
        //console.log("Stop timer trackPosition", trackPosition)

        //console.log("Difference", trackPosition - elapsedTime)
      }

    const token = 'BQDvS5zNqynuiIcRLE0gs08ITHPZI7Np4NeLIDEBvW9Ci3CWJ3l55rCZmd2kIfPi4qDiTwk6fLnz698HWP62bpcp5kvwk3_k441EOAacmhCQSccz_AKRvAvU-vvRll_DcZ_3_5gHj3sU4QcKn4tVqEdEgQiIiSs_ow';
    const player = new Spotify.Player({
      name: 'Hyporeal',
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

        elapsedTime = trackPosition

        //if paused, stop timer, if playing,stop timer, start timer

        //console.log("State change")
        //sectionCounter = 0
        //barCounter = 0
        //beatCounter = 0
        //tatumCounter = 0
        //segmentCounter = 0

        current_track_id = state['track_window']['current_track']['id']

        //timerControl(state['paused'])
        //startTimer()
        trackPosition = state['position']
        //we want elapsedTime to adjust when a skip occurs
        if (current_track_id !== stored_track_id) {

          trackPosition = 0

          stored_track_id = current_track_id

          console.log('New track detected:', stored_track_id)
          console.log("Track position", trackPosition)

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
           // .then(trackData => console.log(trackData))
            .then(timerControl(state['paused']))
            //.then(animate())
        }
        else {
          timerControl(state['paused'])
        }
    });

var id2
    id2 = setInterval(() => {
      player.getCurrentState().then(state => {
        if(!state) {
          console.log("No music playing")
          return
        }
        trackPosition = state['position']
        elapsedTime = trackPosition
        //console.log("Query trackPosition", trackPosition)
        if (state['paused'] === false) {
          startTimer()
        }
      })
    }, 100)


    //create a songData object
    class songData {
      constructor(rawData) {
        this.bars = rawData['bars']
        this.beats = rawData['beats']
        this.sections = rawData['sections']
        this.segments = rawData['segments']
        this.tatums = rawData['tatums']

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


        this.sectionsStart = []
        for (let i = 0; i < this.sections.length; i++) {
          this.sectionsStart[i] = parseFloat((this.sections[i]['start'] * 1000).toFixed(2))
        }

        this.barsStart = []
        for (let i = 0; i < this.bars.length; i++) {
          this.barsStart[i] = parseFloat((this.bars[i]['start'] * 1000).toFixed(2))
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


