<template>
    <canvas ref="canvasRef" className="webgl"></canvas>
</template>

<script setup lang="ts">
import * as THREE from "three";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { AudioSegment, TimeInterval } from 'spotify-types';
import { usePlayerStore } from "~~/store/PlayerStore";
import { storeToRefs } from "pinia";


// Step 1: Set up the Three.js scene and camera.

const playerStore = usePlayerStore();
const { speedTop, speedBottom } = storeToRefs(playerStore);



const currentBeat: Ref<TimeInterval | null> = ref(null)

const lastBeat = ref(0)

const heightMap = "/img/displacement.png";
const gridMap = "/img/griddark.png";
const shineMap = "/img/shine.png";

const canvasRef = ref(null);
const spotlightIntensity = ref(10);
const spotlightColor = ref("#7a1fc4");

onMounted(() => {
    const sync = useSync();

    // Canvas
    if (!canvasRef.value) {
        throw new Error("Missing canvas");
    }
    const canvas = canvasRef.value as HTMLCanvasElement;
    const scene = new THREE.Scene();
    const fog = new THREE.Fog("#000000", 1, 2.5);
    scene.fog = fog;

    // Textures
    const textureLoader = new THREE.TextureLoader();
    const gridTexture = textureLoader.load(gridMap);
    const heightTexture = textureLoader.load(heightMap);
    const metalnessTexture = textureLoader.load(shineMap);

    // Plane
    const parameters = {
        displacementScale: 0.4,
        metalness: 1,
        roughness: 0.5,
    };

    const geometry = new THREE.PlaneGeometry(1, 2, 24, 24);
    const material = new THREE.MeshStandardMaterial({
        map: gridTexture,
        displacementMap: heightTexture,
        displacementScale: parameters.displacementScale,
        metalness: parameters.metalness,
        metalnessMap: metalnessTexture,
        roughness: parameters.roughness,
    });
    const plane = new THREE.Mesh(geometry, material);
    const plane2 = new THREE.Mesh(geometry, material);

    plane.rotation.x = -Math.PI * 0.5;
    plane2.rotation.x = -Math.PI * 0.5;

    plane.position.y = 0.0;
    plane.position.z = 0.15;
    plane2.position.y = 0.0;
    plane2.position.z = -1.85;
    scene.add(plane);
    scene.add(plane2);

    // Lights
    const ambientLight = new THREE.AmbientLight("#ffffff", 10);
    scene.add(ambientLight);

    const spotlight = new THREE.SpotLight(
        "#7a1fc4",
        spotlightIntensity.value,
        25,
        Math.PI * 0.1,
        0.25
    );
    spotlight.position.set(0.5, 0.75, 2.1);
    spotlight.target.position.x = -0.25;
    spotlight.target.position.y = 0.25;
    spotlight.target.position.z = 0.25;
    scene.add(spotlight);
    scene.add(spotlight.target);

    const spotlight2 = new THREE.SpotLight(
        "#7a1fc4",
        spotlightIntensity.value,
        25,
        Math.PI * 0.1,
        0.25
    );
    spotlight2.position.set(-0.5, 0.75, 2.1);
    spotlight2.target.position.x = 0.25;
    spotlight2.target.position.y = 0.25;
    spotlight2.target.position.z = 0.25;
    scene.add(spotlight2);
    scene.add(spotlight2.target);

    // Sizes
    const sizes = {
        width: window.innerWidth,
        height: window.innerHeight,
    };

    // Base camera
    const camera = new THREE.PerspectiveCamera(
        75,
        sizes.width / sizes.height,
        0.01,
        20
    );
    camera.position.x = 0;
    camera.position.y = 0.06;
    camera.position.z = 1.1;

    scene.add(camera);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Post-processing
    const effectComposer = new EffectComposer(renderer);
    effectComposer.setSize(sizes.width, sizes.height);
    effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const renderPass = new RenderPass(scene, camera);
    effectComposer.addPass(renderPass);

    const rgbShiftPass = new ShaderPass(RGBShiftShader);
    rgbShiftPass.uniforms["amount"].value = 0.001;
    effectComposer.addPass(rgbShiftPass);
    const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
    effectComposer.addPass(gammaCorrectionPass);


    const resolution = new THREE.Vector2(
        window.innerWidth * window.devicePixelRatio,
        window.innerHeight * window.devicePixelRatio
        )
    const strength = 0.2;
    const radius = 0.5;
    const threshold = 0.1;

    const bloomPass = new UnrealBloomPass(resolution, strength, radius, threshold);


    effectComposer.addPass(bloomPass);

    // Resize handler
    window.addEventListener("resize", () => {
      // Update sizes
        sizes.width = window.innerWidth;
        sizes.height = window.innerHeight;

        // Update camera
        camera.aspect = sizes.width / sizes.height;
        camera.updateProjectionMatrix();
        // camera.fog;

        // Update renderer
        renderer.setSize(sizes.width, sizes.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        effectComposer.setSize(sizes.width, sizes.height);
        effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    // Animation
    const clock = new THREE.Clock();

    sync.on('bars', (beat: TimeInterval) => {
        const colors = [
            "#7a1fc4",
            "#f7f7f7",
            "#c4c4c4",
            "#41a9f7",
        ]
        spotlightColor.value = colors[Math.floor(Math.random() * colors.length)]
    });

    sync.on('beats', (beat: TimeInterval) => {
        lastBeat.value = Date.now()
        currentBeat.value = beat;
    })

    const beatPulse = () => {
        if (!currentBeat.value) return;
        const now = Date.now();
        const timeSinceLastBeat = now - lastBeat.value;
        const progress = timeSinceLastBeat / (currentBeat.value.duration*1000);
        console.log(progress)
        spotlightIntensity.value = speedTop.value - Math.min(progress * speedTop.value, speedBottom.value);
    };



    sync.animateFrame(() => {
        beatPulse();
        spotlight.intensity = spotlightIntensity.value;
        spotlight2.intensity = spotlightIntensity.value;
        spotlight.color = new THREE.Color(spotlightColor.value);
        spotlight2.color = new THREE.Color(spotlightColor.value);
        const elapsedTime = clock.getElapsedTime();

        // Update plane position
        plane.position.z = (elapsedTime * 0.15) % 2;
        plane2.position.z = ((elapsedTime * 0.15) % 2) - 2;

        // Render
        effectComposer.render();

    });
})




</script>



<style lang="">

</style>