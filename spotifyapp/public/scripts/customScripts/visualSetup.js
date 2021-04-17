import { AnaglyphEffect } from 'https://unpkg.com/three@0.119.1/examples/jsm/effects/AnaglyphEffect.js';
import { EffectComposer } from 'https://unpkg.com/three@0.119.1/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.119.1//examples/jsm/postprocessing/RenderPass.js';
import { GlitchPass } from 'https://unpkg.com/three@0.119.1//examples/jsm/postprocessing/GlitchPass.js';
import { FilmPass } from 'https://unpkg.com/three@0.119.1//examples/jsm/postprocessing/FilmPass.js';
import { ShaderPass } from 'https://unpkg.com/three@0.119.1//examples/jsm/postprocessing/ShaderPass.js';
import { DotScreenPass } from 'https://unpkg.com/three@0.119.1//examples/jsm/postprocessing/DotScreenPass.js';
import { TexturePass } from 'https://unpkg.com/three@0.119.1//examples/jsm/postprocessing/TexturePass.js';
import { ClearPass } from 'https://unpkg.com/three@0.119.1//examples/jsm/postprocessing/ClearPass.js';
import {
    MaskPass,
    ClearMaskPass,
} from 'https://unpkg.com/three@0.119.1//examples/jsm/postprocessing/MaskPass.js';
import { CopyShader } from 'https://unpkg.com/three@0.119.1//examples/jsm/shaders/CopyShader.js';

const canvas = document.querySelector('#c');

const renderer2 = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
});

const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: false,
    antialias: true,
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer2.setPixelRatio(window.devicePixelRatio);

var composer1 = new EffectComposer(renderer);
var composer2 = new EffectComposer(renderer);
var composer3 = new EffectComposer(renderer);

var glitchPass = new GlitchPass();
glitchPass.enabled = false;
glitchPass.goWild = true;

var filmPass = new FilmPass(1, 1, 600, false);
filmPass.enabled = false;

var dotScreenPass = new DotScreenPass(new THREE.Vector2(0, 0), 0.75, 1);
dotScreenPass.enabled = false;

var analyglyphEffect = new AnaglyphEffect(renderer);
var analyglyphEffect2 = new AnaglyphEffect(renderer2);

export {
    renderer,
    renderer2,
    analyglyphEffect,
    analyglyphEffect2,
    composer1,
    composer2,
    composer3,
    glitchPass,
    filmPass,
    dotScreenPass,
};
