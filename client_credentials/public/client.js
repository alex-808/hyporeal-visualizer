window.onSpotifyWebPlaybackSDKReady = () => {

    var trackPosition
    var initialMilliseconds
    var initialDate
    var id
    var elapsedMilliseconds
    var elapsedDate
    var elapsedTime = 0
    var toggle = false
    var i = 0
    var array = [1.1, 2.5, 3.7]

    function timerControl(paused) {

      
      if (paused === false && toggle === false) {
        console.log("Start track position", trackPosition)
        startTimer()
      }
      else if (paused === true && toggle === true) {
        console.log("Stop track position", trackPosition)

        stopTimer()
      }
        
      }
  

    function startTimer () {
      elapsedTime = trackPosition
      toggle = true
      initialDate = new Date();
      initialMilliseconds = initialDate.getTime()
      id = setInterval(() => {
          elapsedDate = new Date();
          elapsedMilliseconds = elapsedDate.getTime() - initialMilliseconds;
          //if (elapsedMilliseconds === ) {

          //}

      }, 1);
    }

      function stopTimer () {
        clearInterval(id)
        console.log("Elapsed milis", elapsedMilliseconds)
        elapsedTime += elapsedMilliseconds
        toggle = false
        console.log("Elapsed time:", elapsedTime)
        console.log("Difference", trackPosition - elapsedTime)
      }

    const token = 'BQA7-UlXr4R95AgYcKhDdb9thV4ysR0Irb6jA7806kQtFW-zSx4BZ2B_KIng-ezWoRqEjs96KUUKmMSIi2cm0ysgafnvhygT8_cKCshT-YL_PUT03JEt1hbzPCf1SdfWA10QS2-Ojk9K1yN2JCKZ9iGSJnPGwE3Hpg';
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
        console.log("State change")
        trackPosition = state['position']
        timerControl(state['paused'])
        current_track_id = state['track_window']['current_track']['id']

        if (current_track_id !== stored_track_id) {

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
              //console.log(trackData, "1")
              return trackData
            })
            .then(trackData => console.log(trackData))
        }
        else {

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
      }

    }

    function arrayToMilliseconds (array) {
      //console.log(array.length)
      for (i = 0; i < array.length; i++) {
        //array[i] = array[i]['start'] * 1000
      }
      console.log(array)
      return array
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


    