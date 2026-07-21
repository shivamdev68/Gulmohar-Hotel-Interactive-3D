import * as THREE from "three";

export default class Lights {
    constructor(scene) {
        this.scene = scene;

        // Ambient Light
        this.ambientLight = new THREE.AmbientLight(
            0xffffff,
            0.6
        );

        // Directional Light (Sun)
        this.directionalLight = new THREE.DirectionalLight(
            0xffffff,
            2
        );

        this.directionalLight.position.set(10, 20, 10);

        this.directionalLight.castShadow = true;

        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;

        this.directionalLight.shadow.camera.near = 0.5;
        this.directionalLight.shadow.camera.far = 100;

        scene.add(this.ambientLight);
        scene.add(this.directionalLight);
    }

    getAmbientLight() {
        return this.ambientLight;
    }

    getDirectionalLight() {
        return this.directionalLight;
    }
}