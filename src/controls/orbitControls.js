import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default class CameraControls {
    constructor(camera, renderer, settings) {
        this.controls = new OrbitControls(
            camera,
            renderer.domElement
        );

        this.controls.enableDamping = true;
        this.controls.dampingFactor = settings.dampingFactor;
        this.controls.enableZoom = true;
        this.controls.enablePan = true;
        this.controls.enableRotate = true;
        this.controls.minDistance = settings.minDistance;
        this.controls.maxDistance = settings.maxDistance;
        this.controls.maxPolarAngle = settings.maxPolarAngle;
        this.controls.target.set(0, 0, 0);

        this.controls.update();
    }

    update() {
        this.controls.update();
    }

    dispose() {
        this.controls.dispose();
    }

    getControls() {
        return this.controls;
    }
}
