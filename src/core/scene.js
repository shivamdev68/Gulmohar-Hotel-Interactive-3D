import * as THREE from "three";

export default class Scene {
    constructor() {
        this.scene = new THREE.Scene();

        // Background color
        this.scene.background = new THREE.Color(0xf5f5f5);

        // Optional fog for depth perception
        this.scene.fog = new THREE.Fog(0xf5f5f5, 40, 150);
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