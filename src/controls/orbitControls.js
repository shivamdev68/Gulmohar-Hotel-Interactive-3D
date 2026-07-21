import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default class CameraControls {
    constructor(camera, renderer) {
        this.controls = new OrbitControls(
            camera,
            renderer.domElement
        );

        // Smooth camera movement
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Zoom
        this.controls.enableZoom = true;

        // Pan
        this.controls.enablePan = true;

        // Rotate
        this.controls.enableRotate = true;

        // Camera limits
        this.controls.minDistance = 3;
        this.controls.maxDistance = 80;

        // Vertical rotation limits
        this.controls.maxPolarAngle = Math.PI / 2;

        // Focus point
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