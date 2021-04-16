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

function setupScene1(planeDimension, planeStoredBackRow, composer) {
    const sceneInfo = makeScene(document.querySelector('#pitchplane'));
    var geometry = new THREE.PlaneGeometry(
        2,
        1,
        planeDimension - 1,
        planeDimension - 1
    );

    var material = new THREE.MeshBasicMaterial();
    var plane = new THREE.Mesh(geometry, material);
    for (var i = 0; i < planeDimension; i++) {
        plane.geometry.vertices[i].z = planeStoredBackRow[i];
    }

    var renderPass1 = new RenderPass(sceneInfo.scene, sceneInfo.camera);
    composer.addPass(renderPass1);
    composer.addPass(glitchPass);
    composer.addPass(filmPass);
    composer.addPass(dotScreenPass);

    sceneInfo.scene.add(plane);
    plane.material.wireframe = true;
    plane.rotation.set(-45, 0, 0);
    sceneInfo.camera.fov = 75;
    sceneInfo.mesh = plane;

    return sceneInfo;
}

export { makeScene, setupScene1 };
