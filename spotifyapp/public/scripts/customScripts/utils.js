function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function updateScenePhysics(sceneInfo) {
    const physics = sceneInfo.physics;
    physics.acceleration =
        800 / (physics.beatMomentum - sceneInfo.mesh.position.y);

    if (isFinite(physics.acceleration) !== true) {
        physics.acceleration = 0;
        physics.velocity *= 0.7;
    } else if (
        sceneInfo.mesh.position.y > physics.beatMomentum - physics.range &&
        sceneInfo.mesh.position.y < physics.beatMomentum + physics.range
    ) {
        physics.acceleration = 0;
        physics.velocity *= 0.7;
    }

    physics.velocity += physics.acceleration;
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

export { getRandomInt, updateScenePhysics, updateSceneFrustum };
