import {GLTFLoader} from "https://unpkg.com/three@0.119.1/examples/jsm/loaders/GLTFLoader.js"
import {AsciiEffect} from "https://unpkg.com/three@0.119.1/examples/jsm/effects/AsciiEffect.js"
import { AnaglyphEffect } from 'https://unpkg.com/three@0.119.1/examples/jsm/effects/AnaglyphEffect.js';
import {EffectComposer} from "https://unpkg.com/three@0.119.1/examples/jsm/postprocessing/EffectComposer.js"
import { RenderPass } from 'https://unpkg.com/three@0.119.1//examples/jsm/postprocessing/RenderPass.js';
import { GlitchPass } from 'https://unpkg.com/three@0.119.1//examples/jsm/postprocessing/GlitchPass.js';
import { FilmPass } from 'https://unpkg.com/three@0.119.1//examples/jsm/postprocessing/FilmPass.js';
import { ShaderPass } from 'https://unpkg.com/three@0.119.1//examples/jsm/postprocessing/ShaderPass.js';
import { DotScreenPass } from 'https://unpkg.com/three@0.119.1//examples/jsm/postprocessing/DotScreenPass.js';

var url = window.location.href
var tokenArray = url.split('=')
var tokenMain = tokenArray[1]
var refreshToken = tokenArray[2]

