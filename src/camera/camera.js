import * as THREE from "three";

export default class Camera {
    constructor(settings) {
        this.settings = settings;
        this.camera = new THREE.PerspectiveCamera(
            settings.fov,
            window.innerWidth / window.innerHeight,
            settings.near,
            settings.far,
        );

        this.camera.position.set(
            settings.position.x,
            settings.position.y,
            settings.position.z,
        );
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

    resize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
}
