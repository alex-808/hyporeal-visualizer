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
    var planeBackRowAnimation = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var planeStoredBackRow = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    var timbreSum1 = 0;
    var timbreSum2 = 0;

    function runVisuals() {
        const canvas = document.querySelector('#c');

        function setupScene1() {
            const sceneInfo = makeScene(document.querySelector('#pitchplane'));
            var planeDimension = 12;
            sceneInfo.planeDimension = planeDimension;

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

            sceneInfo.animation = function () {
                var rowVertices = 143;
                var columnVertices = 131;

                if (planeStoredBackRow === planeBackRowAnimation) {
                    //Decay effect
                    for (var i = 0; i < sceneInfo.planeDimension; i++) {
                        if (sceneInfo.mesh.geometry.vertices[i].z > 0) {
                            if (flowToggle === true) {
                                sceneInfo.mesh.geometry.vertices[i].z -= 0.0125;
                            } else {
                                sceneInfo.mesh.geometry.vertices[i].z += 0.0025;
                            }
                        }
                    }
                } else {
                    planeStoredBackRow = planeBackRowAnimation;
                    for (var i = 0; i < sceneInfo.planeDimension; i++) {
                        sceneInfo.mesh.geometry.vertices[i].z =
                            planeStoredBackRow[i];
                    }
                }

                sceneInfo.mesh.geometry.verticesNeedUpdate = true;
                //Push backrow forward
                for (
                    columnVertices;
                    columnVertices >= 11;
                    columnVertices -= sceneInfo.planeDimension
                ) {
                    for (
                        rowVertices;
                        rowVertices > columnVertices;
                        rowVertices--
                    ) {
                        sceneInfo.mesh.geometry.vertices[rowVertices].z =
                            sceneInfo.mesh.geometry.vertices[
                                rowVertices - sceneInfo.planeDimension
                            ].z;
                    }
                }
            };

            return sceneInfo;
        }

        var beatLinePoints = [];

        function setupScene2() {
            const sceneInfo = makeScene(document.querySelector('#beatline'));

            sceneInfo.scene.remove(camera);
            sceneInfo.camera.position.z = 1000;
            var goalLineArray1 = new THREE.Geometry();
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

            const physics = {
                movementRate: 5,
                velocity: 0,
                acceleration: 0,
                beatMomentum: 0,
                range: 30,
            };

            sceneInfo.physics = physics;

            var frustum = new THREE.Frustum();
            var cameraViewProjectionMatrix = new THREE.Matrix4();

            cameraViewProjectionMatrix.multiplyMatrices(
                sceneInfo.camera.projectionMatrix,
                sceneInfo.camera.matrixWorldInverse
            );

            frustum.setFromProjectionMatrix(cameraViewProjectionMatrix);

            sceneInfo.frustum = frustum;
            sceneInfo.cameraViewProjectionMatrix = cameraViewProjectionMatrix;

            sceneInfo.animation = function () {
                utils.updateSceneFrustum(sceneInfo);

                //if pen leaves view
                if (!sceneInfo.frustum.intersectsObject(sceneInfo.mesh)) {
                    // Reset pen position
                    sceneInfo.mesh.position.x =
                        -sceneInfo.mesh.position.x * 0.7;

                    beatLinePoints = [];

                    beatLinePoints.push(
                        new THREE.Vector3(
                            sceneInfo.mesh.position.x,
                            sceneInfo.mesh.position.y,
                            0
                        )
                    );

                    sceneInfo.beatLine.setVertices(beatLinePoints);
                }
                //if pen is in view
                else {
                    beatLinePoints.push(
                        new THREE.Vector3(
                            sceneInfo.mesh.position.x,
                            sceneInfo.mesh.position.y,
                            0
                        )
                    );

                    sceneInfo.beatLine.setVertices(beatLinePoints);

                    utils.updateScenePhysics(sceneInfo);

                    sceneInfo.mesh.position.y += sceneInfo.physics.velocity;
                    sceneInfo.mesh.position.x += sceneInfo.physics.movementRate;
                }
                if (
                    sceneInfo.mesh.position.y > 150 ||
                    sceneInfo.mesh.position.y < -150
                ) {
                    sceneInfo.mesh.position.y = sceneInfo.mesh.position.y / 2;
                }
            };

            return sceneInfo;
        }

        function setupScene3() {
            const sceneInfo = makeScene(document.querySelector('#neoline'));

            var renderPass3 = new RenderPass(sceneInfo.scene, sceneInfo.camera);
            visuals.composer3.addPass(renderPass3);
            visuals.composer3.addPass(visuals.glitchPass);
            visuals.composer3.addPass(visuals.filmPass);

            //Pen
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
            sceneInfo.pen = pen;

            //Plane
            var planeWidth = 1.5;
            var planeHeight = 1.5;

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

            let sceneBarCount = 0;
            let sceneBeatCount = 0;
            let sceneSegCount = 0;
            let sceneSectionCount = 0;
            let paragraphArray = [];
            let maxWords = 250;
            let squaresArray = [];

            sceneInfo.paraGraphDimensions = null;

            function addSectionPlane() {
                var planeMaterialBlue = new THREE.MeshBasicMaterial({
                    color: 'blue',
                });
                var planeMaterialRed = new THREE.MeshBasicMaterial({
                    color: 'red',
                });
                var segColorIndex =
                    timbreSum1 % 2 === 0 ? planeMaterialRed : planeMaterialBlue;
                var planeGeometry = new THREE.PlaneBufferGeometry(
                    sceneInfo.boxWidth,
                    sceneInfo.boxWidth
                );
                var plane = new THREE.Mesh(planeGeometry, segColorIndex);
                plane.position.x =
                    squaresArray[sceneBarCount][0].x + sceneInfo.boxWidth / 2;
                plane.position.y =
                    squaresArray[sceneBarCount][0].y - sceneInfo.boxWidth / 2;
                plane.position.z = squaresArray[sceneBarCount][0].z - 0.01;
                paragraphArray.push(plane);
                sceneInfo.scene.add(plane);
            }

            function addPointToStroke() {
                sceneInfo.neoLinePoints.push(
                    new THREE.Vector2(
                        squaresArray[sceneBarCount][0].x +
                            timbreSum1 * boxDivisions +
                            sceneInfo.boxWidth / 2,
                        squaresArray[sceneBarCount][0].y +
                            (timbreSum2 * boxDivisions - sceneInfo.boxWidth / 2)
                    )
                );

                strokePoints++;
            }

            function addStrokeToChar() {
                if (timbreSum1 % 2 === 0) {
                    //console.log("line")
                    var geometry = new THREE.BufferGeometry().setFromPoints(
                        sceneInfo.neoLinePoints
                    );
                    var material = new THREE.LineBasicMaterial({
                        color: 'white',
                    });

                    var line = new THREE.Line(geometry, material);

                    neoLineArray.push(line);
                    paragraphArray.push(line);
                    geometry.dispose();
                } else {
                    var curve = new THREE.SplineCurve(sceneInfo.neoLinePoints);
                    var points = curve.getPoints(50);
                    var geometry = new THREE.BufferGeometry().setFromPoints(
                        points
                    );
                    var splineObject = new THREE.Line(geometry, material);
                    neoLineArray.push(splineObject);
                    paragraphArray.push(splineObject);
                    geometry.dispose();
                }
                // need to ensure that these points are being cleaned up properly after every 3
                sceneInfo.neoLinePoints.shift();
                sceneInfo.neoLinePoints.shift();
                strokePoints = 0;
            }

            sceneInfo.resetParagraph = function (newDimension) {
                for (var i = 0; i < paragraphArray.length; i++) {
                    sceneInfo.scene.remove(paragraphArray[i]);
                }
                neoLineArray = [];
                paragraphArray = [];

                if (utils.getRandomInt(2) === 0) {
                    faderInverted = !faderInverted;
                    console.log('faderInverted', faderInverted);
                    if (trackData) {
                        totalFader();
                    }
                }

                effects.checkForUndoFader = true;
                sceneInfo.scene.remove(sceneInfo.plane);
                sceneInfo.planeGeometry = new THREE.PlaneGeometry(
                    sceneInfo.planeWidth,
                    sceneInfo.planeHeight,
                    newDimension,
                    newDimension
                );
                sceneInfo.plane = new THREE.Mesh(
                    sceneInfo.planeGeometry,
                    sceneInfo.planeMaterial
                );

                var q = 0;
                var k = 0;
                squaresArray = [];
                for (var i = 0; i < newDimension * newDimension; i++) {
                    squaresArray[i] = [];
                    if (i % newDimension === 0 && i > 0) {
                        q++;
                    }
                    for (var j = 0; j < newDimension; j++) {
                        if (j < 2) {
                            k = 0;
                            squaresArray[i][j] =
                                sceneInfo.plane.geometry.vertices[i + j + q];
                        } else {
                            k = newDimension - 1;
                            squaresArray[i][j] =
                                sceneInfo.plane.geometry.vertices[
                                    i + j + k + q
                                ];
                        }
                    }
                }
                if (squaresArray.length === 0) {
                    sceneInfo.boxWidth = 0;
                } else {
                    sceneInfo.boxWidth = Math.abs(
                        squaresArray[0][0].x - squaresArray[0][1].x
                    );
                }
            };

            sceneInfo.animation = function () {
                if (!trackData || !squaresArray) return;

                if (sceneSectionCount !== sectionCounter) {
                    console.log(sceneSectionCount, sectionCounter);
                    neoToggle = true;

                    sceneSectionCount = sectionCounter;

                    sceneBeatCount = beatCounter;
                }

                if (squaresArray[sceneBarCount]) {
                    if (
                        trackData.sectionNearestBarStart[
                            sceneSectionCount + 1
                        ] === trackData.beatsStart[beatCounter + 1] &&
                        neoToggle === true
                    ) {
                        neoToggle = false;
                        if (utils.getRandomInt(2) === 0) {
                            console.log('glitch reset disabled');
                            effects.canUndistortModel = false;
                            effects.distortModelBars = 4;
                        }

                        sceneBeatCount = beatCounter;
                    }
                }

                if (sceneBarCount !== barCounter) {
                    // effects.allowGlitchReset = true
                    effects.distortModelBars--;
                    effects.maskingBars--;
                    sceneBarCount = barCounter;
                    distortModel(sceneInfo4.plane);
                    if (utils.getRandomInt(4) === 0) {
                        totalFader();
                    }

                    if (utils.getRandomInt(4) === 0) {
                        effects.glitchTheBar = 4;
                    }
                    if (
                        trackData.sectionNearestBarStart[sectionCounter + 1] ===
                        trackData.barsStart[barCounter]
                    ) {
                        getSectionEffect(10);
                        addSectionPlane();
                    }

                    sceneInfo.neoLinePoints = [];
                    boxDivisions = sceneInfo.boxWidth / 7;

                    sceneInfo.pen.position.x =
                        squaresArray[sceneBarCount][0].x +
                        sceneInfo.boxWidth / 2;
                    sceneInfo.pen.position.y =
                        squaresArray[sceneBarCount][0].y -
                        sceneInfo.boxWidth / 2;

                    for (var i = 0; i < neoLineArray.length; i++) {
                        sceneInfo.scene.add(neoLineArray[i]);
                        //delete neoLineArray[i]
                    }

                    neoLineArray = [];
                    if (paragraphArray.length > maxWords) {
                        // console.log(paragraphArray.length - maxWords)
                        for (
                            var i = 0;
                            (i = paragraphArray.length - maxWords);
                            i++
                        ) {
                            sceneInfo.scene.remove(paragraphArray[0]);
                            paragraphArray.shift();
                        }
                    }
                }

                if (
                    sceneBeatCount !== beatCounter &&
                    effects.glitchTheBar > 0
                ) {
                    effects.glitchTheBar--;
                    distortModel(sceneInfo4.plane);
                }

                sceneBeatCount = beatCounter;

                if (sceneSegCount !== segmentCounter) {
                    addPointToStroke();
                    sceneSegCount = segmentCounter;
                }

                if (strokePoints === 3) {
                    addStrokeToChar();
                }
            };

            return sceneInfo;
        }

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
            composer4.addPass(visuals.filmPass);

            composer4.addPass(clearPass);
            composer4.addPass(maskPass);
            composer4.addPass(texturePass);
            composer4.addPass(clearMaskPass);
            composer4.addPass(outputPass);

            var geometrySegments = 100;

            var geometry = new THREE.PlaneGeometry(
                canvas.width / 60,
                canvas.height / 60,
                geometrySegments,
                geometrySegments
            );

            var material = new THREE.MeshBasicMaterial({ map: bufferTexture });
            var plane = new THREE.Mesh(geometry, material);
            plane.position.z = -1;
            sceneInfo.scene.add(plane);
            sceneInfo.geometry = geometry;
            sceneInfo.plane = plane;

            var originalGeometry = JSON.parse(
                JSON.stringify(plane.geometry.vertices)
            );

            plane.originalGeometry = originalGeometry;

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

                // console.log(object)
            });

            sceneInfo.animation = function () {
                if (sculpture) {
                    sceneInfo.sculpture.rotation.y += 0.01;
                    flickerModel(sceneInfo.plane);
                }
            };
            return sceneInfo;
        }

        const effects = {
            previous: null,
            previousBigScreen: null,
            renderMode: 'analglyph',
            masking: true,
            maskingBars: 0,
            canUndistortModel: true,
            distortModelBars: 0,
            storedEffect: null,
            effectType: 'film',
            checkForUndoFader: false,
            glitchTheBar: false,
        };

        function handleEffects() {
            if (effects.distortModelBars < 1) {
                effects.canUndistortModel = true;
            }
            if (effects.maskingBars < 1 && effects.masking === true) {
                effects.masking = false;
                setTimeout(function () {
                    undoScreenChange();
                }, 2000);
            }
        }

        //add more variety for section changes
        function getSectionEffect(maxRandom) {
            var random = utils.getRandomInt(maxRandom);
            // random = 0;
            switch (random) {
                case 0:
                case 1:
                    if (effects.previous === 'glitch')
                        return getSectionEffect(10);

                    console.log('glitch');
                    totalGlitch();
                    if (utils.getRandomInt(2) === 0) totalFader();
                    effects.previous = 'glitch';
                    break;

                case 2:
                case 3:
                case 4:
                    if (effects.previous !== 'film') {
                        console.log('film');
                        totalFilm();
                        effects.previous = 'film';
                    } else {
                        getSectionEffect(10);
                    }

                    break;

                case 5:
                case 6:
                    console.log('pivot');

                    if (effects.renderMode !== 'none') {
                        console.log('none and maybe fader');
                        totalNone();
                        totalGlitch();
                        if (utils.getRandomInt(2) === 0) {
                            totalFader();
                        }
                    } else {
                        console.log('analglyph');
                        effects.renderMode = 'analglyph';
                        totalFader();
                    }
                    effects.previous = 'pivot';
                    break;

                case 7:
                    if (effects.previous !== 'masking') {
                        console.log('masking');
                        effects.masking = true;
                        effects.maskingBars = 2;
                        effects.previous = 'masking';
                    } else {
                        getSectionEffect(10);
                    }
                    break;

                case 8:
                case 9:
                    if (effects.previous !== 'bigScreen') {
                        console.log('bigScreen');
                        var bigScreenInterval;
                        effects.canUndistortModel = false;
                        effects.distortModelBars = 4;
                        if (trackData.barsStart[barCounter + 4]) {
                            bigScreenInterval =
                                trackData.barsStart[barCounter + 4] -
                                trackData.barsStart[barCounter];
                        } else {
                            bigScreenInterval = 5000;
                        }
                        var random = utils.getRandomInt(3);
                        if (random === effects.previousBigScreen) {
                            random = utils.getRandomInt(3);
                        }
                        var sceneIndex;
                        switch (random) {
                            case 0:
                                sceneIndex = 0;
                                effects.previousBigScreen = 0;
                                break;
                            case 1:
                                sceneIndex = 1;
                                effects.previousBigScreen = 1;
                                break;
                            case 2:
                                sceneIndex = 3;
                                effects.previousBigScreen = 3;
                                break;
                        }
                        bigScreen(sceneInfoArray[sceneIndex]);
                        setTimeout(function () {
                            totalGlitch();
                            undoScreenChange();
                        }, bigScreenInterval);
                        effects.previous = 'bigScreen';
                    } else {
                        getSectionEffect(10);
                    }
                    break;
            }
        }

        var strokePoints = 0;

        var boxDivisions;

        var neoToggle = true;

        setInterval(function () {
            flowToggle = !flowToggle;
        }, 50);
        var flowToggle = true;

        function totalGlitch() {
            var random = utils.getRandomInt(2);
            splitScreen(sceneInfoArray[0], sceneInfoArray[1]);
            console.log('glitched');
            effects.storedEffect = effects.renderMode;
            if (effects.storedEffect === 'effect') {
                if (random === 0) {
                    effects.storedEffect = 'analglyph';
                } else {
                    effects.storedEffect = 'none';
                }
            }
            console.log('effects.storedEffect', effects.storedEffect);
            sceneInfo2.beatLineMaterial.lineWidth = 20;
            effects.renderMode = 'effect';
            effects.effectType = 'glitch';

            setTimeout(function () {
                effects.renderMode = effects.storedEffect;
                visuals.glitchPass.enabled = false;
                sceneInfo2.beatLineMaterial.lineWidth = 1.8;
                undoScreenChange();
            }, 100);
        }

        // need to set it so if there is a skip in song, the timeouts are cleared
        function totalFilm() {
            var random = utils.getRandomInt(3);
            var totalFilmDuration = 10000;

            if (random === 0) {
                if (trackData.beatsStart[beatCounter + 1]) {
                    // short
                    totalFilmDuration =
                        trackData.beatsStart[beatCounter + 1] -
                        trackData.beatsStart[beatCounter];
                    visuals.dotScreenPass.enabled = true;
                } else {
                    totalFilmDuration = 1000;
                    visuals.dotScreenPass.enabled = true;
                }
            } else {
                if (trackData.beatsStart[beatCounter + 8]) {
                    // long
                    totalFilmDuration =
                        trackData.beatsStart[beatCounter + 8] -
                        trackData.beatsStart[beatCounter];
                    totalFader();
                } else totalFilmDuration = 10000;
                totalFader();
            }

            effects.renderMode = 'effect';
            effects.effectType = 'film';

            setTimeout(function () {
                effects.renderMode = 'analglyph';
                visuals.filmPass.enabled = false;
                visuals.dotScreenPass.enabled = false;
            }, totalFilmDuration);
        }

        function totalNone() {
            effects.renderMode = 'none';
            effects.effectType = 'film';
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

        function totalFader() {
            if (
                sectionCounter > trackData.sections.length / 2 &&
                utils.getRandomInt(3) === 0
            ) {
                faderInverted = !faderInverted;
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
                fadingBool = true;

                analglyphStoredBarCounter = barCounter;
                if (utils.getRandomInt(2) === 0) {
                    sceneInfo4.bufferScene.background = _.cloneDeep(
                        faderColors[faderColor2]
                    );
                    analglyphBarLength = 2;
                    effects.checkForUndoFader = true;
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

                    effects.checkForUndoFader = true;
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
                clearInterval(fadeInterval);

                sceneInfo4.bufferScene.background = _.cloneDeep(
                    faderColors[faderColor1]
                );
                effects.checkForUndoFader = false;
                fadingBool = false;
            }
        }

        var factor = -1.5;
        var vector = 0.1;
        var flickerRange = 0.1;
        var shift = 0.005;

        function flickerModel(object) {
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

        function distortModel(object) {
            var directionArray = ['x', 'y', 'z'];
            var negative = utils.getRandomInt(2) === 0 ? -1 : 1;
            var direction = directionArray[utils.getRandomInt(3)];

            var glitchRange = (utils.getRandomInt(10) + 1) / 10;
            var glitchPoint = Math.random() * negative;
            var glitchAmount = 0.05;

            var grainDir;
            switch (direction) {
                case (direction = 'x'):
                    grainDir = 'y';
                    break;
                case (direction = 'y'):
                    grainDir = 'x';
                    break;
                case (direction = 'z'):
                    grainDir = utils.getRandomInt(2) === 0 ? 'y' : 'x';
                    glitchAmount = 0.1;
                    break;
            }
            let vertices = object.geometry.vertices;

            for (var i = 0; i < object.geometry.vertices.length; i++) {
                if (
                    vertices[i][grainDir] > glitchPoint - glitchRange &&
                    vertices[i][grainDir] < glitchPoint + glitchRange
                ) {
                    vertices[i][direction] += glitchAmount;
                }

                object.geometry.verticesNeedUpdate = true;
            }
            if (effects.canUndistortModel === true) {
                setTimeout(function () {
                    unDistortModel(object);
                }, 100);
            }
        }

        function unDistortModel(object) {
            for (var i = 0; i < object.geometry.vertices.length; i++) {
                object.geometry.vertices[i].x = object.originalGeometry[i].x;
                object.geometry.vertices[i].y = object.originalGeometry[i].y;
                object.geometry.vertices[i].z = object.originalGeometry[i].z;
            }
            object.geometry.verticesNeedUpdate = true;
            object.updateMatrix();
        }

        function bubbleDistort(object) {}

        const sceneInfo1 = setupScene1();
        const sceneInfo2 = setupScene2();
        const sceneInfo3 = setupScene3();
        const sceneInfo4 = setupScene4();

        var sceneInfoArray = [sceneInfo1, sceneInfo2, sceneInfo3, sceneInfo4];

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

        function renderSceneInfo(sceneInfo) {
            if (effects.masking === true && sceneInfo === sceneInfo4) {
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
                if (effects.masking === false) {
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
                switch (effects.renderMode) {
                    case 'none':
                        visuals.renderer.render(scene, camera);
                        break;
                    case 'analglyph':
                        visuals.analyglyphEffect.render(scene, camera);
                        break;

                    case 'effect':
                        switch (effects.effectType) {
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
                                if (effects.effectType !== 'film') {
                                    visuals.composer2.render(scene, camera);
                                } else if (effects.effectType === 'glitch') {
                                    visuals.composer1.render(scene, camera);
                                }

                                break;

                            case sceneInfo3:
                                if (effects.effectType !== 'film') {
                                    visuals.composer3.render(scene, camera);
                                }
                                break;
                        }
                }
            }
        }

        function render() {
            handleEffects();
            sceneInfo1.animation();
            sceneInfo2.animation();
            sceneInfo3.animation();

            if (effects.checkForUndoFader === true) {
                undoFader(analglyphBarLength);
            }

            sceneInfo4.animation();

            resizeRendererToDisplaySize(visuals.renderer);
            resizeRendererToDisplaySize(visuals.renderer2);

            visuals.renderer.setScissorTest(false);
            visuals.renderer.clear(true, true);
            visuals.renderer.setScissorTest(true);

            if (!effects.masking) {
                renderSceneInfo(sceneInfo1);
                renderSceneInfo(sceneInfo2);
                renderSceneInfo(sceneInfo3);
            }

            renderSceneInfo(sceneInfo4);

            requestAnimationFrame(render);
        }

        requestAnimationFrame(render);
        return sceneInfoArray;
    }

    const [sceneInfo1, sceneInfo2, sceneInfo3, sceneInfo4] = runVisuals();

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

    // Might be able to implement this object but I need a better understanding of how the divisionCounters are currently used first

    const divisionCounters = {
        section: 0,
        bar: 0,
        beat: 0,
        tatum: 0,
        segment: 0,
        _findNextDivision(trackDataDivision) {
            var i = 0;
            while (i < trackDataDivision.length) {
                if (trackDataDivision[i] > trackPosition) {
                    return i;
                }
                i++;
            }
        },
        updateDivisionCounters() {
            this.segment = this._findNextDivision(trackData.segmentsStart);
            this.tatum = findNextDivision(trackData.tatumsStart);
            this.beat = findNextDivision(trackData.beatsStart);
            this.bar = findNextDivision(trackData.barsStart);
            this.section =
                findNextDivision(trackData.sectionNearestBarStart) - 1;
        },
    };

    function findNextDivision(divisionNameStart, divisionCounter) {
        var i = 0;
        while (i < divisionNameStart.length) {
            if (divisionNameStart[i] > trackPosition) {
                divisionCounter = i;
                return divisionCounter;
            }
            i++;
        }
        return divisionNameStart.length;
    }

    function updateDivisionCounters() {
        segmentCounter = findNextDivision(
            trackData.segmentsStart,
            segmentCounter
        );
        tatumCounter = findNextDivision(trackData.tatumsStart, tatumCounter);
        beatCounter = findNextDivision(trackData.beatsStart, beatCounter);
        barCounter = findNextDivision(trackData.barsStart, barCounter);
        sectionCounter =
            findNextDivision(trackData.sectionNearestBarStart, sectionCounter) -
            1;
    }

    function checkForHits() {
        var syncCompensation = 0;

        if (
            elapsedTime + elapsedMilliseconds >=
            trackData.beatsStart[beatCounter] - syncCompensation
        ) {
            //console.log("New beat")
            if (sceneInfo2.physics.beatMomentum === -100) {
                //console.log("Beat")
                sceneInfo2.physics.beatMomentum = 100;
            } else {
                sceneInfo2.physics.beatMomentum = -100;
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
        }
        if (
            elapsedTime + elapsedMilliseconds >=
            trackData.barsStart[barCounter] - syncCompensation
        ) {
            barCounter++;
        }
        if (
            elapsedTime + elapsedMilliseconds >=
            trackData.tatumsStart[tatumCounter] - syncCompensation
        ) {
            tatumCounter++;
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
        if (paused === false) {
            startBetweenQueryTimer();
        } else if (paused === true) {
            stopBetweenQueryTimer();
        }
    }

    function startBetweenQueryTimer() {
        stopBetweenQueryTimer();

        elapsedMilliseconds = 0;
        initialDate = new Date();
        initialMilliseconds = initialDate.getTime();

        timerID = setInterval(() => {
            elapsedDate = new Date();
            elapsedMilliseconds = elapsedDate.getTime() - initialMilliseconds;
            checkForHits();
        }, 1);
    }

    function stopBetweenQueryTimer() {
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

    // Playback status updates
    player.addListener('player_state_changed', (state) => {
        if (!state) {
            stopBetweenQueryTimer();
            stopTrackPositionQuery();
            return;
        }

        startTrackPositionQuery();
        currentTrackID = state['track_window']['current_track']['id'];

        if (currentTrackID !== stored_track_id) return upDateToNewTrack(state);

        trackPosition = state['position'];
        elapsedTime = trackPosition;
        if (trackData !== undefined) {
            timerControl(state['paused']);
        }
    });

    function upDateToNewTrack(state) {
        trackPosition = 0;
        stored_track_id = currentTrackID;
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
                let newDimension = getNeoDimension(trackData.bars);
                sceneInfo3.resetParagraph(newDimension);
            })
            .then((res) => timerControl(state['paused']));
    }

    var trackPositionQuery;
    function startTrackPositionQuery() {
        var trackPositionQueryRate = 1000;
        // console.log('Querying... ⏩');

        trackPositionQuery = setInterval(() => {
            player.getCurrentState().then((state) => {
                if (!state) {
                    return;
                }
                trackPosition = state['position'];
                elapsedTime = trackPosition;
                if (!state['paused'] && trackData) {
                    updateDivisionCounters();
                    startBetweenQueryTimer();
                }
            });
        }, trackPositionQueryRate);
    }
    // startTrackPositionQuery()

    function stopTrackPositionQuery() {
        console.log('Not querying 🛑');
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