window.onSpotifyWebPlaybackSDKReady = () => {

var beatAnimation = 0

var planeDimension = 12
var planeBackRowAnimation = [0,0,0,0,0,0,0,0,0,0,0,0]
var planeStoredBackRow = [0,0,0,0,0,0,0,0,0,0,0,0]
var neoDimension

var timbreSum1 = 0
var timbreSum2 = 0

function runVisuals() {


  const canvas2 = document.querySelector('#big');
  const canvas = document.querySelector('#c');
  const renderer2 = new THREE.WebGLRenderer({canvas, alpha: true, antialias: true});

  const renderer = new THREE.WebGLRenderer({canvas, alpha: false, antialias: true});

  var analyglyphEffect = new AnaglyphEffect(renderer)
  var analyglyphEffect2 = new AnaglyphEffect(renderer2)

  var composer1 = new EffectComposer(renderer)
  var composer2 = new EffectComposer(renderer)
  var composer3 = new EffectComposer(renderer)
  var composer4 = new EffectComposer(renderer2)


  var glitchPass = new GlitchPass();
  glitchPass.enabled = false

  var filmPass = new FilmPass(1, 1, 600, false);
  filmPass.enabled = false
  
  var dotScreenPass = new ShaderPass()
  console.log(filmPass)

 



  
  //Broken AsciiEffect
  // const asciiEffect = new AsciiEffect(renderer, ' .:-+*=%@#', { invert: true } )
  // //const asciiEffect2 = new AsciiEffect(renderer2, ' .:-+*=%@#', { invert: true } )
  // asciiEffect.domElement.style.color = 'white';
  // asciiEffect.setSize(window.innerWidth, window.innerHeight)
  // document.body.appendChild( asciiEffect.domElement );
  


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
    for(var i = 0; i < planeDimension; i++) {
        plane.geometry.vertices[i].z = planeStoredBackRow[i]
    }
    

    var renderPass1 = new RenderPass( sceneInfo.scene, sceneInfo.camera );
    composer1.addPass( renderPass1 );
    composer1.addPass( glitchPass );
    composer1.addPass( filmPass );
    sceneInfo.scene.add(plane);
    plane.material.wireframe = true
    plane.rotation.set(-45, 0, 0)
    sceneInfo.camera.fov = 75
    sceneInfo.mesh = plane;

    return sceneInfo;
  }

  var beatLinePoints = new THREE.Geometry()



  function setupScene2() {
      const sceneInfo = makeScene(document.querySelector('#pyramid'));
      sceneInfo.camera.position.z = 1000
      var goalLineArray1 = new THREE.Geometry()
      // var goalLineArray2 = [];
      
      goalLineArray1.vertices.push(new THREE.Vector3(-1000, 100, 0));
      goalLineArray1.vertices.push(new THREE.Vector3(1000, 100, 0));

      var renderPass2 = new RenderPass( sceneInfo.scene, sceneInfo.camera );
      composer2.addPass( renderPass2 );
      composer2.addPass( glitchPass );
      composer2.addPass( filmPass );
      // goalLineArray2.push(
      //   new THREE.Vector3(-1000, -100, 0),
      //   new THREE.Vector3(1000, -100, 0)
      // );
      
      var goalLineMaterial = new MeshLineMaterial({color: 'white', lineWidth: 50})
      // var goalLine1Geometry = new THREE.BufferGeometry().setFromPoints(
      //   goalLineArray1
      // );
      // var goalLine2Geometry = new THREE.BufferGeometry().setFromPoints(
      //   goalLineArray2
      // );
      var goalLine1 = new MeshLine()
      // var goalLine2 = new MeshLine()
      goalLine1.setGeometry(goalLineArray1)
      // goalLine2.setGeometry(goalLine2Geometry)
      var goalLine1Mesh = new THREE.Mesh(goalLine1.geometry, goalLineMaterial)
      //sceneInfo.scene.add(goalLine1Mesh);
      
      //sceneInfo.scene.add(goalLine2);

      const radius = .1;
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

      var beatLineMaterial = new MeshLineMaterial( { color: 'white', lineWidth: 5} );
      var beatLine = new MeshLine()
      beatLine.setGeometry(beatLinePoints)
      
      var beatLineMesh = new THREE.Mesh(beatLine.geometry, beatLineMaterial)

      sceneInfo.scene.add(beatLineMesh)
      sceneInfo.beatLineMaterial = beatLineMaterial
      sceneInfo.beatLine = beatLine
      sceneInfo.beatLineMesh = beatLineMesh

      var beatLineArray = []
      sceneInfo.beatLineArray = beatLineArray
      return sceneInfo;
    }
    



    function setupScene3() {
      //Pen
      const sceneInfo = makeScene(document.querySelector('#plane'));

      var renderPass3 = new RenderPass( sceneInfo.scene, sceneInfo.camera );
      composer3.addPass( renderPass3 );
      composer3.addPass( glitchPass );
      composer3.addPass( filmPass );

      const radius = .02;
      const widthSegments = 1
      const heightSegments = 1
      const geometry = new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments);
      const material = new THREE.MeshPhongMaterial({
        color: 'white',
        flatShading: true,
      });
      const pen = new THREE.Mesh(geometry, material);

      pen.position.x = 0
      pen.position.y = 0
      //sceneInfo.scene.add(pen);
      sceneInfo.pen = pen;

      var planeWidth = 1.5
      var planeHeight = 1.5

      //Plane
      var planeGeometry = new THREE.PlaneGeometry( planeWidth, planeHeight, 10, 10);
      var planeMaterial = new THREE.MeshBasicMaterial();
      var plane = new THREE.Mesh( planeGeometry, planeMaterial );
      sceneInfo.planeGeometry = planeGeometry
      sceneInfo.planeMaterial = planeMaterial
      sceneInfo.plane = plane
      sceneInfo.planeWidth = planeWidth
      sceneInfo.planeHeight = planeHeight
      //sceneInfo.scene.add(plane);
      plane.material.wireframe = true
      plane.rotation.set(0, 0, 0)
      
      //Line
      var neoLinePoints = []
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

    var neoStoredBarCounter = 0
    var neoStoredSegCounter = 0
    var neoStoredSectionCounter = 0
    var neoStoredBeatCounter = 0
    var twoCounter = 0

    var boxDivisions
    var storedNeoDimension

    var neoLineArray = []
    var neoParagraphArray = []
    var squaresArray = []
    var sectionColors = [
      'red',
      'blue'
    ]
    var neoToggle = true
  function neoLineAnimation() {

    if(storedNeoDimension !== neoDimension) {

      for (var i = 0; i < neoParagraphArray.length; i++) {
        sceneInfo3.scene.remove(neoParagraphArray[i])
      }

      storedNeoDimension = neoDimension
      sceneInfo3.scene.remove(sceneInfo3.plane)
      sceneInfo3.planeGeometry = new THREE.PlaneGeometry( sceneInfo3.planeWidth, sceneInfo3.planeHeight, storedNeoDimension, storedNeoDimension);
      sceneInfo3.plane = new THREE.Mesh( sceneInfo3.planeGeometry, sceneInfo3.planeMaterial );
      //sceneInfo3.scene.add(sceneInfo3.plane)

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
            squaresArray[i][j] = sceneInfo3.plane.geometry.vertices[i + j + q]
          }
          else {
            k = neoDimension - 1
            squaresArray[i][j] = sceneInfo3.plane.geometry.vertices[i + j + k + q]
          }
        }
      }
      if (squaresArray.length === 0) {
        console.log('true')
        sceneInfo3.boxWidth = 0
      }
      else {
        sceneInfo3.boxWidth = Math.abs(squaresArray[0][0].x - squaresArray[0][1].x)
      }
      
    }
    if (neoStoredSectionCounter !== sectionCounter) {
      console.log('new section')
      analglyphControl()
      totalGlitch()
      totalFilm()
      neoToggle = true
      neoStoredSectionCounter = sectionCounter
    }
    
