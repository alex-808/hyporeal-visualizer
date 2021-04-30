import { songData } from './songData.js';
import {
    setupScene1,
    setupScene2,
    setupScene3,
    setupScene4,
} from './sceneSetup.js';
import * as utils from './utils.js';
import * as visuals from './visualSetup.js';

window.addEventListener('beforeunload', function (event) {
    fetch('./session_destroy', {
        method: 'POST',
    });
});

window.onSpotifyWebPlaybackSDKReady = () => {
    function runVisuals() {
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

        function handleEvents() {
            if (!trackData) return;

            if (newHits.song) {
                newHits.song = false;
                effects.checkForUndoFader = true;
            }

            if (effects.distortModelBars < 1) {
                effects.canUndistortModel = true;
            }
            if (effects.checkForUndoFader === true) {
                undoFader(analglyphBarLength);
            }
            if (effects.maskingBars < 1 && effects.masking === true) {
                effects.masking = false;
                setTimeout(function () {
                    undoScreenChange();
                }, 2000);
            }

            if (newHits.beat) {
                newHits.beat = false;

                sceneInfo2.physics.beatMomentum =
                    sceneInfo2.physics.beatMomentum === -100 ? 100 : -100;

                if (effects.glitchTheBar > 0) {
                    effects.glitchTheBar--;
                    distortModel(sceneInfo4.plane);
                }
            }
            if (newHits.bar) {
                newHits.bar = false;
                effects.distortModelBars--;
                effects.maskingBars--;
                distortModel(sceneInfo4.plane);
                sceneInfo3.addCharToParagraph();
                sceneInfo3.trimParagraph();
                if (utils.getRandomInt(4) === 0) {
                    totalFader();
                }

                if (utils.getRandomInt(4) === 0) {
                    effects.glitchTheBar = 4;
                }
            }
            if (newHits.segment) {
                newHits.segment = false;

                // Update Scene 1 Backrow
                sceneInfo1.planeBackrow =
                    trackData.segments[segmentCounter]['pitches'];

                calcTimbreSums();
                sceneInfo3.addPointToStroke(barCounter);
            }

            if (newHits.section) {
                newHits.section = false;
                // console.log('new section 2', Date.now());
            }

            if (newHits.newSectOnNextBeat) {
                newHits.newSectOnNextBeat = false;
                newHits.newSectBeatHandled = true;

                if (utils.getRandomInt(2) === 0) {
                    console.log('glitch reset disabled');
                    effects.canUndistortModel = false;
                    effects.distortModelBars = 4;
                }
            }
            if (newHits.newSectOnNextBar) {
                newHits.newSectOnNextBar = false;
                newHits.newSectBarHandled = true;
                console.log('new Section next bar 2', Date.now());
                getSectionEffect(10);
                sceneInfo3.addSectionPlane(barCounter);
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
            handleEvents();
            sceneInfo1.animation();
            sceneInfo2.animation();
            sceneInfo3.animation();

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

    const newHits = {
        song: false,
        beat: false,
        section: false,
        bar: false,
        tatum: false,
        segment: false,
        newSectOnNextBeat: false,
        newSectOnNextBar: false,
        newSectBeatHandled: false,
        newSectBarHandled: false,
    };

    function checkForHits() {
        var syncCompensation = 0;

        if (
            elapsedTime + elapsedMilliseconds >=
            trackData.beatsStart[beatCounter] - syncCompensation
        ) {
            newHits.beat = true;
            beatCounter++;
        }

        if (
            elapsedTime + elapsedMilliseconds >=
            trackData.sectionNearestBarStart[sectionCounter + 1] -
                syncCompensation
        ) {
            newHits.section = true;
            newHits.newSectBeatHandled = false;
            newHits.newSectBarHandled = false;
            sectionCounter++;
        }
        if (
            elapsedTime + elapsedMilliseconds >=
            trackData.barsStart[barCounter] - syncCompensation
        ) {
            newHits.bar = true;
            barCounter++;
        }
        if (
            elapsedTime + elapsedMilliseconds >=
            trackData.tatumsStart[tatumCounter] - syncCompensation
        ) {
            newHits.tatum = true;
            tatumCounter++;
        }

        if (
            elapsedTime + elapsedMilliseconds >=
            trackData.segmentsStart[segmentCounter] - syncCompensation
        ) {
            newHits.segment = true;
            segmentCounter++;
        }

        sectionLookahead();
    }

    function sectionLookahead() {
        const nextSectionStart =
            trackData.sectionNearestBarStart[sectionCounter + 1];
        const nextBeatStart = trackData.beatsStart[beatCounter + 1];
        if (nextSectionStart === nextBeatStart && !newHits.newSectBeatHandled) {
            newHits.newSectOnNextBeat = true;
        }
        if (
            (nextSectionStart === trackData.barsStart[barCounter]) &
            !newHits.newSectBarHandled
        ) {
            newHits.newSectOnNextBar = true;
        }
    }
    function calcTimbreSums() {
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

        sceneInfo3.timbreSum1 = firstHalf.reduce((acc, val) => (acc *= val));
        sceneInfo3.timbreSum2 = secondHalf.reduce((acc, val) => (acc *= val));
        if (sceneInfo3.timbreSum1 > 0) {
            var negative = false;
        } else {
            var negative = true;
        }
        sceneInfo3.timbreSum1 = sceneInfo3.timbreSum1.toString();
        sceneInfo3.timbreSum1 = negative
            ? parseInt(sceneInfo3.timbreSum1[1]) * -1
            : parseInt(sceneInfo3.timbreSum1[1]);

        if (sceneInfo3.timbreSum2 > 0) {
            var negative = false;
        } else {
            var negative = true;
        }
        sceneInfo3.timbreSum2 = sceneInfo3.timbreSum2.toString();
        sceneInfo3.timbreSum2 = negative
            ? parseInt(sceneInfo3.timbreSum2[1]) * -1
            : parseInt(sceneInfo3.timbreSum2[1]);

        sceneInfo3.timbreSum1 = Math.ceil(sceneInfo3.timbreSum1 * 0.4);
        sceneInfo3.timbreSum2 = Math.ceil(sceneInfo3.timbreSum2 * 0.4);
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
        newHits.song = true;

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
                console.log(newDimension);
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
