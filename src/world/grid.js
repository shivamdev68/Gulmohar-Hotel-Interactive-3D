import * as THREE from "three";

export default class Grid {
    constructor(scene, settings) {
        this.grid = new THREE.GridHelper(
            settings.gridSize,
            settings.gridDivisions,
            0x888888,
            0xcccccc
        );

        scene.add(this.grid);
    }

    getGrid() {
        return this.grid;
    }

    setVisible(visible) {
        this.grid.visible = visible;
    }
}
