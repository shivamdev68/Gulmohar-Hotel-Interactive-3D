import * as THREE from "three";

export default class Camera {
    constructor() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        // Initial camera position
        this.camera.position.set(8, 6, 10);

        // Look toward the center of the scene
        this.camera.lookAt(0, 0, 0);
    }

    getCamera() {
        return this.camera;
    }

    setPosition(x, y, z) {
        this.camera.position.set(x, y, z);
    }

    lookAt(x, y, z) {
        this.camera.lookAt(x, y, z);
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }
}