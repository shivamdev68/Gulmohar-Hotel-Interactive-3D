import * as THREE from "three";

export default class Lights {
    constructor(scene, settings) {
        this.scene = scene;

        this.ambientLight = new THREE.AmbientLight(0xffffff, settings.ambientIntensity);

        this.directionalLight = new THREE.DirectionalLight(0xffffff, settings.directionalIntensity);

        this.directionalLight.position.set(
            settings.directionalPosition.x,
            settings.directionalPosition.y,
            settings.directionalPosition.z,
        );

        this.directionalLight.castShadow = true;

        this.directionalLight.shadow.mapSize.set(settings.shadowMapSize, settings.shadowMapSize);

        this.directionalLight.shadow.camera.near = settings.shadowCameraNear;
        this.directionalLight.shadow.camera.far = settings.shadowCameraFar;

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
