import * as THREE from 'three';

export default class Axes {
    constructor(scene, size) {
        this.axes = new THREE.AxesHelper(size);
        scene.add(this.axes);
    }

    getAxes() {
        return this.axes;
    }

    setVisible(visible) {
        this.axes.visible = visible;
    }
}