if (trackData !== undefined) {
  if (trackData.sectionsStart[neoStoredSectionCounter + 1] === trackData.beatsStart[beatCounter] && neoToggle === true) {
    neoToggle = false
    //console.log('ran')
    //neoStoredSectionCounter++
    neoStoredBeatCounter = beatCounter
    var segColorIndex = timbreSum1 % 2 === 0 ? 0 : 1
    var planeGeometry = new THREE.PlaneGeometry( sceneInfo3.boxWidth, sceneInfo3.boxWidth, 10, 10);
    var planeMaterial = new THREE.MeshBasicMaterial({color: sectionColors[segColorIndex]});
    var plane = new THREE.Mesh( planeGeometry, planeMaterial );
    plane.position.x = squaresArray[neoStoredBarCounter][0].x + sceneInfo3.boxWidth/2
    plane.position.y = squaresArray[neoStoredBarCounter][0].y - sceneInfo3.boxWidth/2
    plane.position.z = squaresArray[neoStoredBarCounter][0].z - 0.01
    neoParagraphArray.push(plane)
    sceneInfo3.scene.add(plane)
  
  }
}


    neoStoredBeatCounter = beatCounter
    // if (neoStoredBarCounter > barCounter) {
    //   for (var i = neoStoredBarCounter; i > -1 ; i-- ) {
    //     sceneInfo3.scene.remove(neoParagraphArray[i])
    //   }
    //   neoStoredBarCounter = barCounter
    // }
    if (neoStoredBarCounter !== barCounter && barCounter !== undefined) {
      neoStoredBarCounter = barCounter

      sceneInfo3.neoLinePoints = []

      boxDivisions = sceneInfo3.boxWidth/7
      // console.log("neoLineAnim barCounter", barCounter)
      // console.log(neoStoredBarCounter)
      sceneInfo3.pen.position.x = squaresArray[neoStoredBarCounter][0].x + (sceneInfo3.boxWidth/2)
      sceneInfo3.pen.position.y = squaresArray[neoStoredBarCounter][0].y - (sceneInfo3.boxWidth/2)
      for (var i = 0; i < neoLineArray.length; i++) {
        sceneInfo3.scene.add(neoLineArray[i])
      }
      neoLineArray = []

    }

    if (neoStoredSegCounter !== segmentCounter) {
      neoStoredSegCounter = segmentCounter
      sceneInfo3.neoLinePoints.push(new THREE.Vector2 (squaresArray[neoStoredBarCounter][0].x 
        + (timbreSum1 * boxDivisions) 
        + (sceneInfo3.boxWidth/2), 
        squaresArray[neoStoredBarCounter][0].y 
        + (timbreSum2 * boxDivisions 
        - (sceneInfo3.boxWidth/2))))
      
      twoCounter++
    }

    if (twoCounter === 3) {
      //need to change this so it's not a random number
      if (timbreSum1 % 2 === 0) {
        //console.log("line")
        var geometry = new THREE.BufferGeometry().setFromPoints(sceneInfo3.neoLinePoints)
        var material = new THREE.LineBasicMaterial( { color : 'white' } );
        var line = new THREE.Line(geometry, material)
        neoLineArray.push(line)
        neoParagraphArray.push(line)

      }
      else {
        //console.log("curve")
        var curve = new THREE.SplineCurve( sceneInfo3.neoLinePoints );
        var points = curve.getPoints( 50 );
        var geometry = new THREE.BufferGeometry().setFromPoints(points)
        var material = new THREE.LineBasicMaterial( { color : 'white' } );
        var splineObject = new THREE.Line( geometry, material );
        neoLineArray.push(splineObject)
        neoParagraphArray.push(splineObject)

      }
      sceneInfo3.neoLinePoints.shift()
      sceneInfo3.neoLinePoints.shift()
      twoCounter = 0
 
    }

  }
  var effectType = 'glitch'
  function totalGlitch() {
    var random = getRandomInt(3)
    if(random === 0) {

      sceneInfo2.beatLineMaterial.lineWidth = 20
      setAnalglyphEffect = 'effect'
      effectType = 'glitch'

      setTimeout(function() {
        setAnalglyphEffect = 'analglyph'
        glitchPass.enabled = false
      }, 100)
      sceneInfo2.beatLineMaterial.lineWidth = 5
    }

  }

  function totalFilm() {


    var random = getRandomInt(3)
    if(random !== 10) {
      console.log('runn')
      
      setAnalglyphEffect = 'effect'
      effectType = 'film'

      setTimeout(function() {
        setAnalglyphEffect = 'analglyph'
        filmPass.enabled = false
      }, 10000)
      
    }

  }
    var scene4Toggle = false
    function setupScene4() {

      const sceneInfo = makeScene(document.querySelector('#dodecahedron'));
      var renderPass4 = new RenderPass(sceneInfo.scene, sceneInfo.camera)
      composer4.addPass( renderPass4 );
      composer4.addPass(filmPass)

      var dimensions = 5
      var bufferTexture = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
      var bufferScene = new THREE.Scene();
      bufferScene.background = new THREE.Color('white')
      var bufferLight = new THREE.DirectionalLight(0xffffff, 0.5 )
      bufferScene.add(bufferLight)
      

      var geometry = new THREE.BoxGeometry(1, 1, 1);
      var material = new THREE.MeshBasicMaterial( { color: 'blue' } );
      var bufferCube = new THREE.Mesh( geometry, material );
      sceneInfo.bufferCube = bufferCube
      sceneInfo.bufferTexture = bufferTexture
      sceneInfo.bufferScene = bufferScene


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
        //sculpture.material.wireframe = true
        sceneInfo.sculpture = sculpture
        sceneInfo.bufferScene.add(sculpture)
        scene4Toggle = true
      })
      return sceneInfo;
    }

    var factor = -1.5
    var vector = 0.1
    var flickerRange = .1
    var shift = .01
    var terminus = 1.4
    var flicker = true
    var flickerInterval = setInterval(function () {
      //factor = -1.5

    }, 1000)

    function flickerObject(object) {
//need to prevent this from shifting over infinitely
      if(factor < terminus) {
        if (factor + flickerRange > 1.5) {
          vector = -.1
          shift = -.01

      }
      else if (factor - flickerRange < -1.5) {
          vector = .1
          shift = .01

      }
      else {

          for (var i = 0; i < object.geometry.vertices.length; i++) {

              if (object.geometry.vertices[i].y > factor - flickerRange && object.geometry.vertices[i].y < factor + flickerRange ) {
                
                  object.geometry.vertices[i].x += shift
              }
      
          } 
      }

      factor += vector

      object.geometry.verticesNeedUpdate = true
      }

  }
  var glitchPoint = 0
  var glitchRange = 1
  var glitchAmount = .1
  var glitchOriginalArray = []
  var glitchStoredBarCounter
  function glitchDistort (object) {
    
    if (glitchStoredBarCounter !== barCounter) {
      // console.log('glitched')
      glitchStoredBarCounter = barCounter
      glitchOriginalArray = object.geometry.vertices
      for (var i = 0; i < object.geometry.vertices.length; i++) {

        if (object.geometry.vertices[i].y > glitchPoint - glitchRange && object.geometry.vertices[i].y < glitchPoint + glitchRange ) {

            object.geometry.vertices[i].x += glitchAmount
        }

        object.geometry.verticesNeedUpdate = true

      }
      setTimeout( function () {
        resetGlitchDistort(object)
      }, 200)

    }


  }
  function resetGlitchDistort(object) {


    for (var i = 0; i < object.geometry.vertices.length; i++) {
      
      if (object.geometry.vertices[i].y > glitchPoint - glitchRange && object.geometry.vertices[i].y < glitchPoint + glitchRange ) {

        object.geometry.vertices[i].x -= glitchAmount
    }
          
      }
      object.geometry.verticesNeedUpdate = true

  }

