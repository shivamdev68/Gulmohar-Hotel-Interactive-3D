import * as THREE from "three";

export default class Renderer {
    constructor() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });

        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        document.body.appendChild(this.renderer.domElement);
    }

    getRenderer() {
        return this.renderer;
    }

    render(scene, camera) {
        this.renderer.render(scene, camera);
    }

    resize(camera) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        this.renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

        this.renderer.setPixelRatio(
            Math.min(window.devicePixelRatio, 2)
        );
    }

    dispose() {
        this.renderer.dispose();
    }
}