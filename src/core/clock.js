import * as THREE from "three";

export default class Clock {
    constructor() {
        this.clock = new THREE.Clock();
    }

    getDelta() {
        return this.clock.getDelta();
    }

    getElapsedTime() {
        return this.clock.getElapsedTime();
    }
}