var analglyphStoredBarCounter
var checkForUndoAnalGlyphControl = false
var analglyphBarLength
var analglyphFade
var analglyphFadeRate = .003
var analglyphFadeLength = 2

  function analglyphControl() {
    analglyphStoredBarCounter = barCounter
    if (getRandomInt(2) === 10) {
        sceneInfo4.bufferScene.background = new THREE.Color('blue')
        analglyphBarLength = 2
        checkForUndoAnalGlyphControl =  true
    }
    else {
       analglyphFadeRate = (1 / ((trackData.barsStart[barCounter + 1] - trackData.barsStart[barCounter]) / 5)) * analglyphFadeLength
      console.log(analglyphFadeRate)
      analglyphBarLength = 4
        analglyphFade = setInterval(function() {
          if (sceneInfo4.bufferScene.background.r > 0) {
            sceneInfo4.bufferScene.background.r -= analglyphFadeRate

          }
        }, 5)
        checkForUndoAnalGlyphControl =  true
      }
        
    }


  function undoAnalGlyphControl(numOfBars)  {

    
    if(barCounter === analglyphStoredBarCounter + numOfBars) {
    clearInterval(analglyphFade)
    sceneInfo4.bufferScene.background = new THREE.Color('white')
    checkForUndoAnalGlyphControl = false
  }
  }

  // setInterval(function() {
  //   console.log(sceneInfo4.bufferScene.background)
  // }, 1000)

  function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
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
  var setAnalglyphEffect = 'analglyph'
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
      //renderer2 renders to bufferTexture
      renderer2.setRenderTarget(sceneInfo4.bufferTexture)
      renderer2.render(sceneInfo4.bufferScene, camera)
      //set target to the main scene to render the plane with Buffertexture map
      renderer2.setRenderTarget(null)
      // renderer2.render(scene, camera);
      //scene 4 render
      
       analyglyphEffect2.render(scene, camera);
      return
    }

