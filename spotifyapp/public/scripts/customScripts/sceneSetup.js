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
import * as visuals from './visualSetup.js';
import * as utils from './utils.js';

function makeScene(elem) {
    const scene = new THREE.Scene();
    const fov = 45;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 0, 2);
    camera.lookAt(0, 0, 0);

    {
        const color = 0xffffff;
        const intensity = 0.5;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
    }

    return { scene, camera, elem };
}

function setupScene1() {
    const sceneInfo = makeScene(document.querySelector('#pitchplane'));
    var planeDimension = 12;
    sceneInfo.planeDimension = planeDimension;
    var planeBackRow = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var planeStoredBackRow = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    sceneInfo.planeBackRow = planeBackRow;
    sceneInfo.planeStoredBackRow = planeStoredBackRow;

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

    var flowing = true;

    function startPlaneFlow() {
        setInterval(function () {
            flowing = !flowing;
        }, 50);
    }

    startPlaneFlow();

    sceneInfo.animation = function () {
        var rowVertices = 143;
        var columnVertices = 131;

        if (sceneInfo.planeStoredBackrow === sceneInfo.planeBackrow) {
            //Decay effect
            for (var i = 0; i < sceneInfo.planeDimension; i++) {
                if (sceneInfo.mesh.geometry.vertices[i].z > 0) {
                    if (flowing === true) {
                        sceneInfo.mesh.geometry.vertices[i].z -= 0.0125;
                    } else {
                        sceneInfo.mesh.geometry.vertices[i].z += 0.0025;
                    }
                }
            }
        } else {
            sceneInfo.planeStoredBackrow = sceneInfo.planeBackrow;
            for (var i = 0; i < sceneInfo.planeDimension; i++) {
                sceneInfo.mesh.geometry.vertices[i].z =
                    sceneInfo.planeStoredBackrow[i];
            }
        }

        sceneInfo.mesh.geometry.verticesNeedUpdate = true;
        //Push backrow forward
        for (
            columnVertices;
            columnVertices >= 11;
            columnVertices -= sceneInfo.planeDimension
        ) {
            for (rowVertices; rowVertices > columnVertices; rowVertices--) {
                sceneInfo.mesh.geometry.vertices[rowVertices].z =
                    sceneInfo.mesh.geometry.vertices[
                        rowVertices - sceneInfo.planeDimension
                    ].z;
            }
        }
    };

    return sceneInfo;
}

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

    var beatLineMesh = new THREE.Mesh(beatLine.geometry, beatLineMaterial);

    sceneInfo.scene.add(beatLineMesh);
    sceneInfo.beatLineMaterial = beatLineMaterial;
    sceneInfo.beatLine = beatLine;
    sceneInfo.beatLineMesh = beatLineMesh;

    var beatLineArray = [];
    var beatLinePoints = [];

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
            sceneInfo.mesh.position.x = -sceneInfo.mesh.position.x * 0.7;

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

function setupScene4() {
    const canvas = document.querySelector('#c');

    const sceneInfo = makeScene(document.querySelector('#glitchdistort'));
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
    const bufferCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);

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

    var composer4 = new EffectComposer(visuals.renderer2, bufferTexture);
    sceneInfo.composer4 = composer4;
    var renderPass4 = new RenderPass(sceneInfo.bufferScene, sceneInfo.camera);
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

    var originalGeometry = JSON.parse(JSON.stringify(plane.geometry.vertices));

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

    sceneInfo.animation = function () {
        if (sculpture) {
            sceneInfo.sculpture.rotation.y += 0.01;
            flickerModel(sceneInfo.plane);
        }
    };
    return sceneInfo;
}

export { makeScene, setupScene1, setupScene2, setupScene4 };
