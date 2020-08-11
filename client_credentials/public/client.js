

window.onSpotifyWebPlaybackSDKReady = () => {

var beatAnimation = 0

var planeDimension = 12
var planeBackRowAnimation = [0,0,0,0,0,0,0,0,0,0,0,0]
var planeStoredBackRow = [0,0,0,0,0,0,0,0,0,0,0,0]

var neoDimension


function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas, alpha: true, antialias: true});
  


  function makeScene(elem) {
    const scene = new THREE.Scene();
    const fov = 45;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 0, 2);
    camera.lookAt(0, 0, 0);

    {
      const color = 0xFFFFFF;
      const intensity = 0.5;
      const light = new THREE.DirectionalLight(color, intensity);
      light.position.set(-1, 2, 4);
      scene.add(light);
    }

    return {scene, camera, elem};
  }

  function setupScene1() {
    const sceneInfo = makeScene(document.querySelector('#box'));
    var geometry = new THREE.PlaneGeometry( 2, 1, planeDimension - 1, planeDimension - 1 );

    var material = new THREE.MeshBasicMaterial();
    var plane = new THREE.Mesh( geometry, material );
    sceneInfo.scene.add(plane);
    plane.material.wireframe = true
    plane.rotation.set(-45, 0, 0)
    sceneInfo.camera.fov = 75
    sceneInfo.mesh = plane;

    return sceneInfo;
  }

  var beatLinePoints = []

  beatLinePoints.push( new THREE.Vector3( 0, 0, 0 ) );
  beatLinePoints.push( new THREE.Vector3( 0, 0, 0 ) );

  function setupScene2() {
      const sceneInfo = makeScene(document.querySelector('#pyramid'));
      const radius = .02;
      const widthSegments = 10;
      const heightSegments = 10;
      const geometry = new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments);
      const material = new THREE.MeshPhongMaterial({
          color: 'white',
          flatShading: true,
        });
      const mesh = new THREE.Mesh(geometry, material);
      sceneInfo.scene.add(mesh);
      sceneInfo.mesh = mesh;

      var beatLineMaterial = new THREE.LineBasicMaterial( { color: 0x0000ff, } );
      var beatLineGeometry = new THREE.BufferGeometry().setFromPoints(beatLinePoints)
      var beatLine = new THREE.Line(beatLineGeometry, beatLineMaterial)
      sceneInfo.scene.add(beatLine)
      sceneInfo.beatLine = beatLine
      var beatLineArray = []
      sceneInfo.beatLineArray = beatLineArray
      return sceneInfo;
    }
    

    var squaresArray = []

    function setupScene3() {
      //Pen
      const sceneInfo = makeScene(document.querySelector('#plane'));
      const radius = .02;
      const widthSegments = 1
      const heightSegments = 1
      const geometry = new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments);
      const material = new THREE.MeshPhongMaterial({
        color: 'white',
        flatShading: true,
      });
      const pen = new THREE.Mesh(geometry, material);
      // pen.position.x = -.75
      // pen.position.y = .75
      pen.position.x = 0
      pen.position.y = 0
      sceneInfo.scene.add(pen);
      sceneInfo.pen = pen;

      //Plane
      var planeGeometry = new THREE.PlaneGeometry( 1.5, 1.5, neoDimension, neoDimension);
      var planeMaterial = new THREE.MeshBasicMaterial();
      var plane = new THREE.Mesh( planeGeometry, planeMaterial );
      sceneInfo.scene.add(plane);
      plane.material.wireframe = true
      plane.rotation.set(0, 0, 0)

      var q = 0
      var k = 0
      for (var i = 0; i < neoDimension * neoDimension; i++) {
        squaresArray[i] = []
        if(i % neoDimension === 0 && i > 0) {
          q++
        }
        for (var j = 0; j < neoDimension; j++) {
          if(j < 2) {
            k = 0
            squaresArray[i][j] = plane.geometry.vertices[i + j + q]
          }
          else {
            k = neoDimension - 1
            squaresArray[i][j] = plane.geometry.vertices[i + j + k + q]
          }
        }
      }
      
      //Line
      var neoLinePoints = []
      neoLinePoints.push( new THREE.Vector3( pen.position.x, pen.position.y, 0 ) );
      neoLinePoints.push( new THREE.Vector3( pen.position.x, pen.position.y, 0 ) );
      var neoLineArray = []
      var neoLineMaterial = new THREE.LineBasicMaterial( { color: 0x0000ff, } );
      var neoLineGeometry = new THREE.BufferGeometry().setFromPoints(neoLinePoints)
      var neoLine = new THREE.Line(neoLineGeometry, neoLineMaterial)
      sceneInfo.neoLine = neoLine
      sceneInfo.neoLineArray = neoLineArray
      sceneInfo.neoLinePoints = neoLinePoints
      sceneInfo.scene.add(neoLine)

      return sceneInfo;
    }
    var neoLineCounter = 0
    var writeCounter = 0
    var toggle = true
    var storedBeatCounter = 0
    var toggle2 = true
    var r = .3

  function neoLineAnimation() {
    if (storedBeatCounter !== beatCounter) {
      storedBeatCounter = beatCounter
      sceneInfo3.pen.position.x = squaresArray[barCounter][0].x
      sceneInfo3.pen.position.y = squaresArray[barCounter][0].y
      sceneInfo3.neoLinePoints.shift()
      sceneInfo3.neoLinePoints.shift()
      sceneInfo3.neoLinePoints.push( new THREE.Vector3( sceneInfo3.pen.position.x, sceneInfo3.pen.position.y, 0 ) );
      sceneInfo3.neoLinePoints.push( new THREE.Vector3( sceneInfo3.pen.position.x, sceneInfo3.pen.position.y, 0 ) );

      drawTriangle(sceneInfo3.pen.position.x, sceneInfo3.pen.position.y)

    }
   
    //Trying to draw a circle
    // if(toggle2 === true) {
    //   for (var x = -r; x <= r;) {
    //         console.log("X", x)
    //         x = parseFloat((x += .01).toFixed(1))
    //     for (var y = -r; y <= r;) {
    //           console.log("Y", y)
    //           y = parseFloat((y += .01).toFixed(1))
    //       if(Math.pow(x, 2) + Math.pow(y, 2) === Math.pow(r, 2)) {
    //         sceneInfo3.pen.position.x = x
    //         sceneInfo3.pen.position.y = y
    //         drawNeoLine()
    //         console.log("X", x)
    //         console.log("Y", y)
    //         console.log("X squared", Math.pow(x, 2))
    //         console.log("Y squared", Math.pow(y, 2))
    //         // console.log("The sum", Math.pow(x, 2) + Math.pow(y, 2))
    //         // console.log("The radius squared", Math.pow(r, 2))
    //       }
    //     }
    //   }

    //   toggle2 = false
    //   console.log('ran')
    // }
    drawNeoLine()
  
    if (toggle === true) {
      console.log(sceneInfo3.neoLine.geometry)
      toggle = false
    }
  }

  function drawTriangle(x, y) {
    initialX = x
    initialY = y

    sceneInfo3.pen.position.x += .1
    drawNeoLine()
    sceneInfo3.pen.position.y += .1
    drawNeoLine()
    sceneInfo3.pen.position.x = initialX
    sceneInfo3.pen.position.y = initialY
    //drawNeoLine()
  }

  function drawNeoLine () {

    sceneInfo3.neoLinePoints.shift()
    sceneInfo3.neoLinePoints.push( new THREE.Vector3( sceneInfo3.pen.position.x, sceneInfo3.pen.position.y, 0 ) );

    sceneInfo3.neoLine.geometry = new THREE.BufferGeometry().setFromPoints(sceneInfo3.neoLinePoints)
    sceneInfo3.neoLineArray[lineCounter] = new THREE.Line(sceneInfo3.neoLine.geometry, sceneInfo3.neoLine.material)
    neoLineCounter++
    sceneInfo3.scene.add(sceneInfo3.neoLineArray[lineCounter])
  }

    function setupScene4() {
      const sceneInfo = makeScene(document.querySelector('#dodecahedron'));
      const geometry = new THREE.DodecahedronBufferGeometry(1, 1, 1);
      const material = new THREE.MeshPhongMaterial({color: 'red'});
      const mesh = new THREE.Mesh(geometry, material);
      sceneInfo.scene.add(mesh);
      sceneInfo.mesh = mesh;
      sceneInfo.camera.position.z = 4
      return sceneInfo;
    }
  const sceneInfo1 = setupScene1();
  const sceneInfo2 = setupScene2();
  const sceneInfo3 = setupScene3();
  const sceneInfo4 = setupScene4();


  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function renderSceneInfo(sceneInfo) {
    const {scene, camera, elem} = sceneInfo;

    // get the viewport relative position of this element
    const {left, right, top, bottom, width, height} =
        elem.getBoundingClientRect();

    const isOffscreen =
        bottom < 0 ||
        top > renderer.domElement.clientHeight ||
        right < 0 ||
        left > renderer.domElement.clientWidth;

    if (isOffscreen) {
      return;
    }

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    const positiveYUpBottom = renderer.domElement.clientHeight - bottom;
    renderer.setScissor(left, positiveYUpBottom, width, height);
    renderer.setViewport(left, positiveYUpBottom, width, height);

    renderer.render(scene, camera);
  }

  function pitchPlaneAnimation () {
    var rowVertices = 143
    var columnVertices = 131

    if (planeStoredBackRow !== planeBackRowAnimation) {
      planeStoredBackRow = planeBackRowAnimation
      for(i = 0; i < planeDimension; i++) {
        sceneInfo1.mesh.geometry.vertices[i].z = planeStoredBackRow[i]
      }
    }

    else {
      for(i = 0; i < planeDimension; i++) {
        if(sceneInfo1.mesh.geometry.vertices[i].z > 0) {
          sceneInfo1.mesh.geometry.vertices[i].z -= 0.01
        }
      }
    }
    sceneInfo1.mesh.geometry.verticesNeedUpdate = true

    for(columnVertices; columnVertices >= 11; columnVertices -= planeDimension) {
      for(rowVertices; rowVertices > columnVertices; rowVertices--) {
        sceneInfo1.mesh.geometry.vertices[rowVertices].z = sceneInfo1.mesh.geometry.vertices[rowVertices - planeDimension].z
      }
    }
  }

  var lineCounter = 0
  var movementRate = .01
  function beatLineAnimation() {
    var frustum = new THREE.Frustum();
    var cameraViewProjectionMatrix = new THREE.Matrix4();
    
    // every time the camera or objects change position (or every frame)
    
    sceneInfo2.camera.updateMatrixWorld(); // make sure the camera matrix is updated
    sceneInfo2.camera.matrixWorldInverse.getInverse( sceneInfo2.camera.matrixWorld );
    cameraViewProjectionMatrix.multiplyMatrices( sceneInfo2.camera.projectionMatrix, sceneInfo2.camera.matrixWorldInverse );
    frustum.setFromProjectionMatrix( cameraViewProjectionMatrix );

    if (frustum.intersectsObject(sceneInfo2.mesh) === false) {
      //need to make this not hardcoded
      sceneInfo2.mesh.position.x = -0.8
      
      for (var i = lineCounter; i >= 0; i--) {
        sceneInfo2.scene.remove(sceneInfo2.beatLineArray[i])
      }

      lineCounter = 0
      beatLinePoints = []
      beatLinePoints.push( new THREE.Vector3( sceneInfo2.mesh.position.x, sceneInfo2.mesh.position.y, 0 ) );
      beatLinePoints.push( new THREE.Vector3( sceneInfo2.mesh.position.x, sceneInfo2.mesh.position.y, 0 ) );
    
      sceneInfo2.beatLineArray = []
    }
    else {
      //console.log(sceneInfo2.beatLineArray)
          beatLinePoints.shift()
          beatLinePoints.push(new THREE.Vector3(sceneInfo2.mesh.position.x, sceneInfo2.mesh.position.y, 0))
          //console.log(sceneInfo2.beatLineArray)
          //console.log(factor)
          //console.log(sceneInfo2.mesh.position.x)
          sceneInfo2.beatLine.geometry = new THREE.BufferGeometry().setFromPoints(beatLinePoints)
          sceneInfo2.beatLineArray[lineCounter] = new THREE.Line(sceneInfo2.beatLine.geometry, sceneInfo2.beatLine.material)
          sceneInfo2.scene.add(sceneInfo2.beatLineArray[lineCounter])

          lineCounter++
          sceneInfo2.mesh.position.y = beatAnimation / 2
          sceneInfo2.mesh.position.x += movementRate
    }
  }


  function render(time) {

    time *= 0.001;
    pitchPlaneAnimation()
    beatLineAnimation()
    neoLineAnimation()

    resizeRendererToDisplaySize(renderer);

    renderer.setScissorTest(false);
    renderer.clear(true, true);
    renderer.setScissorTest(true);




    sceneInfo4.mesh.rotation.y = time * .1;

    renderSceneInfo(sceneInfo1);
    renderSceneInfo(sceneInfo2);
    renderSceneInfo(sceneInfo3);
    renderSceneInfo(sceneInfo4);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

}