// rest of scene render
    switch (setAnalglyphEffect) {
        case 'none':
          renderer.render(scene, camera);
          break
        case 'analglyph':
          analyglyphEffect.render(scene, camera);
          break

        case 'effect':
          switch(effectType) {
            case 'glitch':
              glitchPass.enabled = true
              break
            case 'film':
              filmPass.enabled = true
              break
          }

          switch(sceneInfo) {
            
            case sceneInfo1:
              composer1.render(scene, camera)
              break;

            case sceneInfo2:
                composer2.render(scene, camera)
              break;
            
            case sceneInfo3:
                composer3.render(scene, camera)
              break;
              
            }


    }



    
  }

  // setInterval(function() {
  //   var random = getRandomInt(3)
  //   switch (random) {
  //     case 0:
  //       setAnalglyphEffect = 'none'
  //       break;
  //     case 1:
  //       setAnalglyphEffect = 'glitch'
  //       break;
  //     case 2:
  //       setAnalglyphEffect = 'analglyph'
  //       break;
  //   }
  //   console.log(setAnalglyphEffect)
  // }, 5000)


  function asciiSceneInfo(sceneInfo) {


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

    // if(sceneInfo === sceneInfo4) {
    //   renderer2.setScissor(left, positiveYUpBottom, width, height);
    //   renderer2.setViewport(left, positiveYUpBottom, width, height);
    //   sceneInfo4.plane.geometry.verticesNeedUpdate = true
    //   renderer2.setRenderTarget(sceneInfo4.bufferTexture)
    //   renderer2.render(sceneInfo4.bufferScene, camera)
    //   renderer2.setRenderTarget(null)
    //   renderer2.render(scene, camera);
    //   return
    // }

    asciiEffect.render(scene, camera);

  }

