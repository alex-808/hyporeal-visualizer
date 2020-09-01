import {GLTFLoader} from "https://unpkg.com/three@0.119.1/examples/jsm/loaders/GLTFLoader.js"
import {AsciiEffect} from "https://unpkg.com/three@0.119.1/examples/jsm/effects/AsciiEffect.js"
import { AnaglyphEffect } from 'https://unpkg.com/three@0.119.1/examples/jsm/effects/AnaglyphEffect.js';
import {EffectComposer} from "https://unpkg.com/three@0.119.1/examples/jsm/postprocessing/EffectComposer.js"
import { RenderPass } from 'https://unpkg.com/three@0.119.1//examples/jsm/postprocessing/RenderPass.js';
import { GlitchPass } from 'https://unpkg.com/three@0.119.1//examples/jsm/postprocessing/GlitchPass.js';
import { FilmPass } from 'https://unpkg.com/three@0.119.1//examples/jsm/postprocessing/FilmPass.js';
import { ShaderPass } from 'https://unpkg.com/three@0.119.1//examples/jsm/postprocessing/ShaderPass.js';
import { DotScreenPass } from 'https://unpkg.com/three@0.119.1//examples/jsm/postprocessing/DotScreenPass.js';
import { FXAAShader } from 'https://unpkg.com/three@0.119.1//examples/jsm/shaders/FXAAShader.js'

import { TexturePass } from 'https://unpkg.com/three@0.119.1//examples/jsm/postprocessing/TexturePass.js';
import { ClearPass } from 'https://unpkg.com/three@0.119.1//examples/jsm/postprocessing/ClearPass.js';
import { MaskPass, ClearMaskPass } from 'https://unpkg.com/three@0.119.1//examples/jsm/postprocessing/MaskPass.js';
import { CopyShader } from 'https://unpkg.com/three@0.119.1//examples/jsm/shaders/CopyShader.js';


var url = window.location.href
var tokenArray = url.split('=')
var tokenMain
var refreshToken = tokenArray[1]


window.addEventListener('unload', function(event) {
  fetch('./session_destroy', {
    method: 'POST'
  })
})

