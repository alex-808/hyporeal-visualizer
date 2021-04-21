import { GLTFLoader } from 'https://unpkg.com/three@0.119.1/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'https://unpkg.com/three@0.119.1/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.119.1//examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'https://unpkg.com/three@0.119.1//examples/jsm/postprocessing/ShaderPass.js';
import { TexturePass } from 'https://unpkg.com/three@0.119.1//examples/jsm/postprocessing/TexturePass.js';
import { ClearPass } from 'https://unpkg.com/three@0.119.1//examples/jsm/postprocessing/ClearPass.js';
import {
    MaskPass,
    ClearMaskPass,
} from 'https://unpkg.com/three@0.119.1//examples/jsm/postprocessing/MaskPass.js';
import { CopyShader } from 'https://unpkg.com/three@0.119.1//examples/jsm/shaders/CopyShader.js';
import { songData } from './songData.js';
import { makeScene } from './sceneSetup.js';
import * as utils from './utils.js';
import * as visuals from './visualSetup.js';

window.addEventListener('beforeunload', function (event) {
    fetch('./session_destroy', {
        method: 'POST',
    });
});

window.onSpotifyWebPlaybackSDKReady = () => {
    var beatAnimation = 0;
    var planeDimension = 12;
    var planeBackRowAnimation = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var planeStoredBackRow = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var neoDimension;

    var timbreSum1 = 0;
    var timbreSum2 = 0;

    var checkForUndoAnalGlyphControl = false;
    var clearParagraph = true;

    function runVisuals() {
        const canvas = document.querySelector('#c');

        function setupScene1() {
            const sceneInfo = makeScene(document.querySelector('#pitchplane'));

            var geometry = new THREE.PlaneGeometry(
                2,
                1,
                planeDimension - 1,
                planeDimension - 1
            );
            var material = new THREE.MeshBasicMaterial();
            var plane = new THREE.Mesh(geometry, material);
            plane.material.wireframe = true;
            plane.rotation.set(-45, 0, 0);

            for (var i = 0; i < planeDimension; i++) {
                plane.geometry.vertices[i].z = 0;
            }

            var renderPass1 = new RenderPass(sceneInfo.scene, sceneInfo.camera);
            visuals.composer1.addPass(renderPass1);
            visuals.composer1.addPass(visuals.glitchPass);
            visuals.composer1.addPass(visuals.filmPass);
            visuals.composer1.addPass(visuals.dotScreenPass);

            sceneInfo.scene.add(plane);
            sceneInfo.camera.fov = 75;
            sceneInfo.mesh = plane;

            return sceneInfo;
        }

        var beatLinePoints = [];

        function setupScene2() {
            const sceneInfo = makeScene(document.querySelector('#beatline'));

            sceneInfo.scene.remove(camera);
            sceneInfo.camera.position.z = 1000;
            var goalLineArray1 = new THREE.Geometry();
            // var goalLineArray2 = [];
            var camera = new THREE.OrthographicCamera(
                sceneInfo.elem.width / -2,
                sceneInfo.elem.width / 2,
                sceneInfo.elem.height / 2,
                sceneInfo.elem.height / -2,
                1,
                1000
            );
            sceneInfo.scene.add(camera);

            goalLineArray1.vertices.push(new THREE.Vector3(-1000, 100, 0));
            goalLineArray1.vertices.push(new THREE.Vector3(1000, 100, 0));

            var renderPass2 = new RenderPass(sceneInfo.scene, sceneInfo.camera);
            visuals.composer2.addPass(renderPass2);
            visuals.composer2.addPass(visuals.glitchPass);
            visuals.composer2.addPass(visuals.filmPass);

            var goalLineMaterial = new MeshLineMaterial({
                color: 'white',
                lineWidth: 5,
            });

            var goalLine1 = new MeshLine();
            goalLine1.setGeometry(goalLineArray1);

            const radius = 0.1;
            const widthSegments = 10;
            const heightSegments = 10;
            const geometry = new THREE.SphereBufferGeometry(
                radius,
                widthSegments,
                heightSegments
            );
            const material = new THREE.MeshPhongMaterial({
                color: 'white',
                flatShading: true,
            });
            const mesh = new THREE.Mesh(geometry, material);
            sceneInfo.scene.add(mesh);
            sceneInfo.mesh = mesh;

            var beatLineMaterial = new MeshLineMaterial({
                color: 'white',
                lineWidth: 1.8,
                sizeAttenuation: 1,
            });

            var beatLine = new MeshLine();

            var beatLineMesh = new THREE.Mesh(
                beatLine.geometry,
                beatLineMaterial
            );

            sceneInfo.scene.add(beatLineMesh);
            sceneInfo.beatLineMaterial = beatLineMaterial;
            sceneInfo.beatLine = beatLine;
            sceneInfo.beatLineMesh = beatLineMesh;

            var beatLineArray = [];
            sceneInfo.beatLineArray = beatLineArray;

            var frustum = new THREE.Frustum();
            var cameraViewProjectionMatrix = new THREE.Matrix4();

            cameraViewProjectionMatrix.multiplyMatrices(
                sceneInfo.camera.projectionMatrix,
                sceneInfo.camera.matrixWorldInverse
            );

            frustum.setFromProjectionMatrix(cameraViewProjectionMatrix);

            sceneInfo.frustum = frustum;
            sceneInfo.cameraViewProjectionMatrix = cameraViewProjectionMatrix;

            return sceneInfo;
        }

        function setupScene3() {
            //Pen
            const sceneInfo = makeScene(document.querySelector('#neoline'));

            var renderPass3 = new RenderPass(sceneInfo.scene, sceneInfo.camera);
            visuals.composer3.addPass(renderPass3);
            visuals.composer3.addPass(visuals.glitchPass);
            visuals.composer3.addPass(visuals.filmPass);

            const radius = 0.02;
            const widthSegments = 1;
            const heightSegments = 1;
            const geometry = new THREE.SphereBufferGeometry(
                radius,
                widthSegments,
                heightSegments
            );
            const material = new THREE.MeshPhongMaterial({
                color: 'white',
                flatShading: true,
            });
            const pen = new THREE.Mesh(geometry, material);

            pen.position.x = 0;
            pen.position.y = 0;
            //sceneInfo.scene.add(pen);
            sceneInfo.pen = pen;

            var planeWidth = 1.5;
            var planeHeight = 1.5;

            //Plane
            var planeGeometry = new THREE.PlaneGeometry(
                planeWidth,
                planeHeight,
                10,
                10
            );
            var planeMaterial = new THREE.MeshBasicMaterial();
            var plane = new THREE.Mesh(planeGeometry, planeMaterial);
            sceneInfo.planeGeometry = planeGeometry;
            sceneInfo.planeMaterial = planeMaterial;
            sceneInfo.plane = plane;
            sceneInfo.planeWidth = planeWidth;
            sceneInfo.planeHeight = planeHeight;
            //sceneInfo.scene.add(plane);
            plane.material.wireframe = true;
            plane.rotation.set(0, 0, 0);

            //Line
            var neoLinePoints = [];
            var neoLineArray = [];
            var neoLineMaterial = new THREE.LineBasicMaterial({
                color: 'white',
            });
            var neoLineGeometry = new THREE.BufferGeometry().setFromPoints(
                neoLinePoints
            );
            var neoLine = new THREE.Line(neoLineGeometry, neoLineMaterial);
            sceneInfo.neoLine = neoLine;

            sceneInfo.neoLinePoints = neoLinePoints;
            sceneInfo.scene.add(neoLine);

            return sceneInfo;
        }

        var flickerToggle = false;

        function setupScene4() {
            const sceneInfo = makeScene(
                document.querySelector('#glitchdistort')
            );
            var background = new THREE.TextureLoader().load('./tunnel.jpg');
            background.minFilter = THREE.LinearFilter;

            var clearPass = new ClearPass();
            var clearMaskPass = new ClearMaskPass();
            var texturePass = new TexturePass(background);
            var outputPass = new ShaderPass(CopyShader);
            var bufferTexture = new THREE.WebGLRenderTarget(
                window.innerHeight,
                window.innerWidth,
                {
                    minFilter: THREE.LinearFilter,
                    magFilter: THREE.NearestFilter,
                }
            );

            var bufferScene = new THREE.Scene();
            bufferScene.background = new THREE.Color('white');

            var bufferLight = new THREE.DirectionalLight(0xffffff, 0.5);
            const fov = 45;
            const aspect = 2; // the canvas default
            const near = 0.1;
            const far = 1000;
            const bufferCamera = new THREE.PerspectiveCamera(
                fov,
                aspect,
                near,
                far
            );

            bufferCamera.position.set(0, 0, 2);
            bufferCamera.lookAt(0, 0, 0);
            sceneInfo.bufferCamera = bufferCamera;
            bufferScene.add(bufferCamera);

            bufferScene.add(bufferLight);
            var maskPass = new MaskPass(bufferScene, bufferCamera);

            var geometry = new THREE.BoxGeometry(1, 1, 1);
            var material = new THREE.MeshBasicMaterial({ color: 'blue' });
            var bufferCube = new THREE.Mesh(geometry, material);
            sceneInfo.bufferCube = bufferCube;
            sceneInfo.bufferTexture = bufferTexture;
            sceneInfo.bufferScene = bufferScene;

            var composer4 = new EffectComposer(
                visuals.renderer2,
                bufferTexture
            );
            sceneInfo.composer4 = composer4;
            var renderPass4 = new RenderPass(
                sceneInfo.bufferScene,
                sceneInfo.camera
            );
            // composer4.addPass( renderPass4 );
            composer4.addPass(visuals.filmPass);
            // composer4.addPass(visuals.dotScreenPass)

            composer4.addPass(clearPass);
            composer4.addPass(maskPass);
            composer4.addPass(texturePass);
            composer4.addPass(clearMaskPass);
            composer4.addPass(outputPass);

            var geometrySegments = 100;
            // var geometrySegments = 1

            var geometry = new THREE.PlaneGeometry(
                canvas.width / 60,
                canvas.height / 60,
                geometrySegments,
                geometrySegments
            );
            // var geometry = new THREE.PlaneGeometry(2, 2 , 100, 100);
            var material = new THREE.MeshBasicMaterial({ map: bufferTexture });
            var plane = new THREE.Mesh(geometry, material);
            plane.position.z = -1;
            sceneInfo.scene.add(plane);
            sceneInfo.geometry = geometry;
            sceneInfo.plane = plane;

            // for (var i = 0; i < plane.geometry.vertices.length; i++) {
            //   originalGeometry.push(plane.geometry.vertices[i])
            // }

            var originalGeometry = JSON.parse(
                JSON.stringify(plane.geometry.vertices)
            );

            plane.originalGeometry = originalGeometry;
            // console.log(plane.geometry.vertices === originalGeometry)

            var sculptureArray = [
                './assets/models/venus3.gltf',
                './assets/models/youngwarrior.gltf',
                './assets/models/SculptureBlue.gltf',
            ];
            var sculpture;
            const loader = new GLTFLoader();
            loader.load(sculptureArray[utils.getRandomInt(3)], (object) => {
                sculpture = object.scene;
                // console.log(sculpture)

                sceneInfo.sculpture = sculpture;
                sceneInfo.bufferScene.add(sculpture);
                flickerToggle = true;

                // console.log(object)
            });
            return sceneInfo;
        }
        var previous;
        var previousBigScreen;

        //add more variety for section changes
        function getSectionEffect(maxRandom) {
            var random = utils.getRandomInt(maxRandom);
            switch (random) {
                case 0:
                case 1:
                    if (previous !== 'glitch') {
                        console.log('glitch');
                        totalGlitch();
                        if (utils.getRandomInt(2) === 0) {
                            totalFader();
                        }
                        previous = 'glitch';
                    } else {
                        getSectionEffect(10);
                    }

                    break;

                case 2:
                case 3:
                case 4:
                    if (previous !== 'film') {
                        console.log('film');
                        totalFilm();
                        previous = 'film';
                    } else {
                        getSectionEffect(10);
                    }

                    break;

                case 5:
                case 6:
                    console.log('pivot');

                    if (setAnalglyphEffect !== 'none') {
                        console.log('none and maybe fader');
                        totalNone();
                        totalGlitch();
                        if (utils.getRandomInt(2) === 0) {
                            totalFader();
                        }
                    } else {
                        console.log('analglyph');
                        setAnalglyphEffect = 'analglyph';
                        totalFader();
                    }
                    previous = 'pivot';
                    break;

                case 7:
                    if (previous !== 'masking') {
                        console.log('masking');
                        masking = true;
                        maskingBars = 2;
                        previous = 'masking';
                    } else {
                        getSectionEffect(10);
                    }

                    break;

                case 8:
                case 9:
                    if (previous !== 'bigScreen') {
                        console.log('bigScreen');
                        var bigScreenInterval;
                        allowGlitchReset = false;
                        allowGlitchBars = 4;
                        if (trackData.barsStart[barCounter + 4]) {
                            bigScreenInterval =
                                trackData.barsStart[barCounter + 4] -
                                trackData.barsStart[barCounter];
                        } else {
                            bigScreenInterval = 5000;
                        }
                        var random = utils.getRandomInt(3);
                        if (random === previousBigScreen) {
                            random = utils.getRandomInt(3);
                        }
                        var sceneIndex;
                        console.log(random);
                        switch (random) {
                            case 0:
                                sceneIndex = 0;
                                previousBigScreen = 0;
                                break;
                            case 1:
                                sceneIndex = 1;
                                previousBigScreen = 1;
                                break;
                            case 2:
                                sceneIndex = 3;
                                previousBigScreen = 3;
                                break;
                        }
                        bigScreen(sceneInfoArray[sceneIndex]);
                        setTimeout(function () {
                            totalGlitch();
                            undoScreenChange();
                        }, bigScreenInterval);
                        previous = 'bigScreen';
                    } else {
                        getSectionEffect(10);
                    }

                    break;
            }
        }

        var neoStoredBarCounter = 0;
        var neoStoredSegCounter = 0;
        var neoStoredSectionCounter = 0;
        var neoStoredBeatCounter = 0;
        var twoCounter = 0;

        var boxDivisions;
        var storedNeoDimension;

        var neoLineArray = [];
        var neoParagraphArray = [];
        var neoMaxWords = 250;
        var squaresArray = [];
        var glitchTheBar = false;
        var allowGlitchBars = 0;
        var maskingBars = 0;
        var neoToggle = true;

        function neoLineAnimation() {
            if (storedNeoDimension !== neoDimension) {
                storedNeoDimension = neoDimension;
                sceneInfo3.scene.remove(sceneInfo3.plane);
                sceneInfo3.planeGeometry = new THREE.PlaneGeometry(
                    sceneInfo3.planeWidth,
                    sceneInfo3.planeHeight,
                    storedNeoDimension,
                    storedNeoDimension
                );
                sceneInfo3.plane = new THREE.Mesh(
                    sceneInfo3.planeGeometry,
                    sceneInfo3.planeMaterial
                );
                //sceneInfo3.scene.add(sceneInfo3.plane)

                var q = 0;
                var k = 0;
                squaresArray = [];
                for (var i = 0; i < neoDimension * neoDimension; i++) {
                    squaresArray[i] = [];
                    if (i % neoDimension === 0 && i > 0) {
                        q++;
                    }
                    for (var j = 0; j < neoDimension; j++) {
                        if (j < 2) {
                            k = 0;
                            squaresArray[i][j] =
                                sceneInfo3.plane.geometry.vertices[i + j + q];
                        } else {
                            k = neoDimension - 1;
                            squaresArray[i][j] =
                                sceneInfo3.plane.geometry.vertices[
                                    i + j + k + q
                                ];
                        }
                    }
                }
                if (squaresArray.length === 0) {
                    console.log('true');
                    sceneInfo3.boxWidth = 0;
                } else {
                    sceneInfo3.boxWidth = Math.abs(
                        squaresArray[0][0].x - squaresArray[0][1].x
                    );
                }
            }

            if (allowGlitchBars < 1) {
                allowGlitchReset = true;
            }
            if (maskingBars < 1 && masking === true) {
                masking = false;
                setTimeout(function () {
                    undoScreenChange();
                }, 2000);
            }
            if (
                neoStoredSectionCounter !== sectionCounter &&
                sectionCounter &&
                trackData
            ) {
                // console.log('ran1')
                neoToggle = true;

                neoStoredSectionCounter = sectionCounter;

                neoStoredBeatCounter = beatCounter;
            }
            var planeGeometry = new THREE.PlaneBufferGeometry(
                sceneInfo3.boxWidth,
                sceneInfo3.boxWidth
            );
            var planeMaterialBlue = new THREE.MeshBasicMaterial({
                color: 'blue',
            });
            var planeMaterialRed = new THREE.MeshBasicMaterial({
                color: 'red',
            });

            if (
                trackData !== undefined &&
                squaresArray[neoStoredBarCounter] !== undefined
            ) {
                if (
                    trackData.sectionNearestBarStart[
                        neoStoredSectionCounter + 1
                    ] === trackData.beatsStart[beatCounter + 1] &&
                    neoToggle === true
                ) {
                    //
                    neoToggle = false;
                    if (utils.getRandomInt(2) === 0) {
                        console.log('glitch reset disabled');
                        allowGlitchReset = false;
                        allowGlitchBars = 4;
                    }

                    // console.log('ran2')

                    //neoStoredSectionCounter++
                    neoStoredBeatCounter = beatCounter;
                    // var segColorIndex = timbreSum1 % 2 === 0 ? planeMaterialRed : planeMaterialBlue

                    // var plane = new THREE.Mesh( planeGeometry, segColorIndex );
                    // plane.position.x = squaresArray[neoStoredBarCounter][0].x + sceneInfo3.boxWidth/2
                    // plane.position.y = squaresArray[neoStoredBarCounter][0].y - sceneInfo3.boxWidth/2
                    // plane.position.z = squaresArray[neoStoredBarCounter][0].z - 0.01
                    // neoParagraphArray.push(plane)
                    // sceneInfo3.scene.add(plane)
                }
            }

            // if (neoStoredBarCounter > barCounter) {
            //   for (var i = neoStoredBarCounter; i > -1 ; i-- ) {
            //     sceneInfo3.scene.remove(neoParagraphArray[i])
            //   }
            //   neoStoredBarCounter = barCounter
            // }
            if (
                neoStoredBarCounter !== barCounter &&
                barCounter !== undefined
            ) {
                // allowGlitchReset = true
                allowGlitchBars--;
                maskingBars--;
                neoStoredBarCounter = barCounter;
                glitchDistort(sceneInfo4.plane);
                if (utils.getRandomInt(4) === 0) {
                    totalFader();
                }

                if (utils.getRandomInt(4) === 0) {
                    glitchTheBar = 4;
                }

                if (masking === false) {
                    // undoBigScreen()
                }
                console.log(
                    trackData.barsStart[barCounter],
                    trackData.sectionNearestBarStart[sectionCounter + 1]
                );
                if (
                    trackData.sectionNearestBarStart[sectionCounter + 1] ===
                        trackData.barsStart[barCounter] &&
                    trackData.barsStart[barCounter] !== undefined
                ) {
                    getSectionEffect(10);
                    var segColorIndex =
                        timbreSum1 % 2 === 0
                            ? planeMaterialRed
                            : planeMaterialBlue;

                    var plane = new THREE.Mesh(planeGeometry, segColorIndex);
                    plane.position.x =
                        squaresArray[neoStoredBarCounter][0].x +
                        sceneInfo3.boxWidth / 2;
                    plane.position.y =
                        squaresArray[neoStoredBarCounter][0].y -
                        sceneInfo3.boxWidth / 2;
                    plane.position.z =
                        squaresArray[neoStoredBarCounter][0].z - 0.01;
                    neoParagraphArray.push(plane);
                    sceneInfo3.scene.add(plane);
                }

                // bigScreen(sceneInfoArray[getRandomInt(4)])

                sceneInfo3.neoLinePoints = [];

                boxDivisions = sceneInfo3.boxWidth / 7;
                // console.log("neoLineAnim barCounter", barCounter)
                // console.log(neoStoredBarCounter)
                if (
                    squaresArray[neoStoredBarCounter] !== undefined &&
                    squaresArray[neoStoredBarCounter] !== undefined
                ) {
                    sceneInfo3.pen.position.x =
                        squaresArray[neoStoredBarCounter][0].x +
                        sceneInfo3.boxWidth / 2;
                    sceneInfo3.pen.position.y =
                        squaresArray[neoStoredBarCounter][0].y -
                        sceneInfo3.boxWidth / 2;
                }

                for (var i = 0; i < neoLineArray.length; i++) {
                    sceneInfo3.scene.add(neoLineArray[i]);
                    //delete neoLineArray[i]
                }

                neoLineArray = [];
                if (neoParagraphArray.length > neoMaxWords) {
                    // console.log(neoParagraphArray.length - neoMaxWords)
                    for (
                        var i = 0;
                        (i = neoParagraphArray.length - neoMaxWords);
                        i++
                    ) {
                        sceneInfo3.scene.remove(neoParagraphArray[0]);
                        neoParagraphArray.shift();
                        // console.log('removed extra')
                    }
                }
            }

            if (neoStoredBeatCounter !== beatCounter && glitchTheBar > 0) {
                glitchTheBar--;
                glitchDistort(sceneInfo4.plane);
            }

            neoStoredBeatCounter = beatCounter;

            if (
                neoStoredSegCounter !== segmentCounter &&
                squaresArray[neoStoredBarCounter] !== undefined &&
                squaresArray[neoStoredBarCounter] !== undefined
            ) {
                neoStoredSegCounter = segmentCounter;
                sceneInfo3.neoLinePoints.push(
                    new THREE.Vector2(
                        squaresArray[neoStoredBarCounter][0].x +
                            timbreSum1 * boxDivisions +
                            sceneInfo3.boxWidth / 2,
                        squaresArray[neoStoredBarCounter][0].y +
                            (timbreSum2 * boxDivisions -
                                sceneInfo3.boxWidth / 2)
                    )
                );

                twoCounter++;
            }
            var material = new THREE.LineBasicMaterial({ color: 'white' });
            if (twoCounter === 3) {
                if (timbreSum1 % 2 === 0) {
                    //console.log("line")
                    var geometry = new THREE.BufferGeometry().setFromPoints(
                        sceneInfo3.neoLinePoints
                    );
                    var line = new THREE.Line(geometry, material);
                    neoLineArray.push(line);
                    neoParagraphArray.push(line);
                    geometry.dispose();
                } else {
                    //console.log("curve")
                    var curve = new THREE.SplineCurve(sceneInfo3.neoLinePoints);
                    var points = curve.getPoints(50);
                    var geometry = new THREE.BufferGeometry().setFromPoints(
                        points
                    );
                    var splineObject = new THREE.Line(geometry, material);
                    neoLineArray.push(splineObject);
                    neoParagraphArray.push(splineObject);
                    geometry.dispose();
                }
                // need to ensure that these points are being cleaned up properly after every 3
                sceneInfo3.neoLinePoints.shift();
                sceneInfo3.neoLinePoints.shift();
                //console.log(sceneInfo3.neoLinePoints)
                twoCounter = 0;
            }

            if (clearParagraph === true) {
                console.log('clearparagraph');
                clearParagraph = false;

                for (var i = 0; i < neoParagraphArray.length; i++) {
                    console.log('removed');
                    sceneInfo3.scene.remove(neoParagraphArray[i]);
                }
                neoLineArray = [];
                //sceneInfo3.neoLinePoints = []
                neoParagraphArray = [];
                if (utils.getRandomInt(2) === 0) {
                    faderInverted = !faderInverted;
                    console.log('faderInverted', faderInverted);
                    if (trackData) {
                        totalFader();
                    }
                }
                checkForUndoAnalGlyphControl = true;
            }
        }

        setInterval(function () {
            flowToggle = !flowToggle;
        }, 50);
        var flowToggle = true;
        function pitchPlaneAnimation() {
            var rowVertices = 143;
            var columnVertices = 131;

            if (planeStoredBackRow === planeBackRowAnimation) {
                //Decay effect &
                for (var i = 0; i < planeDimension; i++) {
                    if (sceneInfo1.mesh.geometry.vertices[i].z > 0) {
                        if (flowToggle === true) {
                            sceneInfo1.mesh.geometry.vertices[i].z -= 0.0125;
                        } else {
                            sceneInfo1.mesh.geometry.vertices[i].z += 0.0025;
                        }
                    }
                }
            } else {
                planeStoredBackRow = planeBackRowAnimation;
                for (var i = 0; i < planeDimension; i++) {
                    sceneInfo1.mesh.geometry.vertices[i].z =
                        planeStoredBackRow[i];
                }
            }

            sceneInfo1.mesh.geometry.verticesNeedUpdate = true;
            //Push backrow forward
            for (
                columnVertices;
                columnVertices >= 11;
                columnVertices -= planeDimension
            ) {
                for (rowVertices; rowVertices > columnVertices; rowVertices--) {
                    sceneInfo1.mesh.geometry.vertices[rowVertices].z =
                        sceneInfo1.mesh.geometry.vertices[
                            rowVertices - planeDimension
                        ].z;
                }
            }
        }

        var storedEffect;
        function totalGlitch() {
            var random = utils.getRandomInt(2);
            splitScreen(sceneInfoArray[0], sceneInfoArray[1]);
            console.log('glitched');
            storedEffect = setAnalglyphEffect;
            if (storedEffect === 'effect') {
                if (random === 0) {
                    storedEffect = 'analglyph';
                } else {
                    storedEffect = 'none';
                }
            }
            console.log('storedEffect', storedEffect);
            sceneInfo2.beatLineMaterial.lineWidth = 20;
            setAnalglyphEffect = 'effect';
            effectType = 'glitch';

            setTimeout(function () {
                setAnalglyphEffect = storedEffect;
                visuals.glitchPass.enabled = false;
                sceneInfo2.beatLineMaterial.lineWidth = 1.8;
                undoScreenChange();
            }, 100);
        }

        var totalFilmDuration = 10000;
        // need to set it so if there is a skip in song, the timeouts are cleared
        function totalFilm() {
            var random = utils.getRandomInt(3);
            // console.log("random", random)
            if (random === 0) {
                if (trackData.beatsStart[beatCounter + 1]) {
                    totalFilmDuration =
                        trackData.beatsStart[beatCounter + 1] -
                        trackData.beatsStart[beatCounter];
                    visuals.dotScreenPass.enabled = true;
                    // console.log("short", totalFilmDuration)
                } else {
                    totalFilmDuration = 1000;
                    visuals.dotScreenPass.enabled = true;
                }
            } else {
                if (trackData.beatsStart[beatCounter + 8]) {
                    totalFilmDuration =
                        trackData.beatsStart[beatCounter + 8] -
                        trackData.beatsStart[beatCounter];
                    // console.log("long", totalFilmDuration)
                    totalFader();
                } else totalFilmDuration = 10000;
                totalFader();
            }

            setAnalglyphEffect = 'effect';
            effectType = 'film';

            setTimeout(function () {
                setAnalglyphEffect = 'analglyph';
                visuals.filmPass.enabled = false;
                visuals.dotScreenPass.enabled = false;
            }, totalFilmDuration);
        }

        function totalNone() {
            setAnalglyphEffect = 'none';
            effectType = 'film';
            console.log('none');
        }

        var analglyphStoredBarCounter;

        var analglyphBarLength;
        var fadeInterval;
        var analglyphFadeRate = 0.003;
        var analglyphFadeLength = 2;
        var fadingBool = false;
        var faderColors = [];
        var faderColor1 = 0;
        var faderColor2 = 1;
        var faderInverted = false;
        faderColors.push(new THREE.Color('blue'));
        faderColors.push(new THREE.Color('white'));
        // console.log(faderColors)

        // console.log(white)

        function totalFader() {
            // console.log(faderInverted)
            if (
                sectionCounter > trackData.sections.length / 2 &&
                utils.getRandomInt(3) === 0
            ) {
                faderInverted = !faderInverted;
                console.log('fader inverted', faderInverted);
            }

            if (faderInverted === true) {
                faderColor1 = 0;
                faderColor2 = 1;
                sceneInfo4.bufferScene.background = _.cloneDeep(
                    faderColors[faderColor1]
                );
            } else {
                faderColor1 = 1;
                faderColor2 = 0;
                sceneInfo4.bufferScene.background = _.cloneDeep(
                    faderColors[faderColor1]
                );
            }

            if (fadingBool === false) {
                // console.log('ran')
                fadingBool = true;

                analglyphStoredBarCounter = barCounter;
                if (utils.getRandomInt(2) === 0) {
                    sceneInfo4.bufferScene.background = _.cloneDeep(
                        faderColors[faderColor2]
                    );
                    analglyphBarLength = 2;
                    checkForUndoAnalGlyphControl = true;
                } else {
                    if (faderInverted === true) {
                        sceneInfo4.bufferScene.background = _.cloneDeep(
                            faderColors[faderColor2]
                        );
                    }
                    analglyphFadeRate =
                        (1 /
                            ((trackData.barsStart[barCounter + 1] -
                                trackData.barsStart[barCounter]) /
                                5)) *
                        analglyphFadeLength;
                    analglyphBarLength = 4;

                    checkForUndoAnalGlyphControl = true;
                    fadeInterval = setInterval(function () {
                        if (
                            sceneInfo4.bufferScene.background.r > 0 ||
                            sceneInfo4.bufferScene.background.r < 1
                        ) {
                            sceneInfo4.bufferScene.background.r -= analglyphFadeRate;
                        }
                    }, 5);
                }
            }
        }

        function undoFader(numOfBars) {
            if (Math.abs(analglyphStoredBarCounter - barCounter) > numOfBars) {
                analglyphStoredBarCounter = barCounter;
            }
            if (barCounter === analglyphStoredBarCounter + numOfBars) {
                // console.log('undone')
                // console.log(faderInverted)
                clearInterval(fadeInterval);

                sceneInfo4.bufferScene.background = _.cloneDeep(
                    faderColors[faderColor1]
                );
                // console.log(faderColors)
                checkForUndoAnalGlyphControl = false;
                fadingBool = false;
            }
        }

        var factor = -1.5;
        var vector = 0.1;
        var flickerRange = 0.1;
        var shift = 0.005;
        var terminus = 1.4;
        var flicker = true;
        var flickerInterval = setInterval(function () {
            //factor = -1.5
        }, 1000);

        function flickerObject(object) {
            //need to prevent this from shifting over infinitely

            if (factor + flickerRange > 1.5) {
                vector = -0.1;
                shift = -0.005;
            } else if (factor - flickerRange < -1.5) {
                vector = 0.1;
                shift = 0.005;
            } else {
                for (var i = 0; i < object.geometry.vertices.length; i++) {
                    if (
                        object.geometry.vertices[i].y > factor - flickerRange &&
                        object.geometry.vertices[i].y < factor + flickerRange
                    ) {
                        object.geometry.vertices[i].x += shift;
                    }
                }
            }

            factor += vector;

            object.geometry.verticesNeedUpdate = true;
        }

        var glitchPoint = 0;
        var glitchRange = 0.05;
        var glitchAmount = 0.05;
        var glitchStoredBarCounter;
        var glitchStoredBeatCounter = beatCounter;
        var directionArray = ['x', 'y', 'z'];
        var distortCounter = 0;
        var allowGlitchReset = true;

        function glitchDistort(object, direction) {
            // console.log('distort', distortCounter)
            distortCounter++;

            var negative;
            if (utils.getRandomInt(2) === 0) {
                negative = -1;
            } else {
                negative = 1;
            }
            direction = directionArray[utils.getRandomInt(3)];
            glitchRange = (utils.getRandomInt(10) + 1) / 10;

            glitchPoint = Math.random() * negative;

            var grain;
            switch (direction) {
                case (direction = 'x'):
                    grain = 'y';
                    glitchAmount = 0.05;
                    break;
                case (direction = 'y'):
                    grain = 'x';
                    glitchAmount = 0.05;
                    break;
                case (direction = 'z'):
                    if (utils.getRandomInt(2) === 0) {
                        grain = 'y';
                    } else {
                        grain = 'x';
                    }

                    glitchAmount = 0.1;
                    break;
            }
            // console.log('glitched')
            glitchStoredBarCounter = barCounter;

            for (var i = 0; i < object.geometry.vertices.length; i++) {
                if (
                    object.geometry.vertices[i][grain] >
                        glitchPoint - glitchRange &&
                    object.geometry.vertices[i][grain] <
                        glitchPoint + glitchRange
                ) {
                    object.geometry.vertices[i][direction] += glitchAmount;
                }

                object.geometry.verticesNeedUpdate = true;
            }
            if (allowGlitchReset === true) {
                setTimeout(function () {
                    resetGlitchDistort(
                        object,
                        direction,
                        grain,
                        glitchPoint,
                        glitchRange,
                        glitchAmount
                    );
                }, 100);
            }
        }
        var undistortCounter = 0;
        function resetGlitchDistort(
            object,
            direction,
            grain,
            glitchPoint,
            glitchRange,
            glitchAmount
        ) {
            // object.geometry = sceneInfo4.geometry
            // console.log('undistort', undistortCounter)
            undistortCounter++;

            for (var i = 0; i < object.geometry.vertices.length; i++) {
                object.geometry.vertices[i].x = object.originalGeometry[i].x;
                object.geometry.vertices[i].y = object.originalGeometry[i].y;
                object.geometry.vertices[i].z = object.originalGeometry[i].z;

                //   if (object.geometry.vertices[i][grain] > glitchPoint - glitchRange && object.geometry.vertices[i][grain] < glitchPoint + glitchRange ) {

                //     object.geometry.vertices[i][direction] -= glitchAmount
                // }
            }
            object.geometry.verticesNeedUpdate = true;
            object.updateMatrix();
        }

        function bubbleDistort(object) {}

        // setInterval(function() {
        //   if(masking === true) {
        //     masking = false
        //   }
        //   else {
        //     masking = true
        //   }
        //   console.log(masking)
        // }, 5000)

        const sceneInfo1 = setupScene1();
        const sceneInfo2 = setupScene2();
        const sceneInfo3 = setupScene3();
        const sceneInfo4 = setupScene4();

        var sceneInfoArray = [sceneInfo1, sceneInfo2, sceneInfo3, sceneInfo4];

        console.log(sceneInfoArray[1]);

        function bigScreen(sceneInfo) {
            for (var i = 0; i < sceneInfoArray.length; i++) {
                if (sceneInfoArray[i] !== sceneInfo) {
                    sceneInfoArray[i].elem.style.width = '0%';
                    sceneInfoArray[i].elem.style.height = '0%';
                } else {
                    sceneInfoArray[i].elem.style.width = '100%';
                    sceneInfoArray[i].elem.style.height = '100%';
                }
            }
        }

        function splitScreen(sceneInfo1, sceneInfo2) {
            for (var i = 0; i < sceneInfoArray.length; i++) {
                if (
                    sceneInfoArray[i] !== sceneInfo1 &&
                    sceneInfoArray[i] !== sceneInfo2
                ) {
                    sceneInfoArray[i].elem.style.width = '0%';
                    sceneInfoArray[i].elem.style.height = '0%';
                } else {
                    sceneInfoArray[i].elem.style.width = '50%';
                    sceneInfoArray[i].elem.style.height = '100%';
                }
            }
        }

        function undoScreenChange() {
            console.log('undid');
            for (var i = 0; i < sceneInfoArray.length; i++) {
                sceneInfoArray[i].elem.style.width = '50%';
                sceneInfoArray[i].elem.style.height = '50%';
            }
        }

        function resizeRendererToDisplaySize(renderer) {
            if (renderer === visuals.renderer2) {
                // return
            }
            const canvas = renderer.domElement;
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            const needResize =
                canvas.width !== width || canvas.height !== height;
            if (needResize) {
                renderer.setSize(width, height, false);
            }
            return needResize;
        }

        var setAnalglyphEffect = 'analglyph';
        var effectType = 'film';
        var masking = true;
        function renderSceneInfo(sceneInfo) {
            if (masking === true && sceneInfo === sceneInfo4) {
                bigScreen(sceneInfo4);
                resizeRendererToDisplaySize(visuals.renderer2);
            }

            const { scene, camera, elem } = sceneInfo;

            // get the viewport relative position of this element
            const {
                left,
                right,
                top,
                bottom,
                width,
                height,
            } = elem.getBoundingClientRect();

            const isOffscreen =
                bottom < 0 ||
                top > visuals.renderer.domElement.clientHeight ||
                right < 0 ||
                left > visuals.renderer.domElement.clientWidth;

            if (isOffscreen) {
                return;
            }
            // console.log(renderer)
            camera.aspect = width / height;
            camera.updateProjectionMatrix();

            const positiveYUpBottom =
                visuals.renderer.domElement.clientHeight - bottom;
            visuals.renderer.setScissor(left, positiveYUpBottom, width, height);
            visuals.renderer.setViewport(
                left,
                positiveYUpBottom,
                width,
                height
            );

            if (sceneInfo === sceneInfo4) {
                if (masking === false) {
                    visuals.renderer2.setScissor(
                        left,
                        positiveYUpBottom,
                        width,
                        height
                    );
                    visuals.renderer2.setViewport(
                        left,
                        positiveYUpBottom,
                        width,
                        height
                    );
                    sceneInfo4.plane.geometry.verticesNeedUpdate = true;
                    //renderer2 renders to bufferTexture
                    visuals.renderer2.setRenderTarget(sceneInfo4.bufferTexture);
                    visuals.renderer2.render(
                        sceneInfo4.bufferScene,
                        sceneInfo4.bufferCamera
                    );

                    //set target to the main scene to render the plane with Buffertexture map
                    visuals.renderer2.setRenderTarget(null);
                    visuals.renderer2.render(scene, camera);
                    //scene 4 render
                    visuals.renderer2.render(scene, camera);
                    visuals.analyglyphEffect2.render(scene, camera);
                    return;
                } else {
                    var time = performance.now() * 0.001 + 6000;
                    sceneInfo4.composer4.setSize(width, height);
                    visuals.renderer2.setScissor(
                        left,
                        positiveYUpBottom,
                        width,
                        height
                    );
                    visuals.renderer2.setViewport(
                        left,
                        positiveYUpBottom,
                        width,
                        height
                    );
                    sceneInfo4.plane.geometry.verticesNeedUpdate = true;
                    sceneInfo4.composer4.render(time);
                }
            } else {
                // rest of scene render
                switch (setAnalglyphEffect) {
                    case 'none':
                        visuals.renderer.render(scene, camera);
                        break;
                    case 'analglyph':
                        visuals.analyglyphEffect.render(scene, camera);
                        break;

                    case 'effect':
                        switch (effectType) {
                            case 'glitch':
                                visuals.glitchPass.enabled = true;
                                break;
                            case 'film':
                                visuals.filmPass.enabled = true;
                                break;
                        }

                        switch (sceneInfo) {
                            case sceneInfo1:
                                visuals.composer1.render(scene, camera);
                                break;

                            case sceneInfo2:
                                if (effectType !== 'film') {
                                    visuals.composer2.render(scene, camera);
                                } else if (effectType === 'glitch') {
                                    visuals.composer1.render(scene, camera);
                                }

                                break;

                            case sceneInfo3:
                                if (effectType !== 'film') {
                                    visuals.composer3.render(scene, camera);
                                }
                                break;
                        }
                }
            }
        }

        var movementRate = 5;
        var velocity = 0;
        var acceleration = 0;
        var range = 30;

        function beatLineAnimation() {
            updateSceneFrustum(sceneInfo2);

            //if pen leaves view
            if (!sceneInfo2.frustum.intersectsObject(sceneInfo2.mesh)) {
                // Reset pen position
                sceneInfo2.mesh.position.x = -sceneInfo2.mesh.position.x * 0.7;

                beatLinePoints = [];

                beatLinePoints.push(
                    new THREE.Vector3(
                        sceneInfo2.mesh.position.x,
                        sceneInfo2.mesh.position.y,
                        0
                    )
                );

                sceneInfo2.beatLine.setVertices(beatLinePoints);
            }
            //if pen is in view
            else {
                beatLinePoints.push(
                    new THREE.Vector3(
                        sceneInfo2.mesh.position.x,
                        sceneInfo2.mesh.position.y,
                        0
                    )
                );

                sceneInfo2.beatLine.setVertices(beatLinePoints);

                //Physics

                acceleration =
                    800 / (beatAnimation - sceneInfo2.mesh.position.y);

                if (isFinite(acceleration) !== true) {
                    acceleration = 0;
                    velocity *= 0.7;
                } else if (
                    sceneInfo2.mesh.position.y > beatAnimation - range &&
                    sceneInfo2.mesh.position.y < beatAnimation + range
                ) {
                    acceleration = 0;
                    velocity *= 0.7;
                }

                velocity += acceleration;
                sceneInfo2.mesh.position.y += velocity;
                sceneInfo2.mesh.position.x += movementRate;
            }
            if (
                sceneInfo2.mesh.position.y > 150 ||
                sceneInfo2.mesh.position.y < -150
            ) {
                sceneInfo2.mesh.position.y = sceneInfo2.mesh.position.y / 2;
            }
        }

        function updateSceneFrustum(sceneInfo) {
            sceneInfo.camera.updateMatrixWorld();
            sceneInfo.camera.matrixWorldInverse.getInverse(
                sceneInfo.camera.matrixWorld
            );

            sceneInfo.cameraViewProjectionMatrix.multiplyMatrices(
                sceneInfo.camera.projectionMatrix,
                sceneInfo.camera.matrixWorldInverse
            );
            sceneInfo.frustum.setFromProjectionMatrix(
                sceneInfo.cameraViewProjectionMatrix
            );
        }

        function render(time) {
            pitchPlaneAnimation();
            beatLineAnimation();
            //neoline accounts for increasing cpu usage over time
            neoLineAnimation();

            if (checkForUndoAnalGlyphControl === true) {
                undoFader(analglyphBarLength);
            }

            if (flickerToggle === true) {
                sceneInfo4.sculpture.rotation.y += 0.01;
                flickerObject(sceneInfo4.plane);
            }

            resizeRendererToDisplaySize(visuals.renderer);
            resizeRendererToDisplaySize(visuals.renderer2);

            visuals.renderer.setScissorTest(false);
            visuals.renderer.clear(true, true);
            visuals.renderer.setScissorTest(true);

            if (masking === false) {
                // console.log('not true')
                renderSceneInfo(sceneInfo1);
                renderSceneInfo(sceneInfo2);
                renderSceneInfo(sceneInfo3);
            }

            renderSceneInfo(sceneInfo4);

            requestAnimationFrame(render);
        }
        requestAnimationFrame(render);
    }

    runVisuals();

    var trackPosition;
    var initialMilliseconds;
    var initialDate;
    var timerID;
    var elapsedMilliseconds;
    var elapsedDate;
    var elapsedTime = 0;

    var sectionCounter = 0;
    var barCounter = 0;
    var beatCounter = 0;
    var tatumCounter = 0;
    var segmentCounter = 0;

    function findNextDivision(
        divisionNameStart,
        divisionCounter,
        divisionName
    ) {
        var i = 0;
        var truthCond = true;

        while (truthCond === true && i < divisionNameStart.length) {
            if (divisionNameStart[i] > trackPosition) {
                divisionCounter = i;
                if (divisionName === 'bar') {
                    //console.log("Find next division", divisionName + "Counter", divisionCounter)
                }

                truthCond = false;
                return divisionCounter;
            }
            i++;
        }
    }

    function checkForHits() {
        var syncCompensation = 0;

        if (
            elapsedTime + elapsedMilliseconds >=
            trackData.beatsStart[beatCounter] - syncCompensation
        ) {
            //console.log("New beat")
            if (beatAnimation === -100) {
                //console.log("Beat")
                beatAnimation = 100;
            } else {
                beatAnimation = -100;
                //console.log("Boop")
            }

            beatCounter++;
        }

        if (
            elapsedTime + elapsedMilliseconds >=
            trackData.sectionNearestBarStart[sectionCounter + 1] -
                syncCompensation
        ) {
            sectionCounter++;
            //  console.log("Check for hits New section")
        }
        if (
            elapsedTime + elapsedMilliseconds >=
            trackData.barsStart[barCounter] - syncCompensation
        ) {
            barCounter++;

            //console.log("check for hits barCounter", barCounter)
        }
        if (
            elapsedTime + elapsedMilliseconds >=
            trackData.tatumsStart[tatumCounter] - syncCompensation
        ) {
            tatumCounter++;
            //console.log("New tatum")
        }

        if (
            elapsedTime + elapsedMilliseconds >=
            trackData.segmentsStart[segmentCounter] - syncCompensation
        ) {
            planeBackRowAnimation =
                trackData.segments[segmentCounter]['pitches'];
            var timbreArray = trackData.segments[segmentCounter].timbre;
            var firstHalf = [];
            var secondHalf = [];
            for (var i = 0; i < timbreArray.length; i++) {
                if (i < 6) {
                    firstHalf.push(timbreArray[i]);
                } else {
                    secondHalf.push(timbreArray[i]);
                }
            }

            timbreSum1 = firstHalf.reduce((acc, val) => (acc *= val));
            timbreSum2 = secondHalf.reduce((acc, val) => (acc *= val));
            if (timbreSum1 > 0) {
                var negative = false;
            } else {
                var negative = true;
            }
            timbreSum1 = timbreSum1.toString();
            timbreSum1 = negative
                ? parseInt(timbreSum1[1]) * -1
                : parseInt(timbreSum1[1]);

            if (timbreSum2 > 0) {
                var negative = false;
            } else {
                var negative = true;
            }
            timbreSum2 = timbreSum2.toString();
            timbreSum2 = negative
                ? parseInt(timbreSum2[1]) * -1
                : parseInt(timbreSum2[1]);

            timbreSum1 = Math.ceil(timbreSum1 * 0.4);
            timbreSum2 = Math.ceil(timbreSum2 * 0.4);
            //  console.log("timbreSum1", timbreSum1)
            //    console.log("timberSum2", timbreSum2)

            segmentCounter++;
        }
    }

    function getNeoDimension(bars) {
        var result;

        if (Math.sqrt(bars.length) % 1 !== 0) {
            var i = 0;
            while (Math.sqrt(result) % 1 !== 0) {
                result = bars.length + i;
                i++;
            }
            return Math.sqrt(result);
        } else {
            return Math.sqrt(bars.length);
        }
    }

    function timerControl(paused) {
        // console.log('timerControl')
        if (paused === false) {
            startTimer();
        } else if (paused === true) {
            stopTimer();
        }
    }

    function startTimer() {
        stopTimer();
        segmentCounter = findNextDivision(
            trackData.segmentsStart,
            segmentCounter,
            'segment'
        );
        tatumCounter = findNextDivision(
            trackData.tatumsStart,
            tatumCounter,
            'tatum'
        );
        beatCounter = findNextDivision(
            trackData.beatsStart,
            beatCounter,
            'beat'
        );
        barCounter = findNextDivision(trackData.barsStart, barCounter, 'bar');
        sectionCounter =
            findNextDivision(
                trackData.sectionNearestBarStart,
                sectionCounter,
                'section'
            ) - 1;

        //console.log("Start timer elapsed time", elapsedTime)
        elapsedMilliseconds = 0;
        initialDate = new Date();
        initialMilliseconds = initialDate.getTime();
        //console.log("Start timer")

        timerID = setInterval(() => {
            elapsedDate = new Date();
            elapsedMilliseconds = elapsedDate.getTime() - initialMilliseconds;
            //console.log("Start timer Elapsed millis", elapsedMilliseconds)
            //console.log("Tracked time", elapsedTime + elapsedMilliseconds)
            checkForHits();
        }, 1);
    }

    function stopTimer() {
        clearInterval(timerID);
    }

    var player = new Spotify.Player({
        name: 'Hyporeal Visualizer',
        getOAuthToken: (callback) => {
            var url = window.location.href;
            var tokenArray = url.split('=');
            var refreshToken = tokenArray[1];
            var refreshURL = './refresh_token?refresh_token=' + refreshToken;
            fetch(refreshURL, {
                method: 'GET',
            })
                .then((res) => res.json())
                .then((data) => {
                    var tokenMain = data.access_token;
                    return callback(tokenMain);
                });
        },
    });

    // Error handling
    player.addListener('initialization_error', ({ message }) => {
        console.error(message);
    });
    player.addListener('authentication_error', ({ message }) => {
        console.error(message);
    });
    player.addListener('account_error', ({ message }) => {
        console.error(message);
    });
    player.addListener('playback_error', ({ message }) => {
        console.error(message);
    });

    var currentTrackID;
    var stored_track_id = 0;
    var trackData;
    var queryRunning;
    // Playback status updates
    player.addListener('player_state_changed', (state) => {
        if (!state && queryRunning === true) {
            queryRunning = false;
            stopTimer();
            stopTrackPositionQuery();
        } else if (queryRunning !== true) {
            queryRunning = true;
            startTrackPositionQuery();
        }
        if (state) {
            // elapsedTime = trackPosition;
            currentTrackID = state['track_window']['current_track']['id'];

            // trackPosition = state['position'];
            if (currentTrackID !== stored_track_id) {
                console.log(trackData);
                trackPosition = 0;
                stored_track_id = currentTrackID;
                clearParagraph = true;

                console.log('New track detected:', stored_track_id);
                console.log('Track position', trackPosition);

                fetch('./', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(state),
                })
                    .then((res) => res.json())
                    .then((data) => {
                        trackData = new songData(data);
                        return trackData;
                    })
                    .then((trackData) => {
                        neoDimension = getNeoDimension(trackData.bars);
                    })
                    .then((res) => timerControl(state['paused']));
            } else {
                trackPosition = state['position'];
                elapsedTime = trackPosition;
                if (trackData !== undefined) {
                    timerControl(state['paused']);
                }
            }
        }
    });

    var trackPositionQuery;
    function startTrackPositionQuery() {
        var trackPositionQueryRate = 1000;

        trackPositionQuery = setInterval(() => {
            // console.log('Querying...');
            player.getCurrentState().then((state) => {
                if (!state) {
                    // console.log('No music playing');
                    return;
                }
                trackPosition = state['position'];
                elapsedTime = trackPosition;
                // console.log('Query trackPosition', trackPosition);
                if (state['paused'] === false && trackData !== undefined) {
                    startTimer();
                }
            });
        }, trackPositionQueryRate);
    }
    // startTrackPositionQuery()

    function stopTrackPositionQuery() {
        clearInterval(trackPositionQuery);
    }
    //add something to allow stop querying when we don't need to

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
