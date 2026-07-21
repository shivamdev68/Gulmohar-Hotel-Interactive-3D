import * as THREE from "three";

export default class Renderer {
    constructor(settings, container) {
        this.renderer = new THREE.WebGLRenderer({
            antialias: settings.antialias,
        });

        this.pixelRatio = settings.pixelRatio;
        this.renderer.setPixelRatio(this.pixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.renderer.shadowMap.enabled = settings.shadows;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        container.appendChild(this.renderer.domElement);
    }

    getRenderer() {
        return this.renderer;
    }

    render(scene, camera) {
        this.renderer.render(scene, camera);
    }

    resize(width, height) {
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(this.pixelRatio);
    }

    dispose() {
        this.renderer.dispose();
    }
}