setInterval(function() {
    flowToggle = !flowToggle
}, 50)
var flowToggle = true
  function pitchPlaneAnimation () {
    var rowVertices = 143
    var columnVertices = 131

    if (planeStoredBackRow === planeBackRowAnimation) {
      //Decay effect &
      for(var i = 0; i < planeDimension; i++) {
        if(sceneInfo1.mesh.geometry.vertices[i].z > 0) {
          if (flowToggle === true) {
            sceneInfo1.mesh.geometry.vertices[i].z -= 0.0125
            
          }
          else {
            sceneInfo1.mesh.geometry.vertices[i].z += 0.0025
            
          }
          
        }
      }
    }
    else {
      planeStoredBackRow = planeBackRowAnimation
        for(var i = 0; i < planeDimension; i++) {
            sceneInfo1.mesh.geometry.vertices[i].z = planeStoredBackRow[i]
          }
      }

    sceneInfo1.mesh.geometry.verticesNeedUpdate = true
    //Push backrow forward
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

      sceneInfo2.mesh.position.x = -sceneInfo2.mesh.position.x * 0.7

      for (var i = lineCounter; i >= 0; i--) {
        sceneInfo2.scene.remove(sceneInfo2.beatLineArray[i])
      }

      lineCounter = 0
      beatLinePoints = new THREE.Geometry()
      beatLinePoints.vertices.push( new THREE.Vector3( sceneInfo2.mesh.position.x, sceneInfo2.mesh.position.y, 0 ) );
      beatLinePoints.vertices.push( new THREE.Vector3( sceneInfo2.mesh.position.x, sceneInfo2.mesh.position.y, 0 ) );
    
      sceneInfo2.beatLineArray = []

    }
    else {

          beatLinePoints.vertices.push(new THREE.Vector3(sceneInfo2.mesh.position.x, sceneInfo2.mesh.position.y, 0))

          sceneInfo2.beatLine = new MeshLine()
          sceneInfo2.beatLine.setGeometry(beatLinePoints)
          sceneInfo2.beatLineArray[lineCounter] = new THREE.Mesh(sceneInfo2.beatLine.geometry, sceneInfo2.beatLineMaterial)

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

    if(checkForUndoAnalGlyphControl === true) {
      undoAnalGlyphControl(analglyphBarLength)
    }

    if(scene4Toggle === true) {
      sceneInfo4.sculpture.rotation.y += .01
      flickerObject(sceneInfo4.plane)
    }
    
    resizeRendererToDisplaySize(renderer);

    renderer.setScissorTest(false);
    renderer.clear(true, true);
    renderer.setScissorTest(true);
    
    renderSceneInfo(sceneInfo1);
    renderSceneInfo(sceneInfo2);
    renderSceneInfo(sceneInfo3);
    renderSceneInfo(sceneInfo4);

    requestAnimationFrame(render);
  }
  
  requestAnimationFrame(render);
}

