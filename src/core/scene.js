import * as THREE from "three";

export default class Scene {
    constructor(settings) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(settings.backgroundColor);
        this.scene.fog = new THREE.Fog(
            settings.backgroundColor,
            settings.fog.near,
            settings.fog.far,
        );
    }

    getScene() {
        return this.scene;
    }

    add(object) {
        this.scene.add(object);
    }

    remove(object) {
        this.scene.remove(object);
    }

    clear() {
        this.scene.clear();
    }
}
