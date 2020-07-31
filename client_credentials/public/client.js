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
    var syncCompensation = 500
    var image = document.querySelector('h1')
    var imageToggle = true;
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
      console.log(trackData)
      id = setInterval(() => {
          elapsedDate = new Date();
          elapsedMilliseconds = elapsedDate.getTime() - initialMilliseconds;
          if (elapsedTime + elapsedMilliseconds >= trackData.beatsStart[i] - syncCompensation && elapsedTime + elapsedMilliseconds <= trackData.beatsStart[i])
          {
            if (imageToggle === true) {
              imageToggle = false
              image.style.color = "red"
            }
            else {
              imageToggle = true
              image.style.color = "blue"
            }

            i++
          }
      }, 1);
    }

      function stopTimer () {
        console.log("Stop timer")
        console.log(trackData)
        clearInterval(id)
        //console.log("Elapsed milis", elapsedMilliseconds)
        elapsedTime += elapsedMilliseconds
        toggle = false
        //console.log("Elapsed time:", elapsedTime)
        console.log("Difference", trackPosition - elapsedTime)
      }

    const token = 'BQDv3o53v8wYuSU3BNMEuk6viteQXLh4F4h0gEy-LTkVblZohrVW2RSZRxhXA0BsVfBmDbmLTCqB70Mumd0pQ3caoiwcw12hYgiRDodNTaIoa3gyrGecpUDarPV_rxKrWqk6_gFAYMFjo8S5Fp-J7zEkhhD6RWQvZg';
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
              return trackData
            })
            .then(trackData => console.log(trackData))
            .then(timerControl(state['paused']))
        }
        else {
          trackPosition = state['position']


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


    