//main();
function setSquaresArray (bars) {
  var result
  //console.log(bars.length)
  if (Math.sqrt(bars.length) % 1 !== 0 ) {
    var i = 0
    while (Math.sqrt(result) % 1 !== 0) {
      result = bars.length + i
      i++
    }
    //console.log(result)
    return Math.sqrt(result)
  }
}

    var trackPosition
    var initialMilliseconds
    var initialDate
    var id
    var elapsedMilliseconds
    var elapsedDate
    var elapsedTime = 0
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
        //console.log("New beat")
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
               
     if (elapsedTime + elapsedMilliseconds >= trackData.sectionsStart[sectionCounter] - syncCompensation) {
       sectionCounter++
       console.log("New section")
     }
     if (elapsedTime + elapsedMilliseconds >= trackData.barsStart[barCounter] - syncCompensation) {
       barCounter++
       console.log("New bar")
       console.log("barCounter", barCounter)
     }
     if (elapsedTime + elapsedMilliseconds >= trackData.tatumsStart[tatumCounter] - syncCompensation) {
       tatumCounter++
       //console.log("New tatum")
     }

     if (elapsedTime + elapsedMilliseconds >= trackData.segmentsStart[segmentCounter] - syncCompensation) {
      planeBackRowAnimation = trackData.segments[segmentCounter]['pitches']
      //console.log(trackData.segmentsStart[segmentCounter])
      //console.log(backRowAnimation)

      segmentCounter++
      //console.log("Segment hit", segmentCounter)
     }
    }
    function timerControl(paused) {

      if (paused === false) {
        startTimer()
      }

      else if (paused === true) {
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
      initialDate = new Date();
      initialMilliseconds = initialDate.getTime()
      //console.log("Start timer")

      id = setInterval(() => {
        elapsedDate = new Date();
        elapsedMilliseconds = elapsedDate.getTime() - initialMilliseconds;
        //console.log("Start timer Elapsed millis", elapsedMilliseconds)
        //console.log("Tracked time", elapsedTime + elapsedMilliseconds)
        checkForHits()

      }, 1);
    }

      function stopTimer () {
        clearInterval(id)
      }

    const token = 'BQDjtmyJPSj9eBeyFg7QDtVmYcW84fr86vP-K9SypN1fwLszAcORwX-WfP5BYfTh-JY_DWJiQeDa-P4wvZdE_HMGHoIqv7bGc01VgIZ47dkxdiyQLkhmkN0g1gm4ro0XQ3-4YAbfny0Uf4KMCEQwUl5U4SOMsw5dIQ';
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
        current_track_id = state['track_window']['current_track']['id']

        trackPosition = state['position']
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
            .then(trackData => neoDimension = setSquaresArray(trackData.bars))
            .then(timerControl(state['paused']))
            .then(res => main())

        }
        else {
          timerControl(state['paused'])
        }
    });
var trackPositionQueryRate = 10000
var trackPositionQuery
//add something to allow stop querying when we don't need to
    trackPositionQuery = setInterval(() => {
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
    }, trackPositionQueryRate)


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
  //   document.getElementById('toggle-button').addEventListener('click', function() {
  //     player.togglePlay().then(() => {
  //     console.log('Toggled!');

  //   });
  // });
};


