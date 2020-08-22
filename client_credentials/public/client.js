import {GLTFLoader} from "https://unpkg.com/three@0.119.1/examples/jsm/loaders/GLTFLoader.js"

window.onSpotifyWebPlaybackSDKReady = () => {

var beatAnimation = 0

var planeDimension = 12
var planeBackRowAnimation = [0,0,0,0,0,0,0,0,0,0,0,0]
var planeStoredBackRow = [0,0,0,0,0,0,0,0,0,0,0,0]
var squareDivision = 7
var neoDimension

var timbreSum1 = 0
var timbreSum2 = 0


function main() {

  const canvas2 = document.querySelector('#big');
  const canvas = document.querySelector('#c');
  const renderer2 = new THREE.WebGLRenderer({canvas, alpha: true, antialias: true});
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
      sceneInfo.camera.position.z = 1000
      var goalLineArray1 = [];
      var goalLineArray2 = [];
      
      goalLineArray1.push(new THREE.Vector3(-1000, 100, 0), new THREE.Vector3(1000, 100, 0));
      goalLineArray2.push(
        new THREE.Vector3(-1000, -100, 0),
        new THREE.Vector3(1000, -100, 0)
      );
      
      var goalLineMaterial = new THREE.LineBasicMaterial({ color: 'white', linewidth: 10 });
      var goalLine1Geometry = new THREE.BufferGeometry().setFromPoints(
        goalLineArray1
      );
      var goalLine2Geometry = new THREE.BufferGeometry().setFromPoints(
        goalLineArray2
      );
      var goalLine1 = new THREE.Line(goalLine1Geometry, goalLineMaterial);
      var goalLine2 = new THREE.Line(goalLine2Geometry, goalLineMaterial);
      // sceneInfo.scene.add(goalLine1);
      // sceneInfo.scene.add(goalLine2);

      const radius = 10;
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

      var beatLineMaterial = new THREE.LineBasicMaterial( { color: 'white', } );
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

      var planeWidth = 1.5
      var planeHeight = 1.5

      //Plane
      var planeGeometry = new THREE.PlaneGeometry( planeWidth, planeHeight, neoDimension, neoDimension);
      var planeMaterial = new THREE.MeshBasicMaterial();
      var plane = new THREE.Mesh( planeGeometry, planeMaterial );
      sceneInfo.planeWidth = planeWidth
      sceneInfo.planeHeight = planeHeight
      //sceneInfo.scene.add(plane);
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
      //neoLinePoints.push( new THREE.Vector3( pen.position.x, pen.position.y, 0 ) );
      //neoLinePoints.push( new THREE.Vector3( pen.position.x + 1, pen.position.y, 0 ) );
      var neoLineArray = []
      var neoLineMaterial = new THREE.LineBasicMaterial( { color: 'white', } );
      var neoLineGeometry = new THREE.BufferGeometry().setFromPoints(neoLinePoints)
      var neoLine = new THREE.Line(neoLineGeometry, neoLineMaterial)
      sceneInfo.neoLine = neoLine
      sceneInfo.neoLineArray = neoLineArray
      sceneInfo.neoLinePoints = neoLinePoints
      sceneInfo.scene.add(neoLine)

      return sceneInfo;
    }

    var toggle = true
    var neoStoredBarCounter = 0
    var neoLineCounter = 0
    var neoStoredSegCounter = 0
    var twoCounter = 0

    var boxWidth
    var boxDivisions

    var neoLineArray = []
  function neoLineAnimation() {

    
    if (neoStoredBarCounter !== barCounter) {
      console.log('ran')
      neoStoredBarCounter = barCounter
      sceneInfo3.neoLinePoints = []
      boxWidth = Math.abs(squaresArray[barCounter][0].x - squaresArray[barCounter][1].x)
      boxDivisions = boxWidth/7

      for (var i = 0; i < neoLineArray.length; i++) {
        sceneInfo3.scene.add(neoLineArray[i])
        
      }
      neoLineArray = []
    }

    if (neoStoredSegCounter !== segmentCounter) {
      neoStoredSegCounter = segmentCounter
      //console.log(sceneInfo3.neoLinePoints)
      sceneInfo3.neoLinePoints.push(new THREE.Vector2 (squaresArray[barCounter][0].x + (timbreSum1 * boxDivisions) + (boxWidth/2), squaresArray[barCounter][0].y - (timbreSum2 * boxDivisions - (boxWidth/2))))
      
      //console.log(boxWidth)
      twoCounter++
    }

    if (twoCounter === 3) {
      //need to change this so it's not a random number
      if (Math.random() < 0.5) {
        //console.log("line")
        var geometry = new THREE.BufferGeometry().setFromPoints(sceneInfo3.neoLinePoints)
        var material = new THREE.LineBasicMaterial( { color : 'white' } );
        var line = new THREE.Line(geometry, material)
        neoLineArray.push(line)
        //strokeArray.push(line)
        //sceneInfo3.scene.add(line)
      }
      else {
        //console.log("curve")
        var curve = new THREE.SplineCurve( sceneInfo3.neoLinePoints );
        var points = curve.getPoints( 50 );
        var geometry = new THREE.BufferGeometry().setFromPoints(points)
        var material = new THREE.LineBasicMaterial( { color : 'white' } );
        var splineObject = new THREE.Line( geometry, material );
        neoLineArray.push(splineObject)
        // //strokeArray.push(splineObject)
         //sceneInfo3.scene.add(splineObject)
      }
      sceneInfo3.neoLinePoints.shift()
      sceneInfo3.neoLinePoints.shift()
      twoCounter = 0
 
    }

  }

  
    var scene4Toggle = false
    function setupScene4() {

      const sceneInfo = makeScene(document.querySelector('#dodecahedron'));

      var dimensions = 5
      var bufferTexture = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
      var bufferScene = new THREE.Scene();
      var bufferLight = new THREE.DirectionalLight(0xffffff, 0.5 )
      bufferScene.add(bufferLight)
      //bufferScene.background = new THREE.Color('white')

      var geometry = new THREE.BoxGeometry(1, 1, 1);
      var material = new THREE.MeshBasicMaterial( { color: 'blue' } );
      var bufferCube = new THREE.Mesh( geometry, material );
      sceneInfo.bufferCube = bufferCube
      sceneInfo.bufferTexture = bufferTexture
      sceneInfo.bufferScene = bufferScene
      //bufferScene.add(bufferCube)

      var geometry = new THREE.PlaneGeometry(dimensions, dimensions , 100, 100);
      var material = new THREE.MeshBasicMaterial( {map: bufferTexture});
      var plane = new THREE.Mesh( geometry, material );
      plane.position.z = -1
      sceneInfo.scene.add( plane );
      sceneInfo.plane = plane


      var sculpture
      const loader = new GLTFLoader()
      loader.load("./Sculpture2.gltf", (object) => {
        sculpture = object.scene.children[2]

        sculpture.rotation.x = 9.5
        sculpture.position.x = 0
        sculpture.position.y = 5
        sculpture.position.z = -10
        sculpture.scale.x = 0.1
        sculpture.scale.y = 0.1
        sculpture.scale.z = 0.1
        sceneInfo.sculpture = sculpture
        sceneInfo.bufferScene.add(sculpture)
        scene4Toggle = true
      })

      console.log(plane)
      //we are trying to make the sculpture accessible for manipulation outside of the load function
      
      return sceneInfo;

    }
    var factor = -1.5
    var vector = 0.1
    var range = .1
    var shift = .01
    function distortObject(object) {

      if (factor + range > 1.5) {
          vector = -.1
          shift = -.01
          //console.log('Tic')
          //vector2 = -0.01
      }
      else if (factor - range < -1.5) {
          vector = .1
          shift = .01
          //console.log('Toc')
      }
      else {
          for (var i = 0; i < object.geometry.vertices.length; i++) {

              if (object.geometry.vertices[i].y > factor - range && object.geometry.vertices[i].y < factor + range ) {

                  object.geometry.vertices[i].x += shift
              }
      
          } 
      }
      
      factor += vector

      //console.log(factor)
  }
  var glitchPoint = 0
  var glitchRange = 1
  var glitchAmount = .1
  var glitchOriginalArray = []
  var glitchInterval
  var glitchStoredBarCounter
  function glitchDistort (object) {
    
    if (glitchStoredBarCounter !== barCounter) {
      glitchStoredBarCounter = barCounter
      //console.log('ran')
      glitchOriginalArray = object.geometry.vertices
      for (var i = 0; i < object.geometry.vertices.length; i++) {

        if (object.geometry.vertices[i].y > glitchPoint - glitchRange && object.geometry.vertices[i].y < glitchPoint + glitchRange ) {

            object.geometry.vertices[i].x += glitchAmount
        }

        object.geometry.verticesNeedUpdate = true

      }
      glitchInterval = setInterval( function () {
        resetGlitchDistort(object)
      }, 200)

    }


  }
  function resetGlitchDistort(object) {
    //console.log('run')
    clearInterval(glitchInterval)
    for (var i = 0; i < object.geometry.vertices.length; i++) {
      
      if (object.geometry.vertices[i].y > glitchPoint - glitchRange && object.geometry.vertices[i].y < glitchPoint + glitchRange ) {

        object.geometry.vertices[i].x -= glitchAmount
    }
          
      }
      object.geometry.verticesNeedUpdate = true

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

    if(sceneInfo === sceneInfo4) {
      renderer2.setScissor(left, positiveYUpBottom, width, height);
      renderer2.setViewport(left, positiveYUpBottom, width, height);
      sceneInfo4.plane.geometry.verticesNeedUpdate = true
      renderer2.setRenderTarget(sceneInfo4.bufferTexture)
      renderer2.render(sceneInfo4.bufferScene, camera)
      renderer2.setRenderTarget(null)
      renderer2.render(scene, camera);
      return
    }

    renderer.render(scene, camera);
  }

  function pitchPlaneAnimation () {
    var rowVertices = 143
    var columnVertices = 131

    if (planeStoredBackRow !== planeBackRowAnimation) {
      planeStoredBackRow = planeBackRowAnimation
      for(var i = 0; i < planeDimension; i++) {
        sceneInfo1.mesh.geometry.vertices[i].z = planeStoredBackRow[i]
      }
    }

    else {
      for(var i = 0; i < planeDimension; i++) {
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
  var movementRate = 5
  var velocity = 0;
  var acceleration = 0;

  var range = 30

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
      sceneInfo2.mesh.position.x = -500
      sceneInfo2.mesh.position.y = 0
      
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
          sceneInfo2.beatLine.geometry = new THREE.BufferGeometry().setFromPoints(beatLinePoints)
          sceneInfo2.beatLineArray[lineCounter] = new THREE.Line(sceneInfo2.beatLine.geometry, sceneInfo2.beatLine.material)
          sceneInfo2.scene.add(sceneInfo2.beatLineArray[lineCounter])
          lineCounter++
          
          //Physics
          
          acceleration = 800 / (beatAnimation - sceneInfo2.mesh.position.y)


          if (isFinite(acceleration) !== true) {
      
              acceleration = 0
              velocity *= 0.7
          }
      
          else if (sceneInfo2.mesh.position.y > beatAnimation - range && sceneInfo2.mesh.position.y < beatAnimation + range) {

              acceleration = 0
              velocity *= 0.7
          }
      
      
          velocity += acceleration;
      
          sceneInfo2.mesh.position.y += velocity;
          sceneInfo2.mesh.position.x += movementRate
      
        }
      
        if (sceneInfo2.mesh.position.y > 150 || sceneInfo2.mesh.position.y < -150) {
            sceneInfo2.mesh.position.y = sceneInfo2.mesh.position.y / 2 
        }
          
    }
  


  function render(time) {

    time *= 0.001;
    pitchPlaneAnimation()
    beatLineAnimation()
    neoLineAnimation()
    glitchDistort(sceneInfo4.plane)

    if(scene4Toggle === true) {
      sceneInfo4.sculpture.rotation.y += .01
      distortObject(sceneInfo4.plane)
    }
    
    resizeRendererToDisplaySize(renderer);

    renderer.setScissorTest(false);
    renderer.clear(true, true);
    renderer.setScissorTest(true);

    renderSceneInfo(sceneInfo1);
    renderSceneInfo(sceneInfo2);
    renderSceneInfo(sceneInfo3);
    renderer2.setRenderTarget(sceneInfo4.bufferTexture)
    renderSceneInfo(sceneInfo4);
    renderer2.setRenderTarget(null)
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
        if (beatAnimation === -100) {
          //console.log("Beat")
          beatAnimation = 100
          //console.log(beatAnimation)
        }
        else {
          beatAnimation = -100
          //console.log("Boop")
          //console.log(beatAnimation)
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
      var timbreArray = trackData.segments[segmentCounter].timbre
      var firstHalf = []
      var secondHalf = []
      for (var i = 0; i < timbreArray.length; i++) {
        if (i < 6) {
          firstHalf.push(timbreArray[i])
        }
        else {
          secondHalf.push(timbreArray[i])
        }

      }

      timbreSum1 = firstHalf.reduce(timbreReducer)
      timbreSum2 = secondHalf.reduce(timbreReducer)
      if (timbreSum1 > 0) {
        var negative = false
      }
      else {
        var negative = true
      }
      timbreSum1 = timbreSum1.toString()
      timbreSum1 = negative ? parseInt(timbreSum1[1]) * -1 : parseInt(timbreSum1[1])

      if (timbreSum2 > 0) {
        var negative = false
      }
      else {
        var negative = true
      }
      timbreSum2 = timbreSum2.toString()
      timbreSum2 = negative ? parseInt(timbreSum2[1]) * -1 : parseInt(timbreSum2[1])

      timbreSum1 = Math.ceil(timbreSum1 * .4)
      timbreSum2 = Math.ceil(timbreSum2 * .4)
      // console.log(timbreSum1)
      // console.log(timbreSum2)


      segmentCounter++

     }
    }

    function timbreReducer (acc, val) {
      
      return acc *= val

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

    const token = 'BQDMP5fT12iIiWppRH1tO0_UnBFeYs_o2upXJWklq6jiXFZ_9JadqEFP-NdQznlB3SNMgDMlrafwOdMwI3MOEzxOJh0yWl2TuPLdkKmLhtv-MYDrThR4-BpO3SwwbmNYLb1gIC_zFD3WHqW0oqJLnmI1wQCt4n5Tng';
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
var trackPositionQueryRate = 1000
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