window.onSpotifyWebPlaybackSDKReady = () => {

var beatAnimation = 0

var planeDimension = 12
var planeBackRowAnimation = [0,0,0,0,0,0,0,0,0,0,0,0]
var planeStoredBackRow = [0,0,0,0,0,0,0,0,0,0,0,0]
var neoDimension

var timbreSum1 = 0
var timbreSum2 = 0

var checkForUndoAnalGlyphControl = false
var hardRefresh = true
var clearParagraph = true

function runVisuals() {


  const canvas2 = document.querySelector('#big');
  const canvas = document.querySelector('#c');
  
  const renderer2 = new THREE.WebGLRenderer({canvas, alpha: true, antialias: true});

  const renderer = new THREE.WebGLRenderer({canvas, alpha: false, antialias: true});

  renderer.setPixelRatio(window.devicePixelRatio)
  renderer2.setPixelRatio(window.devicePixelRatio)

  var analyglyphEffect = new AnaglyphEffect(renderer)
  var analyglyphEffect2 = new AnaglyphEffect(renderer2)



  var composer1 = new EffectComposer(renderer)
  var composer2 = new EffectComposer(renderer)
  var composer3 = new EffectComposer(renderer)



  var glitchPass = new GlitchPass();
  glitchPass.enabled = false

  var filmPass = new FilmPass(1, 1, 600, false);
  filmPass.enabled = false
  
  var dotScreenPass = new DotScreenPass( new THREE.Vector2( 0,0 ), .75, 1 );
  dotScreenPass.enabled = false

  // var FXAAPass = new ShaderPass(FXAAShader)



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
    composer1.addPass ( dotScreenPass)

    sceneInfo.scene.add(plane);
    plane.material.wireframe = true
    plane.rotation.set(-45, 0, 0)
    sceneInfo.camera.fov = 75
    sceneInfo.mesh = plane;

    return sceneInfo;
  }

  var beatLinePoints = []

  function setupScene2() {
      const sceneInfo = makeScene(document.querySelector('#pyramid'));

      sceneInfo.scene.remove(camera)
      sceneInfo.camera.position.z = 1000
      var goalLineArray1 = new THREE.Geometry()
      // var goalLineArray2 = [];
      var camera = new THREE.OrthographicCamera( sceneInfo.elem.width / - 2, sceneInfo.elem.width / 2, sceneInfo.elem.height / 2, sceneInfo.elem.height / - 2, 1, 1000 );
      sceneInfo.scene.add( camera );
      
      goalLineArray1.vertices.push(new THREE.Vector3(-1000, 100, 0));
      goalLineArray1.vertices.push(new THREE.Vector3(1000, 100, 0));

      var renderPass2 = new RenderPass( sceneInfo.scene, sceneInfo.camera );
      composer2.addPass( renderPass2 );
      composer2.addPass( glitchPass );
      composer2.addPass( filmPass );
        // composer2.addPass(FXAAPass)
      // goalLineArray2.push(
      //   new THREE.Vector3(-1000, -100, 0),
      //   new THREE.Vector3(1000, -100, 0)
      // );
      
      var goalLineMaterial = new MeshLineMaterial({color: 'white', lineWidth: 5})
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

      var beatLineMaterial = new MeshLineMaterial( { color: 'white', lineWidth: 2, sizeAttenuation: 1} );
      // var beatLineMaterial = new THREE.MeshBasicMaterial( { color: 'white'} );
      
      var beatLine = new MeshLine()
      // beatLinePoints.push( new THREE.Vector2( 1, 1, 0 ) );
      // beatLinePoints.push( new THREE.Vector2( 10, 1, 0 ) );
      // beatLine.setVertices(beatLinePoints)

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

      sceneInfo.neoLinePoints = neoLinePoints
      sceneInfo.scene.add(neoLine)

      return sceneInfo;
    }

    var scene4Toggle = false

    function setupScene4() {

      const sceneInfo = makeScene(document.querySelector('#dodecahedron'));
      var background = new THREE.TextureLoader().load('./tunnel.jpg')
      background.minFilter = THREE.LinearFilter;
      var clearPass = new ClearPass()
      var clearMaskPass = new ClearMaskPass()

      var texturePass = new TexturePass( background );
      var outputPass = new ShaderPass( CopyShader );
      
      var bufferTexture = new THREE.WebGLRenderTarget( window.innerHeight, window.innerWidth, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
      var bufferScene = new THREE.Scene();
      bufferScene.background = new THREE.Color('white')
      var bufferLight = new THREE.DirectionalLight(0xffffff, 0.5 )
      const fov = 45;
      const aspect = 2;  // the canvas default
      const near = 0.1;
      const far = 1000;
      const bufferCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);
      bufferCamera.position.set(0, 0, 2);
      bufferCamera.lookAt(0, 0, 0);
      sceneInfo.bufferCamera = bufferCamera
      bufferScene.add(bufferCamera)

      bufferScene.add(bufferLight)
      var maskPass = new MaskPass(bufferScene, bufferCamera)
 
      var geometry = new THREE.BoxGeometry(1, 1, 1);
      var material = new THREE.MeshBasicMaterial( { color: 'blue' } );
      var bufferCube = new THREE.Mesh( geometry, material );
      sceneInfo.bufferCube = bufferCube
      sceneInfo.bufferTexture = bufferTexture
      sceneInfo.bufferScene = bufferScene

      var composer4 = new EffectComposer(renderer2, bufferTexture)
      sceneInfo.composer4 = composer4
      var renderPass4 = new RenderPass(sceneInfo.bufferScene, sceneInfo.camera)
      composer4.addPass( renderPass4 );
      // // composer4.addPass(filmPass)
      composer4.addPass(dotScreenPass)
      composer4.addPass( clearPass );
      composer4.addPass( maskPass );
      composer4.addPass( texturePass );
      composer4.addPass( clearMaskPass );
      composer4.addPass( outputPass );

      var geometrySegments = 100
      // var geometrySegments = 1

      var geometry = new THREE.PlaneGeometry(canvas.width/60, canvas.height/60 , geometrySegments, geometrySegments);
      // var geometry = new THREE.PlaneGeometry(2, 2 , 100, 100);
      var material = new THREE.MeshBasicMaterial( {map: bufferTexture});
      var plane = new THREE.Mesh( geometry, material );
      plane.position.z = -1
      sceneInfo.scene.add( plane );
      sceneInfo.geometry = geometry
      sceneInfo.plane = plane

      // for (var i = 0; i < plane.geometry.vertices.length; i++) {
      //   originalGeometry.push(plane.geometry.vertices[i])
      // }

      var originalGeometry = JSON.parse(JSON.stringify(plane.geometry.vertices))
      
      plane.originalGeometry = originalGeometry
      // console.log(plane.geometry.vertices === originalGeometry)


      var sculptureArray = [
        './venus3.gltf',
        './youngwarrior.gltf',
        './SculptureBlue.gltf'
      ]
      var sculpture
      var light
      const loader = new GLTFLoader()
      loader.load(sculptureArray[getRandomInt(3)], (object) => {
        
        sculpture = object.scene
        console.log(sculpture)


        sceneInfo.sculpture = sculpture
        sceneInfo.bufferScene.add(sculpture)
        scene4Toggle = true
        // console.log(object)
      })
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
    var neoMaxWords = 250
    var squaresArray = []
    var sectionColors = [
      'red',
      'blue'
    ]
    var neoToggle = true
    var glitchTheBar = false
    var allowGlitchBars = 0

  function neoLineAnimation() {
    if(storedNeoDimension !== neoDimension) {

      storedNeoDimension = neoDimension
      sceneInfo3.scene.remove(sceneInfo3.plane)
      sceneInfo3.planeGeometry = new THREE.PlaneGeometry( sceneInfo3.planeWidth, sceneInfo3.planeHeight, storedNeoDimension, storedNeoDimension);
      sceneInfo3.plane = new THREE.Mesh( sceneInfo3.planeGeometry, sceneInfo3.planeMaterial );
      //sceneInfo3.scene.add(sceneInfo3.plane)

      var q = 0
      var k = 0
      squaresArray = []
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

    function getNewEffect(maxRandom) {
      var random = getRandomInt(maxRandom)
      switch(random) {
        case 0:
          console.log('fader')
          totalFader()
          break
        case 1:
          console.log('glitch')
          totalGlitch()
          break
        case 2:
          console.log('film')
          totalFilm()
          break
        case 3:
          console.log('none and maybe fader')
          totalNone()
          if(getRandomInt(2) === 0) {
            totalFader()
          }
          break
        case 4:
          console.log('analglyph')
          setAnalglyphEffect = 'analglyph'
          totalFader()
          break
          
      }

    }
    if(allowGlitchBars < 1) {
      
      allowGlitchReset = true

    }
    if (neoStoredSectionCounter !== sectionCounter && sectionCounter && trackData) {
      // console.log('sectionCounter', sectionCounter)
      neoStoredSectionCounter = sectionCounter
      getNewEffect(5)
      if(getRandomInt(2) === 0) {
        console.log('glitch reset disabled')
        allowGlitchReset = false
        allowGlitchBars = 4
      }

      neoToggle = false
      //console.log('ran')
      //neoStoredSectionCounter++
      neoStoredBeatCounter = beatCounter
      var segColorIndex = timbreSum1 % 2 === 0 ? planeMaterialRed : planeMaterialBlue
      
      
      var plane = new THREE.Mesh( planeGeometry, segColorIndex );
      plane.position.x = squaresArray[neoStoredBarCounter][0].x + sceneInfo3.boxWidth/2
      plane.position.y = squaresArray[neoStoredBarCounter][0].y - sceneInfo3.boxWidth/2
      plane.position.z = squaresArray[neoStoredBarCounter][0].z - 0.01
      neoParagraphArray.push(plane)
      sceneInfo3.scene.add(plane)

      neoToggle = true
      
    }
    var planeGeometry = new THREE.PlaneBufferGeometry( sceneInfo3.boxWidth, sceneInfo3.boxWidth);
    var planeMaterialBlue = new THREE.MeshBasicMaterial({color: 'blue'});
    var planeMaterialRed = new THREE.MeshBasicMaterial({color: 'red'});

    

    if (trackData !== undefined) {
      if (trackData.sectionsStart[neoStoredSectionCounter + 1] === trackData.beatsStart[beatCounter] && neoToggle === true) {
        neoToggle = false
    

        //console.log('ran')
        //neoStoredSectionCounter++
        neoStoredBeatCounter = beatCounter
        var segColorIndex = timbreSum1 % 2 === 0 ? planeMaterialRed : planeMaterialBlue
        
        
        var plane = new THREE.Mesh( planeGeometry, segColorIndex );
        plane.position.x = squaresArray[neoStoredBarCounter][0].x + sceneInfo3.boxWidth/2
        plane.position.y = squaresArray[neoStoredBarCounter][0].y - sceneInfo3.boxWidth/2
        plane.position.z = squaresArray[neoStoredBarCounter][0].z - 0.01
        neoParagraphArray.push(plane)
        sceneInfo3.scene.add(plane)
      
      }
    }

    // if (neoStoredBarCounter > barCounter) {
    //   for (var i = neoStoredBarCounter; i > -1 ; i-- ) {
    //     sceneInfo3.scene.remove(neoParagraphArray[i])
    //   }
    //   neoStoredBarCounter = barCounter
    // }
    if (neoStoredBarCounter !== barCounter && barCounter !== undefined) {
      // allowGlitchReset = true
      allowGlitchBars--
      neoStoredBarCounter = barCounter
      glitchDistort(sceneInfo4.plane)
      if(getRandomInt(4) === 0) {
        getNewEffect(2)

      }

      if(getRandomInt(4) === 0) {
        glitchTheBar = 4

      }



      // bigScreen(sceneInfoArray[getRandomInt(4)])

      sceneInfo3.neoLinePoints = []

      boxDivisions = sceneInfo3.boxWidth/7
      // console.log("neoLineAnim barCounter", barCounter)
      // console.log(neoStoredBarCounter)
      sceneInfo3.pen.position.x = squaresArray[neoStoredBarCounter][0].x + (sceneInfo3.boxWidth/2)
      sceneInfo3.pen.position.y = squaresArray[neoStoredBarCounter][0].y - (sceneInfo3.boxWidth/2)
      for (var i = 0; i < neoLineArray.length; i++) {
        sceneInfo3.scene.add(neoLineArray[i])
        //delete neoLineArray[i]
      }

      neoLineArray = []
      if(neoParagraphArray.length > neoMaxWords) {
        console.log(neoParagraphArray.length - neoMaxWords)
        for(var i = 0; i = neoParagraphArray.length - neoMaxWords; i++) {
          sceneInfo3.scene.remove(neoParagraphArray[0])
          neoParagraphArray.shift()
          console.log('removed extra')
        }
      }
    }

    if (neoStoredBeatCounter !== beatCounter && glitchTheBar > 0) {
      glitchTheBar--
      glitchDistort(sceneInfo4.plane)
    }

    neoStoredBeatCounter = beatCounter

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
    var material = new THREE.LineBasicMaterial( { color : 'white' } );
    if (twoCounter === 3) {

      if (timbreSum1 % 2 === 0) {
        //console.log("line")
        var geometry = new THREE.BufferGeometry().setFromPoints(sceneInfo3.neoLinePoints)
        var line = new THREE.Line(geometry, material)
        neoLineArray.push(line)
        neoParagraphArray.push(line)
        geometry.dispose()
      }
      else {
        //console.log("curve")
        var curve = new THREE.SplineCurve( sceneInfo3.neoLinePoints );
        var points = curve.getPoints( 50 );
        var geometry = new THREE.BufferGeometry().setFromPoints(points)
        var splineObject = new THREE.Line( geometry, material );
        neoLineArray.push(splineObject)
        neoParagraphArray.push(splineObject)
        geometry.dispose()

      }
      // need to ensure that these points are being cleaned up properly after every 3
      sceneInfo3.neoLinePoints.shift()
      sceneInfo3.neoLinePoints.shift()
      //console.log(sceneInfo3.neoLinePoints)
      twoCounter = 0
 
    }

    if (clearParagraph === true) {
      clearParagraph = false

      for (var i = 0; i < neoParagraphArray.length; i++) {
        console.log('removed')
        sceneInfo3.scene.remove(neoParagraphArray[i])
      }
      neoLineArray = []
      //sceneInfo3.neoLinePoints = []
      neoParagraphArray = []
      sceneInfo4.bufferScene.background = new THREE.Color('white')
      checkForUndoAnalGlyphControl = true
    }

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



  function totalGlitch() {
    var random = getRandomInt(2)

      console.log('glitched')
      sceneInfo2.beatLineMaterial.lineWidth = 20
      setAnalglyphEffect = 'effect'
      effectType = 'glitch'

      setTimeout(function() {
        setAnalglyphEffect = 'analglyph'
        glitchPass.enabled = false
      }, 100)
      sceneInfo2.beatLineMaterial.lineWidth = 5
    

  }
  var totalFilmDuration = 10000
// need to set it so if there is a skip in song, the timeouts are cleared
  function totalFilm() {

      var random = getRandomInt(2)
      console.log("random", random)
      if(random === 0) {
        totalFilmDuration = 1000
        dotScreenPass.enabled = true
      }
      else {
        totalFilmDuration = 10000
        totalFader()
      }

      setAnalglyphEffect = 'effect'
      effectType = 'film'

      setTimeout(function() {
        setAnalglyphEffect = 'analglyph'
        filmPass.enabled = false
        dotScreenPass.enabled = false
        RandomIntToggle = true
        
      }, totalFilmDuration)
      
  }

  function totalNone() {
    setAnalglyphEffect = 'none'
    effectType = 'film'
    console.log('none')
    setTimeout(function() {
      // setAnalglyphEffect = 'analglyph'
      // console.log('analglyph')
    }, 10000)
    
  

  }

var analglyphStoredBarCounter

var analglyphBarLength
var fadeInterval
var analglyphFadeRate = .003
var analglyphFadeLength = 2

  function totalFader() {

    // analglyphStoredBarCounter = barCounter
    // if (getRandomInt(2) === 0) {
    //     sceneInfo4.bufferScene.background = new THREE.Color('blue')
    //     analglyphBarLength = 2
    //     checkForUndoAnalGlyphControl =  true


        
    // }
    // else {
    //    analglyphFadeRate = (1 / ((trackData.barsStart[barCounter + 1] - trackData.barsStart[barCounter]) / 5)) * analglyphFadeLength
    //   analglyphBarLength = 4
    //   checkForUndoAnalGlyphControl =  true
    //     fadeInterval = setInterval(function() {
    //       if (sceneInfo4.bufferScene.background.r > 0) {
    //         sceneInfo4.bufferScene.background.r -= analglyphFadeRate


    //       }
    //     }, 5)

    //   }
        
    }


  function undoFader(numOfBars)  {
    
    if(barCounter === analglyphStoredBarCounter + numOfBars || hardRefresh === true) {
      clearInterval(fadeInterval)
      sceneInfo4.bufferScene.background = new THREE.Color('white')
      checkForUndoAnalGlyphControl = false
      hardRefresh = false
   }
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
  var glitchRange = .05
  var glitchAmount = .05
  var glitchStoredBarCounter
  var glitchStoredBeatCounter = beatCounter
  var directionArray = [
    'x',
    'y',
    'z'
  ]
  var distortCounter = 0
  var allowGlitchReset = true

  function glitchDistort (object, direction) {

    
    // console.log('distort', distortCounter)
    distortCounter++

      var negative
      if (getRandomInt(2) === 0) {
        negative = -1
      }
      else {
        negative = 1
      }
      direction = directionArray[getRandomInt(3)]
      glitchRange = (getRandomInt(10) + 1) / 10

      glitchPoint = Math.random() * negative



      var grain
      switch(direction) {
        case direction = 'x':
          grain = 'y'
          glitchAmount = .05
          break
        case direction = 'y':
          grain = 'x'
          glitchAmount = .05
          break
        case direction = 'z':
          grain = 'y'
          glitchAmount = .5
          break
      }
      // console.log('glitched')
      glitchStoredBarCounter = barCounter

      for (var i = 0; i < object.geometry.vertices.length; i++) {

        if (object.geometry.vertices[i][grain] > glitchPoint - glitchRange && object.geometry.vertices[i][grain] < glitchPoint + glitchRange ) {

            object.geometry.vertices[i][direction] += glitchAmount
        }

        object.geometry.verticesNeedUpdate = true

      }
      if(allowGlitchReset === true) {
        setTimeout( function () {
          resetGlitchDistort(object, direction, grain, glitchPoint, glitchRange, glitchAmount)
        }, 100)
      }



    


  }
  var undistortCounter = 0
  function resetGlitchDistort(object, direction, grain, glitchPoint, glitchRange, glitchAmount) {

    // object.geometry = sceneInfo4.geometry
    // console.log('undistort', undistortCounter)
    undistortCounter++

    for (var i = 0; i < object.geometry.vertices.length; i++) {
        object.geometry.vertices[i].x = object.originalGeometry[i].x  
        object.geometry.vertices[i].y = object.originalGeometry[i].y  
        object.geometry.vertices[i].z = object.originalGeometry[i].z


      
    //   if (object.geometry.vertices[i][grain] > glitchPoint - glitchRange && object.geometry.vertices[i][grain] < glitchPoint + glitchRange ) {


    //     object.geometry.vertices[i][direction] -= glitchAmount
    // }
          
      }
      object.geometry.verticesNeedUpdate = true
      object.updateMatrix()
  }

  function bubbleDistort(object) {

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

  var sceneInfoArray = [
    sceneInfo1,
    sceneInfo2,
    sceneInfo3,
    sceneInfo4
  ]

  function bigScreen(sceneInfo) {
    for (var i = 0; i < sceneInfoArray.length; i++) {
      if (sceneInfoArray[i] !== sceneInfo) {
        sceneInfoArray[i].elem.style.width = '0%'
        sceneInfoArray[i].elem.style.height = '0%'
      }
      else {
        sceneInfoArray[i].elem.style.width = '100%'
        sceneInfoArray[i].elem.style.height = '100%'
      }
    } 
  }

  

  function resizeRendererToDisplaySize(renderer) {
    if(renderer === renderer2) {
      return
    }
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
  var effectType = 'film'
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
    // console.log(renderer)
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    const positiveYUpBottom = renderer.domElement.clientHeight - bottom;
    renderer.setScissor(left, positiveYUpBottom, width, height);
    renderer.setViewport(left, positiveYUpBottom, width, height);

    if(sceneInfo === sceneInfo4) {
      var time = performance.now() * 0.001 + 6000;
      renderer2.setScissor(left, positiveYUpBottom, width, height);
      renderer2.setViewport(left, positiveYUpBottom, width, height);
      sceneInfo4.plane.geometry.verticesNeedUpdate = true
      //renderer2 renders to bufferTexture
      // renderer2.setRenderTarget(sceneInfo4.bufferTexture)
      // renderer2.render(sceneInfo4.bufferScene, sceneInfo4.bufferCamera)

      // composer4.setRenderTarget(sceneInfo4.bufferTexture)
      renderer2.clear()
      sceneInfo4.composer4.render()
      //set target to the main scene to render the plane with Buffertexture map
      // renderer2.setRenderTarget(null)
      // renderer2.render(scene, camera);
      //scene 4 render
      // renderer2.render(scene, camera)
      // analyglyphEffect2.render(scene, camera);
      return
    }
    else {

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
              if(effectType !== 'film') {
                composer2.render(scene, camera)
              }
              else if(effectType === 'glitch') {
                composer1.render(scene, camera)
              }
                
              break;
            
            case sceneInfo3:
              if(effectType !== 'film') {
                composer3.render(scene, camera)
              }
              break;
              
            }


    }

  }

    
  }

  var RandomIntToggle = true

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





  var lineCounter = 0
  var movementRate = 5
  var velocity = 0;
  var acceleration = 0;
  var cameraMovement = 1
  var range = 30
  var drawRate = 0
  var test = new MeshLine()
  var testgeometry = new THREE.Geometry()
  testgeometry.vertices.push( new THREE.Vector3( 1, 1, 0 ) );
  testgeometry.vertices.push( new THREE.Vector3( 1, 1, 0 ) );

  function beatLineAnimation() {
    var frustum = new THREE.Frustum();
    var cameraViewProjectionMatrix = new THREE.Matrix4();

    // if(sceneInfo2.camera.position.x > 1 || sceneInfo2.camera.position.x < -1 || sceneInfo2.camera.position.y > 1 || sceneInfo2.camera.position.y < -1) {
    //   cameraMovement = -(cameraMovement)
    // }
    // sceneInfo2.camera.position.x += cameraMovement
    // sceneInfo2.camera.position.y += cameraMovement
    
    // every time the camera or objects change position (or every frame)
    
    sceneInfo2.camera.updateMatrixWorld(); // make sure the camera matrix is updated
    sceneInfo2.camera.matrixWorldInverse.getInverse( sceneInfo2.camera.matrixWorld );
    cameraViewProjectionMatrix.multiplyMatrices( sceneInfo2.camera.projectionMatrix, sceneInfo2.camera.matrixWorldInverse );
    frustum.setFromProjectionMatrix( cameraViewProjectionMatrix );
    //if pen leaves view
    if (frustum.intersectsObject(sceneInfo2.mesh) === false) {

      sceneInfo2.mesh.position.x = -sceneInfo2.mesh.position.x * 0.7


        // sceneInfo2.scene.remove(sceneInfo2.beatLine)

      // sceneInfo2.beatLineArray = []
      // lineCounter = 0
      beatLinePoints = []
      // console.log(beatLinePoints)

      beatLinePoints.push( new THREE.Vector3( sceneInfo2.mesh.position.x, sceneInfo2.mesh.position.y, 0 ) );
      beatLinePoints.push( new THREE.Vector3( sceneInfo2.mesh.position.x, sceneInfo2.mesh.position.y, 0 ) );
      sceneInfo2.beatLine.setVertices(beatLinePoints)
      // sceneInfo2.scene.add(sceneInfo2.beatLine)
      

    }
    //if pen is in view
    else {
      // if(drawRate !== 2) {
        drawRate++

        beatLinePoints.push(new THREE.Vector3(sceneInfo2.mesh.position.x, sceneInfo2.mesh.position.y, 0))

        sceneInfo2.beatLine.setVertices(beatLinePoints)
        // sceneInfo2.beatLineArray[lineCounter] = new THREE.Mesh(sceneInfo2.beatLine.geometry, sceneInfo2.beatLineMaterial)

        // sceneInfo2.scene.add(sceneInfo2.beatLineArray[lineCounter])
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

      // }
      // else {
      //   // console.log('skiped')
      //   drawRate = 0
      // }

        }
        if (sceneInfo2.mesh.position.y > 150 || sceneInfo2.mesh.position.y < -150) {
            sceneInfo2.mesh.position.y = sceneInfo2.mesh.position.y / 2 
        }
          
    }
  

var counter = 0
var counter2 = 0
  function render(time) {
    // if (counter2 !== 1) {
      counter2++

    pitchPlaneAnimation()
    //beatline causes cpu spikes
    beatLineAnimation()
    //neoline accounts for increasing cpu usage over time
    neoLineAnimation()

    
    

    if(checkForUndoAnalGlyphControl === true) {
      undoFader(analglyphBarLength)
    }

    if(scene4Toggle === true) {
      sceneInfo4.sculpture.rotation.y += .01
      flickerObject(sceneInfo4.plane)
    }
  // }
  // else{
    // console.log('sckp')
    // counter2 = 0
  // }
    resizeRendererToDisplaySize(renderer);
    resizeRendererToDisplaySize(renderer2);

    renderer.setScissorTest(false);
    renderer.clear(true, true);
    renderer.setScissorTest(true);
    

    if(counter === 2) {
      counter = 0
      
      
      
      
      
    }
    else{
      counter++
    }
    // renderSceneInfo(sceneInfo1);
    // renderSceneInfo(sceneInfo2);
    // renderSceneInfo(sceneInfo3);
    renderSceneInfo(sceneInfo4);
    
    


    requestAnimationFrame(render);


  
}
  requestAnimationFrame(render);
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
    var queryRunning
    // Playback status updates
      player.addListener('player_state_changed', state => { 
        if (!state && queryRunning === true) {
          
          queryRunning = false
          stopTimer()
          clearInterval(trackPositionQuery)
        }
        else if(queryRunning !== true) {
          queryRunning = true
          startTrackPositionQuery()
        }
        if(state) {
        elapsedTime = trackPosition
        current_track_id = state['track_window']['current_track']['id']

        trackPosition = state['position']
        if (current_track_id !== stored_track_id) {
          console.log(trackData)
          trackPosition = 0
          stored_track_id = current_track_id
          clearParagraph = true
          // checkForUndoAnalGlyphControl = true
          // hardRefresh = true
          

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
// startTrackPositionQuery()

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