function getNeoDimension (bars) {
  var result

  if (Math.sqrt(bars.length) % 1 !== 0 ) {
    var i = 0
    while (Math.sqrt(result) % 1 !== 0) {
      result = bars.length + i
      i++
    }
    return Math.sqrt(result)
  }
  else{
    return Math.sqrt(bars.length)
  }
}
runVisuals()


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
      
      while(truthCond === true && i < divisionNameStart.length) {
        if (divisionNameStart[i] > trackPosition) {
          divisionCounter = i
          if (divisionName === 'bar') {
             //console.log("Find next division", divisionName + "Counter", divisionCounter)
          }
          
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


        }
        else {
          beatAnimation = -100
          //console.log("Boop")

        }

        beatCounter++
      }
               
     if (elapsedTime + elapsedMilliseconds >= trackData.sectionsStart[sectionCounter + 1] - syncCompensation) {

      sectionCounter++
       console.log("Check for hits New section")
     }
     if (elapsedTime + elapsedMilliseconds >= trackData.barsStart[barCounter] - syncCompensation) {
       barCounter++

       //console.log("check for hits barCounter", barCounter)
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
      //  console.log("timbreSum1", timbreSum1)
    //    console.log("timberSum2", timbreSum2)


      segmentCounter++

     }
    }


    function timbreReducer (acc, val) {
      
      return acc *= val

    }

    function timerControl(paused) {
        // console.log('timerControl')
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
      sectionCounter = findNextDivision(trackData.sectionsStart, sectionCounter, "section") - 1

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

    
    var player = new Spotify.Player({
      name: 'Hyporeal',
      getOAuthToken: callback => { 
        var refreshURL = './refresh_token?refresh_token=' + refreshToken  
        fetch(refreshURL, {
            method: 'GET'
        })
        .then(res => res.json())
        .then(data => {
            tokenMain = data.access_token
            return callback(tokenMain)
        }) 
        }
    });

    // Error handling
    player.addListener('initialization_error', ({ message }) => { console.error(message); });
    player.addListener('authentication_error', ({ message }) => {console.error(message);});
    player.addListener('account_error', ({ message }) => { console.error(message); });
    player.addListener('playback_error', ({ message }) => { console.error(message); });

    var current_track_id
    var stored_track_id = 0
    var trackData

    // Playback status updates
      player.addListener('player_state_changed', state => { 
        if (state === undefined) {
          clearInterval(trackPositionQuery)
        }
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
            .then(trackData => {
              neoDimension = getNeoDimension(trackData.bars)

            })
            .then(res => timerControl(state['paused']))
        }
        else {

            trackPosition = state['position']
            elapsedTime = trackPosition
            if (trackData !== undefined) {
                timerControl(state['paused'])
            }
          
        }
    });
var trackPositionQueryRate = 1000
var trackPositionQuery
function startTrackPositionQuery () {
  trackPositionQuery = setInterval(() => {
    player.getCurrentState().then(state => {
      if(!state) {
        console.log("No music playing")
        return
      }
      trackPosition = state['position']
      elapsedTime = trackPosition
      //console.log("Query trackPosition", trackPosition)
      if (state['paused'] === false && trackData !== undefined) {
        startTimer()
      }
    })
  }, trackPositionQueryRate)
}
startTrackPositionQuery()

function stopTrackPositionQuery() {
  clearInterval(trackPositionQuery)
}
//add something to allow stop querying when we don't need to


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


